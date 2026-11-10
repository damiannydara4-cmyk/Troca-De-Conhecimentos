import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "./firebase.js";
import { enviarMensagem, garantirConversa } from "./chatService.js";

/* ---------------------------------------------------------------------------
   Status de uma solicitação (campo "status" do documento em "exchanges")

   pendente  -> acabou de ser criada, aguardando resposta do destinatário
   aceita    -> o destinatário aceitou; a troca está combinada/em andamento
   recusada  -> o destinatário recusou (FINAL)
   cancelada -> quem pediu desistiu enquanto estava pendente (FINAL)
   concluida -> a troca aconteceu (FINAL)

   Transições permitidas (qualquer outra é bloqueada no app E nas regras):
     pendente -> aceita      (só o destinatário)
     pendente -> recusada    (só o destinatário)
     pendente -> cancelada   (só quem solicitou)
     aceita   -> concluida   (qualquer um dos dois participantes)
--------------------------------------------------------------------------- */
export const STATUS = {
  pendente: "pendente",
  aceita: "aceita",
  recusada: "recusada",
  cancelada: "cancelada",
  concluida: "concluida",
};

export const ROTULO_STATUS = {
  pendente: "Pendente",
  aceita: "Aceita",
  recusada: "Recusada",
  cancelada: "Cancelada",
  concluida: "Concluída",
};

export const STATUS_ATIVOS = [STATUS.pendente, STATUS.aceita];
export const STATUS_HISTORICO = [STATUS.concluida, STATUS.recusada, STATUS.cancelada];

const paraMs = (timestamp) => timestamp?.toMillis?.() ?? 0;

function montarTroca(d) {
  // "estimate": enquanto o servidor não confirma a data, usa a hora do aparelho (a tela não "pula")
  const x = d.data({ serverTimestamps: "estimate" });
  return {
    id: d.id,
    solicitanteId: x.solicitanteId,
    solicitanteNome: x.solicitanteNome,
    destinatarioId: x.destinatarioId,
    destinatarioNome: x.destinatarioNome,
    conhecimentoDesejadoId: x.conhecimentoDesejadoId,
    conhecimentoDesejadoTitulo: x.conhecimentoDesejadoTitulo,
    conhecimentoOferecidoId: x.conhecimentoOferecidoId,
    conhecimentoOferecidoTitulo: x.conhecimentoOferecidoTitulo,
    status: x.status,
    criadoEmMs: paraMs(x.criadoEm),
    atualizadoEmMs: paraMs(x.atualizadoEm),
    respondidaEmMs: paraMs(x.respondidaEm),
    canceladaEmMs: paraMs(x.canceladaEm),
    concluidaEmMs: paraMs(x.concluidaEm),
  };
}

/* Ids dos conhecimentos que EU já pedi e que ainda estão em andamento (pendente/aceita).
   A tela Conhecimentos usa isto para mostrar "✓ Troca solicitada". */
export async function listarIdsSolicitadosAtivos(usuarioId) {
  const resultado = await getDocs(
    query(collection(db, "exchanges"), where("solicitanteId", "==", usuarioId))
  );
  return resultado.docs
    .map((d) => d.data())
    .filter((t) => STATUS_ATIVOS.includes(t.status))
    .map((t) => t.conhecimentoDesejadoId);
}

/* Cria uma solicitação. "desejado" é o conhecimento do OUTRO que eu quero;
   "oferecido" é um conhecimento MEU que ofereço em troca. */
export async function criarSolicitacao(usuario, { desejado, oferecido, mensagemInicial }) {
  if (!usuario?.id) throw new Error("Você precisa estar logado.");
  if (!desejado || !oferecido) throw new Error("Escolha o conhecimento que você oferece em troca.");
  if (desejado.donoId === usuario.id) {
    throw new Error("Você não pode solicitar uma troca com você mesmo.");
  }
  if (oferecido.donoId !== usuario.id) {
    throw new Error("O conhecimento oferecido precisa ser um dos seus.");
  }

  // Evita duplicata: já existe um pedido meu, ainda em andamento, para este mesmo conhecimento?
  const existentes = await getDocs(
    query(
      collection(db, "exchanges"),
      where("solicitanteId", "==", usuario.id),
      where("conhecimentoDesejadoId", "==", desejado.id)
    )
  );
  if (existentes.docs.some((d) => STATUS_ATIVOS.includes(d.data().status))) {
    throw new Error("Você já tem uma solicitação em andamento para este conhecimento.");
  }

  const referencia = await addDoc(collection(db, "exchanges"), {
    solicitanteId: usuario.id,
    solicitanteNome: usuario.nome,
    destinatarioId: desejado.donoId,
    destinatarioNome: desejado.autor,
    conhecimentoDesejadoId: desejado.id,
    conhecimentoDesejadoTitulo: desejado.titulo,
    conhecimentoOferecidoId: oferecido.id,
    conhecimentoOferecidoTitulo: oferecido.titulo,
    status: STATUS.pendente,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });

  // Mensagem inicial (opcional): vira a primeira mensagem da conversa desta troca.
  // Se falhar, a solicitação já foi criada: só avisamos que a mensagem não seguiu.
  let mensagemEnviada = true;
  const texto = (mensagemInicial || "").trim();
  if (texto) {
    try {
      const troca = {
        id: referencia.id,
        solicitanteId: usuario.id,
        solicitanteNome: usuario.nome,
        destinatarioId: desejado.donoId,
        destinatarioNome: desejado.autor,
        conhecimentoDesejadoTitulo: desejado.titulo,
        conhecimentoOferecidoTitulo: oferecido.titulo,
      };
      await garantirConversa(troca);
      await enviarMensagem(
        { id: referencia.id, outroId: desejado.donoId },
        usuario,
        texto
      );
    } catch (err) {
      console.error("Solicitação criada, mas a mensagem inicial falhou:", err);
      mensagemEnviada = false;
    }
  }

  return { id: referencia.id, mensagemEnviada };
}

