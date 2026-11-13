import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase.js";

/* Salva uma mensagem de contato na coleção "contacts" do Firestore.
   Nenhuma autenticação é exigida: o formulário é público. */
export async function enviarMensagemDeContato({ nome, email, assunto, mensagem }) {
  const nomeLimpo = (nome || "").trim();
  const emailLimpo = (email || "").trim();
  const assuntoLimpo = (assunto || "").trim();
  const mensagemLimpa = (mensagem || "").trim();

  if (!nomeLimpo || !emailLimpo || !assuntoLimpo || !mensagemLimpa) {
    throw new Error("Preencha todos os campos obrigatórios.");
  }

  await addDoc(collection(db, "contacts"), {
    nome: nomeLimpo,
    email: emailLimpo,
    assunto: assuntoLimpo,
    mensagem: mensagemLimpa,
    criadoEm: serverTimestamp(),
    lida: false,
  });
}
