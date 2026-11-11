import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase.js";

/* Lê o perfil público de uma pessoa (documento users/{uid}).
   Devolve null se a pessoa não existir. */
export async function buscarPerfil(usuarioId) {
  const snapshot = await getDoc(doc(db, "users", usuarioId));
  if (!snapshot.exists()) return null;

  const x = snapshot.data();
  return {
    id: snapshot.id,
    nome: x.nome,
    bio: x.bio ?? "",
    criadoEmMs: x.criadoEm?.toMillis?.() ?? 0,
  };
}