import React from "react";
import { Link } from "react-router-dom";
import { ROTAS } from "../routes.js";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Footer() {
  const { autenticado } = useAuth();

  return (
    <footer className="site-footer py-4">
      <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
        <div className="d-flex align-items-center gap-2">
          <span className="logo-mark" aria-hidden="true">BT</span>
          <span className="fw-bold">Banco de Trocas</span>
          <span className="small text-secondary d-none d-lg-inline">
            • Conectando pessoas através do conhecimento
          </span>
        </div>

        <nav className="d-flex flex-wrap justify-content-center gap-3" aria-label="Rodapé">
          <Link to={ROTAS.inicio} className="footer-link">Início</Link>
          <Link to={ROTAS.conhecimentos} className="footer-link">Conhecimentos</Link>
          <Link to={ROTAS.contato} className="footer-link">Fale com a equipe</Link>
          {!autenticado && <Link to={ROTAS.login} className="footer-link">Entrar</Link>}
        </nav>
      </div>

      <div className="container footer-copy small text-secondary mt-3 pt-3">
        © {new Date().getFullYear()} Banco de Trocas. Todos os direitos reservados.
      </div>
    </footer>
  );
}