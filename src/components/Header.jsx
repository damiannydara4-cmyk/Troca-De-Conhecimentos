import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ROTAS } from "../routes.js";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Header() {
  const navigate = useNavigate();
  const { usuario, autenticado, carregando, sair } = useAuth();

  const handleSair = async () => {
    await sair();
    navigate(ROTAS.inicio);
  };

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to={ROTAS.inicio} className="brand">Banco de Trocas</Link>

        <nav className="d-flex flex-wrap align-items-center gap-3" aria-label="Principal">
          <NavLink to={ROTAS.inicio} end className="nav-link-bt">Início</NavLink>
          <NavLink to={ROTAS.conhecimentos} className="nav-link-bt">Conhecimentos</NavLink>
          <NavLink to={ROTAS.contato} className="nav-link-bt">Fale com a equipe</NavLink>

          {!carregando && autenticado ? (
            <>
              <span className="small text-secondary">
                Olá, {usuario?.nome?.split(" ")[0] ?? "usuário"}
              </span>
              <button type="button" className="btn btn-line btn-sm" onClick={handleSair}>
                Sair
              </button>
            </>
          ) : (
            !carregando && <Link to={ROTAS.login} className="btn btn-line btn-sm">Entrar</Link>
          )}
        </nav>
      </div>
    </header>
  );
}