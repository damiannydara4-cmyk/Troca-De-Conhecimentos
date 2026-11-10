import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { observarConversas } from "../services/chatService.js";

const ConversasContext = createContext(null);

/* Mantém UM único listener das conversas de quem está logado.
   O Header (contador) e as telas de conversa usam os mesmos dados, sem leituras repetidas.
   Quando a pessoa sai (ou o componente desmonta), o listener é encerrado. */
export function ConversasProvider({ children }) {
  const { usuario } = useAuth();
  const usuarioId = usuario?.id ?? null;

  const [conversas, setConversas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!usuarioId) {
      setConversas([]);
      setCarregando(false);
      setErro(null);
      return undefined;
    }

    setCarregando(true);
    setErro(null);

    const cancelar = observarConversas(
      usuarioId,
      (lista) => {
        setConversas(lista);
        setCarregando(false);
      },
      (err) => {
        console.error("Erro ao escutar conversas:", err);
        setErro("Não foi possível carregar suas conversas.");
        setCarregando(false);
      }
    );

    return cancelar; // encerra o listener
  }, [usuarioId]);

  const valor = useMemo(
    () => ({
      conversas,
      carregando,
      erro,
      totalNaoLidas: conversas.reduce((soma, c) => soma + c.naoLidas, 0),
    }),
    [conversas, carregando, erro]
  );

  return <ConversasContext.Provider value={valor}>{children}</ConversasContext.Provider>;
}

export function useConversas() {
  const ctx = useContext(ConversasContext);
  if (!ctx) throw new Error("useConversas precisa estar dentro de <ConversasProvider>.");
  return ctx;
}