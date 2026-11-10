import React from "react";
import { Link } from "react-router-dom";
import { ROTAS, caminhoConversa } from "../routes.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useConversas } from "../contexts/ConversasContext.jsx";
import { formatarDataCurta, iniciais } from "../utils/formatadores.js";

export default function Conversas() {
  const { usuario } = useAuth();
  const { conversas, carregando, erro, totalNaoLidas } = useConversas();

  return (
    <div className="container py-5">
      <h1 className="display-5 fw-bolder">Conversas</h1>
      <p className="text-secondary fs-5 mb-4">
        {totalNaoLidas > 0
          ? `Você tem ${totalNaoLidas} mensagem(ns) não lida(s).`
          : "Combine os detalhes das suas trocas com quem você está trocando conhecimento."}
      </p>

      {carregando && <p className="text-center text-secondary my-5" role="status">Carregando conversas…</p>}

      {!carregando && erro && (
        <div className="empty-state text-center p-5 my-4">
          <h3 className="h5 fw-bold">Algo deu errado</h3>
          <p className="small text-secondary mb-0">{erro}</p>
        </div>
      )}

      {!carregando && !erro && conversas.length === 0 && (
        <div className="empty-state text-center p-5 my-4">
          <h3 className="h5 fw-bold">Nenhuma conversa ainda</h3>
          <p className="small text-secondary">
            As conversas começam a partir de uma troca. Veja suas solicitações e clique em “Conversar”.
          </p>
          <Link to={ROTAS.minhasTrocas} className="btn btn-brand btn-sm">Ir para Minhas trocas</Link>
        </div>
      )}

      {!carregando && !erro && conversas.length > 0 && (
        <div className="card-bt overflow-hidden">
          {conversas.map((c) => {
            const ultima = c.ultimaMensagem;
            const naoLida = c.naoLidas > 0;
            return (
              <Link
                key={c.id}
                to={caminhoConversa(c.id)}
                className={`conversa-item ${naoLida ? "conversa-item--nao-lida" : ""}`}
              >
                <span className="avatar">{iniciais(c.outroNome)}</span>
                <div className="flex-grow-1 min-w-0">
                  <div className="d-flex justify-content-between gap-2">
                    <span className="fw-bold">{c.outroNome}</span>
                    <span className="small text-secondary text-nowrap">
                      {formatarDataCurta(ultima?.criadoEmMs || c.atualizadoEmMs)}
                    </span>
                  </div>
                  {c.assunto && <div className="small text-secondary text-truncate">{c.assunto}</div>}
                  <div className="d-flex justify-content-between align-items-center gap-2">
                    <span className="conversa-item__texto small text-truncate">
                      {ultima
                        ? `${ultima.remetenteId === usuario.id ? "Você: " : ""}${ultima.texto}`
                        : "Nenhuma mensagem ainda"}
                    </span>
                    {naoLida && <span className="badge-nao-lidas" aria-label={`${c.naoLidas} não lidas`}>{c.naoLidas}</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}