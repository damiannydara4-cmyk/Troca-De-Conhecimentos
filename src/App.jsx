import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout.jsx";
import Inicio from "./pages/Inicio.jsx";
import Conhecimentos from "./pages/Conhecimentos.jsx";
import ConhecimentoOferecido from "./pages/ConhecimentoOferecido.jsx";
import FaleComEquipe from "./pages/FaleComEquipe.jsx";
import MensagemEnviada from "./pages/MensagemEnviada.jsx";
import Login from "./pages/Login.jsx";
import CadastroConta from "./pages/CadastroConta.jsx";
import RecuperarSenha from "./pages/RecuperarSenha.jsx";

import { ROTAS } from "./routes.js";

export default function App() {
  return (
    <Routes>
      {/* Moldura global com Header e Footer para todas as telas */}
      <Route element={<Layout />}>
        <Route path={ROTAS.inicio} element={<Inicio />} />
        <Route path={ROTAS.conhecimentos} element={<Conhecimentos />} />
        <Route path={ROTAS.conhecimentoOferecido} element={<ConhecimentoOferecido />} />
        <Route path={ROTAS.contato} element={<FaleComEquipe />} />
        <Route path={ROTAS.mensagemEnviada} element={<MensagemEnviada />} />
        <Route path={ROTAS.login} element={<Login />} />
        <Route path={ROTAS.cadastro} element={<CadastroConta />} />
        <Route path={ROTAS.recuperarSenha} element={<RecuperarSenha />} />

        {/* Endereço inexistente volta para o início */}
        <Route path="*" element={<Navigate to={ROTAS.inicio} replace />} />
      </Route>
    </Routes>
  );
}