import {
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
import { STATUS } from "./trocaService.js";

/* Estrutura no Firestore:
   reviews/{trocaId}_{avaliadorId}
   O id junta "a troca" + "quem avalia". Como cada id só existe uma vez, é IMPOSSÍVEL
   a mesma pessoa avaliar a mesma troca duas vezes. Cada troca concluída gera, no máximo,
   2 avaliações: uma de cada participante sobre o outro. */

export const NOTA_MINIMA = 1;
export const NOTA_MAXIMA = 5;
export const LIMITE_COMENTARIO = 500;

const paraMs = (timestamp) => timestamp?.toMillis?.() ?? 0;

function montarAvaliacao(d) {
  const x = d.data({ serverTimestamps: "estimate" });
  return {
    id: d.id,
    exchangeId: x.exchangeId,
    avaliadorId: x.avaliadorId,
    avaliadorNome: x.avaliadorNome,
    avaliadoId: x.avaliadoId,
    avaliadoNome: x.avaliadoNome,
    assunto: x.assunto ?? "",
    nota: x.nota,
    comentario: x.comentario ?? "",
    criadoEmMs: paraMs(x.criadoEm),
  };
}

/* O id da avaliação: o MESMO cálculo é feito nas regras do Firestore */
export const idDaAvaliacao = (trocaId, avaliadorId) => `${trocaId}_${avaliadorId}`;

/* Registra a avaliação que EU faço sobre a outra pessoa de uma troca CONCLUÍDA. */
export async function criarAvaliacao(usuario, troca, { nota, comentario }) {
  if (!usuario?.id) throw new Error("Você precisa estar logado.");
  if (troca.status !== STATUS.concluida) {
    throw new Error("Só é possível avaliar depois que a troca estiver concluída.");
  }

  const souSolicitante = troca.solicitanteId === usuario.id;
  const souDestinatario = troca.destinatarioId === usuario.id;
  if (!souSolicitante && !souDestinatario) {
    throw new Error("Só quem participou da troca pode avaliá-la.");
  }

  if (!Number.isInteger(nota) || nota < NOTA_MINIMA || nota > NOTA_MAXIMA) {
    throw new Error("Escolha uma nota de 1 a 5 estrelas.");
  }

  const comentarioLimpo = (comentario || "").trim();
  if (comentarioLimpo.length > LIMITE_COMENTARIO) {
    throw new Error(`O comentário pode ter no máximo ${LIMITE_COMENTARIO} caracteres.`);
  }

  const dados = {
    exchangeId: troca.id,
    avaliadorId: usuario.id,
    avaliadorNome: souSolicitante ? troca.solicitanteNome : troca.destinatarioNome,
    avaliadoId: souSolicitante ? troca.destinatarioId : troca.solicitanteId,
    avaliadoNome: souSolicitante ? troca.destinatarioNome : troca.solicitanteNome,
    assunto: `${troca.conhecimentoOferecidoTitulo} ⇄ ${troca.conhecimentoDesejadoTitulo}`,
    nota,
    criadoEm: serverTimestamp(),
  };
  if (comentarioLimpo) dados.comentario = comentarioLimpo; // o Firestore não aceita "undefined"

  const referencia = doc(db, "reviews", idDaAvaliacao(troca.id, usuario.id));

  // Transação: confere se já existe e só então grava (evita duplicata mesmo com 2 cliques)
  await runTransaction(db, async (transacao) => {
    const existente = await transacao.get(referencia);
    if (existente.exists()) throw new Error("Você já avaliou esta troca.");
    transacao.set(referencia, dados);
  });
}

/* Escuta (tempo real) as avaliações que EU já fiz.
   Devolve um Map: id da troca -> avaliação. A tela usa isso para esconder o botão "Avaliar". */
export function observarAvaliacoesFeitas(usuarioId, aoMudar, aoErro) {
  return onSnapshot(
    query(collection(db, "reviews"), where("avaliadorId", "==", usuarioId)),
    (snapshot) => {
      const porTroca = new Map();
      snapshot.docs.forEach((d) => {
        const avaliacao = montarAvaliacao(d);
        porTroca.set(avaliacao.exchangeId, avaliacao);
      });
      aoMudar(porTroca);
    },
    aoErro
  );
}

/* Avaliações que uma pessoa RECEBEU, da mais nova para a mais antiga (usado no perfil). */
export async function listarAvaliacoesRecebidas(usuarioId) {
  const resultado = await getDocs(
    query(collection(db, "reviews"), where("avaliadoId", "==", usuarioId))
  );
  return resultado.docs.map(montarAvaliacao).sort((a, b) => b.criadoEmMs - a.criadoEmMs);
}

/* Reputação a partir da lista de avaliações:
   total, média (ex.: 4.5) e quantas avaliações teve cada nota (para o gráfico de barras). */
export function calcularReputacao(avaliacoes) {
  const total = avaliacoes.length;
  const distribuicao = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let soma = 0;

  avaliacoes.forEach((a) => {
    soma += a.nota;
    distribuicao[a.nota] += 1;
  });

  return { total, media: total === 0 ? 0 : soma / total, distribuicao };
}