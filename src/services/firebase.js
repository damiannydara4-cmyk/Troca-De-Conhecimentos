import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/* Os valores vêm do arquivo .env (variáveis do Vite começam com VITE_) */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/* Avisa com clareza se esqueceram de criar o .env (storageBucket é opcional por enquanto) */
const obrigatorias = ["apiKey", "authDomain", "projectId", "appId"];
const faltando = obrigatorias.filter((chave) => !firebaseConfig[chave]);
if (faltando.length > 0) {
  throw new Error(
    `Firebase não configurado. Faltam no arquivo .env: ${faltando.join(", ")}. ` +
      "Depois de editar o .env, pare e rode de novo o 'npm run dev'."
  );
}

export const app = initializeApp(firebaseConfig);

/* Authentication: login, cadastro, sessão */
export const auth = getAuth(app);
auth.languageCode = "pt-BR"; // e-mails de verificação e de senha saem em português

/* Persistência: a sessão continua mesmo depois de fechar e reabrir o navegador.
   (Para "não lembrar de mim", troque por browserSessionPersistence.) */
setPersistence(auth, browserLocalPersistence).catch(() => {
  /* se o navegador bloquear o armazenamento, a sessão dura só até recarregar */
});

/* Cloud Firestore: banco de dados */
export const db = getFirestore(app);