import {
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase.js";

/* Estrutura no Firestore:
   conversations/{id}                  -> uma conversa (o id é o MESMO id da troca: 1 troca = 1 conversa)
   conversations/{id}/messages/{msgId} -> as mensagens daquela conversa */

export const LIMITE_MENSAGEM = 2000;

const paraMs = (timestamp) => timestamp?.toMillis?.() ?? 0;

/* Converte o documento do Firestore no objeto que as telas usam.
   Já calcula quem é "o outro" participante e quantas mensagens NÃO lidas EU tenho. */
function montarConversa(d, usuarioId) {
  const x = d.data({ serverTimestamps: "estimate" });
  const outroId = x.participantes.find((id) => id !== usuarioId);
  return {
    id: d.id,
    exchangeId: x.exchangeId,
    assunto: x.assunto ?? "",
    outroId,
    outroNome: x.participantesNomes?.[outroId] ?? "Usuário",
    naoLidas: x.naoLidas?.[usuarioId] ?? 0,
    ultimaMensagem: x.ultimaMensagem
      ? {
          texto: x.ultimaMensagem.texto,
          remetenteId: x.ultimaMensagem.remetenteId,
          criadoEmMs: paraMs(x.ultimaMensagem.criadoEm),
        }
      : null,
    atualizadoEmMs: paraMs(x.atualizadoEm),
  };
}

function montarMensagem(d) {
  const x = d.data({ serverTimestamps: "estimate" });
  return {
    id: d.id,
    conversaId: x.conversaId,
    remetenteId: x.remetenteId,
    texto: x.texto,
    lida: x.lida === true,
    criadoEmMs: paraMs(x.criadoEm),
  };
}

/* Cria a conversa da troca se ela ainda não existir (e não faz nada se já existir).
   Usamos uma transação para que, se os dois usuários clicarem ao mesmo tempo,
   só UMA conversa seja criada. O id da conversa = id da troca, então duplicar é impossível. */
export async function garantirConversa(troca) {
  const referencia = doc(db, "conversations", troca.id);

  await runTransaction(db, async (transacao) => {
    const existente = await transacao.get(referencia);
    if (existente.exists()) return;

    transacao.set(referencia, {
      participantes: [troca.solicitanteId, troca.destinatarioId],
      participantesNomes: {
        [troca.solicitanteId]: troca.solicitanteNome,
        [troca.destinatarioId]: troca.destinatarioNome,
      },
      exchangeId: troca.id,
      assunto: `${troca.conhecimentoOferecidoTitulo} ⇄ ${troca.conhecimentoDesejadoTitulo}`,
      naoLidas: { [troca.solicitanteId]: 0, [troca.destinatarioId]: 0 },
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    });
  });

  return troca.id;
}

/* Escuta (em tempo real) as conversas de quem está logado.
   Devolve a função que ENCERRA o listener: chame-a no "return" do useEffect.
   A ordenação (mais recente primeiro) é feita aqui no código, assim não precisa de índice. */
export function observarConversas(usuarioId, aoMudar, aoErro) {
  const consulta = query(
    collection(db, "conversations"),
    where("participantes", "array-contains", usuarioId)
  );

  return onSnapshot(
    consulta,
    (snapshot) => {
      const lista = snapshot.docs
        .map((d) => montarConversa(d, usuarioId))
        .sort((a, b) => b.atualizadoEmMs - a.atualizadoEmMs);
      aoMudar(lista);
    },
    aoErro
  );
}

/* Escuta as mensagens de UMA conversa, da mais antiga para a mais nova. */
export function observarMensagens(conversaId, aoMudar, aoErro) {
  const consulta = query(
    collection(db, "conversations", conversaId, "messages"),
    orderBy("criadoEm", "asc")
  );

  return onSnapshot(consulta, (snapshot) => aoMudar(snapshot.docs.map(montarMensagem)), aoErro);
}

/* Envia uma mensagem. Num único "lote" (tudo ou nada) o app:
   1) grava a mensagem; 2) atualiza a prévia da conversa e soma +1 nas não lidas do OUTRO. */
export async function enviarMensagem(conversa, usuario, texto) {
  const limpo = (texto || "").trim();
  if (!limpo) throw new Error("Digite uma mensagem.");
  if (limpo.length > LIMITE_MENSAGEM) {
    throw new Error(`A mensagem pode ter no máximo ${LIMITE_MENSAGEM} caracteres.`);
  }

  const lote = writeBatch(db);
  const novaMensagem = doc(collection(db, "conversations", conversa.id, "messages"));

  lote.set(novaMensagem, {
    conversaId: conversa.id,
    remetenteId: usuario.id,
    texto: limpo,
    lida: false,
    criadoEm: serverTimestamp(),
  });

  lote.update(doc(db, "conversations", conversa.id), {
    ultimaMensagem: {
      texto: limpo.slice(0, 120),
      remetenteId: usuario.id,
      criadoEm: serverTimestamp(),
    },
    [`naoLidas.${conversa.outroId}`]: increment(1),
    atualizadoEm: serverTimestamp(),
  });

  await lote.commit();
  return novaMensagem.id;
}

/* Marca como lidas as mensagens RECEBIDAS (ids) e zera o meu contador.
   Quem chama já filtra: nunca passamos mensagens que EU enviei. */
export async function marcarComoLidas(conversaId, usuarioId, mensagensIds) {
  const lote = writeBatch(db);

  mensagensIds.slice(0, 400).forEach((id) => {
    lote.update(doc(db, "conversations", conversaId, "messages", id), {
      lida: true,
      lidaEm: serverTimestamp(),
    });
  });

  lote.update(doc(db, "conversations", conversaId), { [`naoLidas.${usuarioId}`]: 0 });

  await lote.commit();
}