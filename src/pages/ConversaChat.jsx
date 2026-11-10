import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ROTAS } from "../routes.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useConversas } from "../contexts/ConversasContext.jsx";
import StatusTroca from "../components/StatusTroca.jsx";
import { observarTroca, STATUS } from "../services/trocaService.js";
import {
  LIMITE_MENSAGEM,
  enviarMensagem,
  marcarComoLidas,
  observarMensagens,
} from "../services/chatService.js";
import { formatarDataHora, iniciais } from "../utils/formatadores.js";

export default function ConversaChat() {
  const { conversaId } = useParams();
  const { usuario } = useAuth();
  const { conversas, carregando: carregandoConversas } = useConversas();

  // Só existe se EU participo (a lista só traz as minhas conversas)
  const conversa = conversas.find((c) => c.id === conversaId) ?? null;
  const existe = Boolean(conversa);

  const [mensagens, setMensagens] = useState([]);
  const [carregandoMsgs, setCarregandoMsgs] = useState(true);
  const [erro, setErro] = useState(null);
  const [troca, setTroca] = useState(null);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [visivel, setVisivel] = useState(document.visibilityState === "visible");
  const [esperaAcabou, setEsperaAcabou] = useState(false);

  const fimRef = useRef(null);
  const marcandoRef = useRef(false);

  // Conversa recém-criada pode demorar um instante para chegar na lista: espera 3 s antes de desistir
  useEffect(() => {
    setEsperaAcabou(false);
    const t = setTimeout(() => setEsperaAcabou(true), 3000);
    return () => clearTimeout(t);
  }, [conversaId]);

  // Sabe se a aba está aberta (só marcamos como lida se a pessoa realmente está vendo)
  useEffect(() => {
    const atualizar = () => setVisivel(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", atualizar);
    return () => document.removeEventListener("visibilitychange", atualizar);
  }, []);

  // Mensagens em tempo real (listener encerrado ao sair da tela ou trocar de conversa)
  useEffect(() => {
    if (!existe) return undefined;
    setCarregandoMsgs(true);
    setErro(null);
    const cancelar = observarMensagens(
      conversaId,
      (lista) => {
        setMensagens(lista);
        setCarregandoMsgs(false);
      },
      (err) => {
        console.error("Erro ao carregar mensagens:", err);
        setErro("Não foi possível carregar as mensagens.");
        setCarregandoMsgs(false);
      }
    );
    return cancelar;
  }, [conversaId, existe]);

  // Status da troca (para mostrar o selo e bloquear o envio em trocas recusadas/canceladas)
  useEffect(() => {
    if (!existe) return undefined;
    return observarTroca(conversaId, setTroca, (err) => console.error("Erro ao ler a troca:", err));
  }, [conversaId, existe]);

  // Marca como lidas as mensagens RECEBIDAS quando a pessoa está vendo a conversa
  const contadorNaoLidas = conversa?.naoLidas ?? 0;
  useEffect(() => {
    if (!existe || !visivel || carregandoMsgs || marcandoRef.current) return;
    const recebidasNaoLidas = mensagens.filter((m) => m.remetenteId !== usuario.id && !m.lida);
    if (recebidasNaoLidas.length === 0 && contadorNaoLidas === 0) return;

    marcandoRef.current = true;
    marcarComoLidas(conversaId, usuario.id, recebidasNaoLidas.map((m) => m.id))
      .catch((err) => console.error("Erro ao marcar como lidas:", err))
      .finally(() => {
        marcandoRef.current = false;
      });
  }, [mensagens, contadorNaoLidas, existe, visivel, carregandoMsgs, conversaId, usuario.id]);

  // Rola para a última mensagem
  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensagens.length]);

  const bloqueada = troca && (troca.status === STATUS.recusada || troca.status === STATUS.cancelada);

  const enviar = async () => {
    if (enviando || bloqueada || !texto.trim()) return;
    setEnviando(true);
    setErro(null);
    try {
      await enviarMensagem(conversa, usuario, texto);
      setTexto("");
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
      setErro(err?.code ? "Não foi possível enviar. Tente novamente." : err.message);
    } finally {
      setEnviando(false);
    }
  };

  const aoEnviarFormulario = (e) => {
    e.preventDefault();
    enviar();
  };

  // Enter envia; Shift+Enter pula linha
  const aoTeclar = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  if (!existe) {
    return (
      <div className="container py-5 text-center">
        {carregandoConversas || !esperaAcabou ? (
          <p className="text-secondary" role="status">Carregando conversa…</p>
        ) : (
          <div className="empty-state p-5">
            <h3 className="h5 fw-bold">Conversa não encontrada</h3>
            <p className="small text-secondary">Ela não existe ou você não participa dela.</p>
            <Link to={ROTAS.conversas} className="btn btn-brand btn-sm">Voltar às conversas</Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: 820 }}>
      <Link to={ROTAS.conversas} className="small link-inline">← Todas as conversas</Link>

      <div className="card-bt chat-box mt-3 overflow-hidden">
        <div className="d-flex align-items-center justify-content-between gap-3 p-3 border-bottom">
          <div className="d-flex align-items-center gap-2 min-w-0">
            <span className="avatar">{iniciais(conversa.outroNome)}</span>
            <div className="min-w-0">
              <p className="fw-bold mb-0 lh-sm">{conversa.outroNome}</p>
              <p className="small text-secondary mb-0 text-truncate">{conversa.assunto}</p>
            </div>
          </div>
          {troca && <StatusTroca status={troca.status} />}
        </div>

        <div className="chat-mensagens" aria-live="polite">
          {carregandoMsgs && <p className="text-center text-secondary small my-3">Carregando mensagens…</p>}
          {!carregandoMsgs && mensagens.length === 0 && (
            <p className="text-center text-secondary small my-3">
              Nenhuma mensagem ainda. Diga olá e combine os detalhes da troca!
            </p>
          )}
          {mensagens.map((m) => {
            const minha = m.remetenteId === usuario.id;
            return (
              <div key={m.id} className={`bolha ${minha ? "bolha--minha" : "bolha--outra"}`}>
                {m.texto}
                <span className="bolha__meta">
                  {formatarDataHora(m.criadoEmMs)}
                  {minha && ` · ${m.lida ? "✓✓ Lida" : "✓ Enviada"}`}
                </span>
              </div>
            );
          })}
          <div ref={fimRef} />
        </div>

        {erro && <div className="alert-erro m-3 mb-0" role="alert">{erro}</div>}

        {bloqueada ? (
          <p className="small text-secondary text-center p-3 mb-0 border-top">
            Esta troca foi {troca.status === STATUS.recusada ? "recusada" : "cancelada"}: o envio de novas
            mensagens está desativado.
          </p>
        ) : (
          <form onSubmit={aoEnviarFormulario} className="d-flex gap-2 p-3 border-top">
            <textarea
              rows="1"
              className="form-control"
              placeholder="Escreva uma mensagem…"
              aria-label="Mensagem"
              maxLength={LIMITE_MENSAGEM}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={aoTeclar}
            />
            <button type="submit" className="btn btn-brand" disabled={enviando || !texto.trim()}>
              {enviando ? "Enviando…" : "Enviar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}