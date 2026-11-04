import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "./firebase.js";

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
  return resultado.docs.map((d) => {
    const dados = d.data();
    return {
      id: d.id,
      titulo: dados.titulo,
      descricao: dados.descricao,
      categoriaId: dados.categoriaId,
      nivel: dados.nivel,
      donoId: dados.donoId,
      autor: dados.donoNome, // a tela chama de "autor"
      cargo: dados.donoCargo ?? "",
    };
  });
}

/* Publica um novo conhecimento. O dono é sempre o usuário logado. */
export async function criarConhecimento(usuario, { titulo, descricao, categoriaId, nivel, cargo }) {
  const dados = {
    titulo: titulo.trim(),
    descricao: descricao.trim(),
    categoriaId,
    nivel,
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