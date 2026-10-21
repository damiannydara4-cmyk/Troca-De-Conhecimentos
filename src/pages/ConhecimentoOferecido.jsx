import React from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { ROTAS } from "../routes.js";

export default function ConhecimentoOferecido() {
  const { state } = useLocation(); // { conhecimento } enviado pela tela Conhecimentos

  // Acesso direto pela URL: nenhum conhecimento foi publicado para confirmar
  if (!state?.conhecimento) return <Navigate to={ROTAS.conhecimentos} replace />;

  return (
    <div className="container status-main">
      <section className="status-card" role="status">
        <svg className="status-card__icon" width="44" height="44" viewBox="0 0 24 24" aria-hidden="true"
          fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 13 9 19 20 4" />
        </svg>
        <h1>Conhecimento oferecido!</h1>
        <p>
          Sua oferta de <strong className="text-body">{state.conhecimento}</strong> foi publicada
          e já está visível para a comunidade.
        </p>
        <Link to={ROTAS.conhecimentos} className="btn btn-brand w-100">
          Ver área de conhecimentos
        </Link>
      </section>
    </div>
  );
}