import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase.js";
import { ROTAS } from "../routes.js";

/* Para onde o link do e-mail leva o usuário depois de confirmar (botão "Continuar") */
const configuracaoDoLink = () => ({ url: `${window.location.origin}${ROTAS.login}` });

/* Traduz os códigos de erro do Firebase para mensagens em português */
const MENSAGENS = {
  "auth/email-already-in-use": "Este e-mail já está cadastrado.",
  "auth/invalid-email": "O e-mail informado não é válido.",
  "auth/weak-password": "A senha é fraca. Use pelo menos 8 caracteres, com letras e números.",
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/wrong-password": "E-mail ou senha incorretos.",
  "auth/user-not-found": "E-mail ou senha incorretos.",
  "auth/user-disabled": "Esta conta foi desativada.",
  "auth/too-many-requests": "Muitas tentativas. Aguarde alguns minutos e tente de novo.",
  "auth/network-request-failed": "Sem conexão com a internet. Verifique sua rede.",
  "permission-denied": "Sem permissão para salvar os dados. Verifique as regras do Firestore.",
};

function traduzirErro(err) {
  if (err?.codigo === "email-nao-verificado") return err; // já é uma mensagem nossa
  const erro = new Error(MENSAGENS[err?.code] || "Algo deu errado. Tente novamente.");
  erro.codigo = err?.code;
  return erro;
}

/* Junta os dados do Authentication (uid, e-mail) com os do Firestore (nome, bio...)
   no formato que o resto do app usa: { id, nome, email, ... } */
export function montarUsuario(usuarioFirebase, perfil) {
  return {
    id: usuarioFirebase.uid,
    nome: perfil?.nome || usuarioFirebase.displayName || usuarioFirebase.email.split("@")[0],
    email: usuarioFirebase.email,
    emailVerificado: usuarioFirebase.emailVerified,
    bio: perfil?.bio ?? "",
    fotoUrl: perfil?.fotoUrl ?? null,
  };
}

/* Lê users/{uid}. Se o documento não existir (ex.: a rede caiu no meio do cadastro), cria agora. */
async function garantirPerfil(usuarioFirebase) {
  const referencia = doc(db, "users", usuarioFirebase.uid);
  const snapshot = await getDoc(referencia);
  if (snapshot.exists()) return snapshot.data();

  const perfil = {
    nome: usuarioFirebase.displayName || usuarioFirebase.email.split("@")[0],
    bio: "",
    fotoUrl: null,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  };
  await setDoc(referencia, perfil);
  return { ...perfil, criadoEm: null, atualizadoEm: null };
}

export const authService = {
  /* Cria a conta, salva o perfil, envia o e-mail de verificação e encerra a sessão.
     O usuário só entra no site depois de confirmar o e-mail e fazer login. */
  async cadastrar({ nome, email, senha }) {
    try {
      const credencial = await createUserWithEmailAndPassword(auth, email, senha);
      const usuarioFirebase = credencial.user;
      const nomeLimpo = nome.trim();

      await updateProfile(usuarioFirebase, { displayName: nomeLimpo });
      await setDoc(doc(db, "users", usuarioFirebase.uid), {
        nome: nomeLimpo,
        bio: "",
        fotoUrl: null,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
      });

      try {
        await sendEmailVerification(usuarioFirebase, configuracaoDoLink());
      } catch {
        /* a conta já existe: se o e-mail falhar, o usuário pede o reenvio na tela de login */
      }

      await signOut(auth);
    } catch (err) {
      throw traduzirErro(err);
    }
  },

  /* Login com e-mail e senha. Bloqueia contas com e-mail ainda não verificado. */
  async login(email, senha) {
    try {
      const credencial = await signInWithEmailAndPassword(auth, email, senha);
      const usuarioFirebase = credencial.user;

      if (!usuarioFirebase.emailVerified) {
        await signOut(auth);
        const erro = new Error("Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada e o spam.");
        erro.codigo = "email-nao-verificado";
        throw erro;
      }

      const perfil = await garantirPerfil(usuarioFirebase);
      return montarUsuario(usuarioFirebase, perfil);
    } catch (err) {
      throw traduzirErro(err);
    }
  },

  /* Chamado pelo AuthContext quando o Firebase avisa que há um usuário logado */
  async carregarUsuario(usuarioFirebase) {
    try {
      const perfil = await garantirPerfil(usuarioFirebase);
      return montarUsuario(usuarioFirebase, perfil);
    } catch {
      // Firestore indisponível: a sessão continua valendo, só sem os dados extras
      return montarUsuario(usuarioFirebase, null);
    }
  },

  /* Reenvia o e-mail de verificação (precisa do e-mail e da senha para identificar a conta) */
  async reenviarVerificacao(email, senha) {
    try {
      const credencial = await signInWithEmailAndPassword(auth, email, senha);
      if (!credencial.user.emailVerified) {
        await sendEmailVerification(credencial.user, configuracaoDoLink());
      }
      await signOut(auth);
    } catch (err) {
      throw traduzirErro(err);
    }
  },

  /* Envia o link de redefinição de senha. Não revela se o e-mail existe ou não. */
  async recuperarSenha(email) {
    try {
      await sendPasswordResetEmail(auth, email, configuracaoDoLink());
    } catch (err) {
      // e-mail sem conta não é erro para o usuário (evita descobrir quem tem cadastro)
      if (err?.code === "auth/user-not-found") return;
      throw traduzirErro(err);
    }
  },

  async logout() {
    await signOut(auth);
  },
};