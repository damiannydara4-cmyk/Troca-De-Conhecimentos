import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { ROTAS } from "../routes.js";

export default function RotaProtegida() {
  const { autenticado, carregando } = useAuth();
  const location = useLocation();

  if (carregando) {
    return (
      <div className="container py-5 text-center text-secondary" role="status">
        Carregando…
      </div>
    );
  }

  if (!autenticado) {
    return <Navigate to={ROTAS.login} replace state={{ from: location }} />;
  }

  return <Outlet />;
}

//Enquanto confirma a sessão, mostra “Carregando…”.
//Sem login, redireciona para /login
//Com login, renderiza a página pedida
//replace evita que o botão “voltar” prenda o usuário num loop de redirecionamento.