import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ROTAS, caminhoPerfil } from "../routes.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useConversas } from "../contexts/ConversasContext.jsx";

export default function Header() {
  const navigate = useNavigate();
  const { usuario, autenticado, carregando, sair } = useAuth();
  const { totalNaoLidas } = useConversas();

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
          {!carregando && autenticado && (
            <NavLink to={ROTAS.meusConhecimentos} className="nav-link-bt">Meus conhecimentos</NavLink>
          )}
          {!carregando && autenticado && (
            <>
              <NavLink to={ROTAS.minhasTrocas} className="nav-link-bt">Minhas trocas</NavLink>
              <NavLink to={ROTAS.conversas} className="nav-link-bt d-inline-flex align-items-center gap-2">
                Conversas
                {totalNaoLidas > 0 && (
                  <span className="badge-nao-lidas" aria-label={`${totalNaoLidas} mensagens não lidas`}>
                    {totalNaoLidas}
                  </span>
                )}
              </NavLink>
            </>
          )}
          <NavLink to={ROTAS.contato} className="nav-link-bt">Fale com a equipe</NavLink>

          {!carregando && autenticado ? (
            <>
              <Link to={caminhoPerfil(usuario.id)} className="small link-inline" title="Ver meu perfil">
                Olá, {usuario?.nome?.split(" ")[0] ?? "usuário"}
              </Link>
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