/* Escuta, em tempo real, TODAS as trocas em que eu participo (enviadas + recebidas).
   São duas consultas simples (sem índice composto) juntadas aqui no código.
   Devolve a função que encerra os dois listeners. */
export function observarTrocas(usuarioId, aoMudar, aoErro) {
  const enviadas = new Map();
  const recebidas = new Map();
  let prontos = 0; // só avisa a tela depois que as DUAS consultas responderam

  const emitir = () => {
    if (prontos < 2) return;
    const todas = new Map([...enviadas, ...recebidas]);
    aoMudar([...todas.values()].sort((a, b) => b.atualizadoEmMs - a.atualizadoEmMs));
  };

  const escutar = (campo, destino) => {
    let primeira = true;
    return onSnapshot(
      query(collection(db, "exchanges"), where(campo, "==", usuarioId)),
      (snapshot) => {
        destino.clear();
        snapshot.docs.forEach((d) => destino.set(d.id, montarTroca(d)));
        if (primeira) {
          primeira = false;
          prontos += 1;
        }
        emitir();
      },
      aoErro
    );
  };

  const cancelarEnviadas = escutar("solicitanteId", enviadas);
  const cancelarRecebidas = escutar("destinatarioId", recebidas);

  return () => {
    cancelarEnviadas();
    cancelarRecebidas();
  };
}

/* Escuta UMA troca (usada no topo da tela de chat para mostrar o status). */
export function observarTroca(trocaId, aoMudar, aoErro) {
  return onSnapshot(
    doc(db, "exchanges", trocaId),
    (snapshot) => aoMudar(snapshot.exists() ? montarTroca(snapshot) : null),
    aoErro
  );
}

/* Quem pode fazer o quê, e de qual status para qual (espelha as regras do Firestore) */
const ACOES = {
  aceitar:  { de: [STATUS.pendente], para: STATUS.aceita,     quem: "destinatarioId", campoData: "respondidaEm" },
  recusar:  { de: [STATUS.pendente], para: STATUS.recusada,   quem: "destinatarioId", campoData: "respondidaEm" },
  cancelar: { de: [STATUS.pendente], para: STATUS.cancelada,  quem: "solicitanteId",  campoData: "canceladaEm" },
  concluir: { de: [STATUS.aceita],   para: STATUS.concluida,  quem: "ambos",          campoData: "concluidaEm" },
};

/* Aplica uma ação usando uma TRANSAÇÃO: lê o status mais recente e só então altera.
   Assim, se a outra pessoa mudou algo um segundo antes, a ação é recusada com uma mensagem clara. */
async function aplicarAcao(acao, trocaId, usuarioId) {
  const regra = ACOES[acao];
  const referencia = doc(db, "exchanges", trocaId);

  await runTransaction(db, async (transacao) => {
    const snapshot = await transacao.get(referencia);
    if (!snapshot.exists()) throw new Error("Solicitação não encontrada.");

    const troca = snapshot.data();
    const participante = troca.solicitanteId === usuarioId || troca.destinatarioId === usuarioId;
    const autorizado = regra.quem === "ambos" ? participante : troca[regra.quem] === usuarioId;

    if (!autorizado) throw new Error("Você não tem permissão para fazer isso nesta solicitação.");
    if (!regra.de.includes(troca.status)) {
      throw new Error(
        `Esta solicitação está "${ROTULO_STATUS[troca.status]}" e não pode mais ser alterada assim.`
      );
    }

    transacao.update(referencia, {
      status: regra.para,
      [regra.campoData]: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    });
  });
}

export const aceitarSolicitacao = (trocaId, usuarioId) => aplicarAcao("aceitar", trocaId, usuarioId);
export const recusarSolicitacao = (trocaId, usuarioId) => aplicarAcao("recusar", trocaId, usuarioId);
export const cancelarSolicitacao = (trocaId, usuarioId) => aplicarAcao("cancelar", trocaId, usuarioId);
export const concluirTroca = (trocaId, usuarioId) => aplicarAcao("concluir", trocaId, usuarioId);