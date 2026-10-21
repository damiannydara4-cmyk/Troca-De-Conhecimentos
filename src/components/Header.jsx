import React from "react";
import { Link, NavLink } from "react-router-dom";
import { ROTAS } from "../routes.js";

export default function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to={ROTAS.inicio} className="brand">Banco de Trocas</Link>

        <nav className="d-flex flex-wrap align-items-center gap-3" aria-label="Principal">
          <NavLink to={ROTAS.inicio} end className="nav-link-bt">Início</NavLink>
          <NavLink to={ROTAS.conhecimentos} className="nav-link-bt">Conhecimentos</NavLink>
          <NavLink to={ROTAS.contato} className="nav-link-bt">Fale com a equipe</NavLink>
          <Link to={ROTAS.login} className="btn btn-line btn-sm">Entrar</Link>
        </nav>
      </div>
    </header>
  );
}