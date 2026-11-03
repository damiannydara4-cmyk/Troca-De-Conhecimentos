import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase.js";
import { authService } from "../services/authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true); // true enquanto o Firebase confirma a sessão ao abrir o site

  // O Firebase avisa sozinho quando o usuário entra, sai ou quando a página é recarregada
  // (ele restaura a sessão salva no navegador). Só consideramos "logado" quem confirmou o e-mail.
  useEffect(() => {
    let ativo = true;

    const cancelar = onAuthStateChanged(auth, async (usuarioFirebase) => {
      if (!usuarioFirebase || !usuarioFirebase.emailVerified) {
        if (ativo) {
          setUsuario(null);
          setCarregando(false);
        }
        return;
      }
      const dados = await authService.carregarUsuario(usuarioFirebase);
      if (ativo) {
        setUsuario(dados);
        setCarregando(false);
      }
    });

    return () => {
      ativo = false;
      cancelar();
    };
  }, []);

  // Faz o login e já guarda o usuário no estado (assim a tela seguinte não te manda de volta ao /login)
  const entrar = useCallback(async (email, senha) => {
    const dados = await authService.login(email, senha);
    setUsuario(dados);
  }, []);

  const sair = useCallback(async () => {
    await authService.logout();
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, autenticado: Boolean(usuario), carregando, entrar, sair }),
    [usuario, carregando, entrar, sair]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>.");
  return ctx;
}