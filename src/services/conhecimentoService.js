import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase.js";

/* Tipos de conhecimento: o que a pessoa faz com ele.
   "ensinar"  = ela oferece | "aprender" = ela quer aprender */
export const TIPOS = {
  ensinar: "Quero ensinar",
  aprender: "Quero aprender",
};

/* Converte um documento do Firestore no objeto que as telas usam.
   Fica num só lugar para as duas listagens ficarem iguais. */
function montarConhecimento(d) {
  const dados = d.data();
  return {
    id: d.id,
    titulo: dados.titulo,
    descricao: dados.descricao,
    categoriaId: dados.categoriaId,
    nivel: dados.nivel,
    tipo: dados.tipo ?? "ensinar", // conhecimentos antigos não têm "tipo": contam como "ensinar"
    donoId: dados.donoId,
    autor: dados.donoNome, // a tela chama de "autor"
    cargo: dados.donoCargo ?? "",
    criadoEmMs: dados.criadoEm?.toMillis?.() ?? 0, // usado para ordenar
  };
}

/* Categorias (coleção "categories"), na ordem definida pelo campo "ordem".
   Devolve [{ id: "tecnologia", nome: "Tecnologia" }, ...] */
export async function listarCategorias() {
  const resultado = await getDocs(query(collection(db, "categories"), orderBy("ordem")));
  return resultado.docs.map((d) => ({ id: d.id, nome: d.data().nome }));
}

/* Conhecimentos ativos (coleção "knowledge"), do mais novo para o mais antigo.
   Esta consulta usa o índice composto: ativo (↑) + criadoEm (↓). */
export async function listarConhecimentos() {
  const consulta = query(
    collection(db, "knowledge"),
    where("ativo", "==", true),
    orderBy("criadoEm", "desc")
  );
  const resultado = await getDocs(consulta);
  return resultado.docs.map(montarConhecimento);
}

/* Conhecimentos ativos de UMA pessoa (a tela "Meus conhecimentos").
   Só filtramos no Firestore e ordenamos aqui no código: assim não é preciso criar um
   índice novo no Console. */
export async function listarMeusConhecimentos(usuarioId) {
  const consulta = query(
    collection(db, "knowledge"),
    where("donoId", "==", usuarioId),
    where("ativo", "==", true)
  );
  const resultado = await getDocs(consulta);
  return resultado.docs.map(montarConhecimento).sort((a, b) => b.criadoEmMs - a.criadoEmMs);
}

/* Publica um novo conhecimento. O dono é sempre o usuário logado. */
export async function criarConhecimento(usuario, { titulo, descricao, categoriaId, nivel, cargo, tipo = "ensinar" }) {
  if (!TIPOS[tipo]) throw new Error("Tipo de conhecimento inválido.");

  const dados = {
    titulo: titulo.trim(),
    descricao: descricao.trim(),
    categoriaId,
    nivel,
    tipo,
    donoId: usuario.id,
    donoNome: usuario.nome,
    ativo: true,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  };
  if (cargo && cargo.trim()) dados.donoCargo = cargo.trim(); // o Firestore não aceita "undefined"

  const referencia = await addDoc(collection(db, "knowledge"), dados);
  return referencia.id;
}

/* Edita um conhecimento existente. Só o dono consegue (as regras do Firestore conferem).
   Mudamos apenas os campos que a pessoa pode editar; dono e data de criação nunca mudam. */
export async function atualizarConhecimento(id, { titulo, descricao, categoriaId, nivel, tipo }) {
  if (!TIPOS[tipo]) throw new Error("Tipo de conhecimento inválido.");

  await updateDoc(doc(db, "knowledge", id), {
    titulo: titulo.trim(),
    descricao: descricao.trim(),
    categoriaId,
    nivel,
    tipo,
    atualizadoEm: serverTimestamp(),
  });
}

/* "Exclui" um conhecimento: só marca ativo = false. O documento continua existindo, então
   trocas e históricos futuros que o citam não quebram. Some das listagens porque elas só
   buscam ativo == true. */
export async function excluirConhecimento(id) {
  await updateDoc(doc(db, "knowledge", id), {
    ativo: false,
    atualizadoEm: serverTimestamp(),
  });
}