import { doc, getDoc } from "firebase/firestore";
import { app, auth, db } from "./services/firebase.js";

export async function testarFirebase() {
  console.log("✅ Firebase iniciado. Projeto:", app.options.projectId);
  console.log("✅ Authentication pronto. Usuário atual:", auth.currentUser);
  try {
    await getDoc(doc(db, "_teste", "ping"));
    console.log("✅ Firestore respondeu.");
  } catch (err) {
    if (err.code === "permission-denied") {
      // As regras de produção bloqueiam tudo: isso PROVA que o Firestore está conectado.
      console.log("✅ Firestore respondeu e bloqueou a leitura (regras de produção). Conexão OK!");
    } else {
      console.error("❌ Falha no Firestore:", err.code, err.message);
    }
  }
}