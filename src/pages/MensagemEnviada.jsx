import React from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { ROTAS } from "../routes.js";

export default function MensagemEnviada() {
  const { state } = useLocation(); // { email } enviado pela tela Fale com a equipe

  // Acesso direto pela URL: ainda não há mensagem enviada para confirmar
  if (!state?.email) return <Navigate to={ROTAS.contato} replace />;

  return (
    <div className="container status-main">
      <section className="status-card" role="status">
        {/* Envelope em lilás */}
        <svg className="status-card__icon" width="52" height="38" viewBox="0 0 52 38" aria-hidden="true">
          <rect x="1" y="1" width="50" height="36" rx="4" fill="#DDD6FE" />
          <path d="M3 5 26 22 49 5" fill="none" stroke="#C4B5FD" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h1>Mensagem enviada!</h1>
        <p>
          Nossa equipe entrará em contato em até 2 dias úteis no e-mail{" "}
          <strong className="text-body">{state.email}</strong>.
        </p>
        <Link to={ROTAS.inicio} className="btn btn-brand w-100">Voltar ao início</Link>
      </section>
    </div>
  );
}