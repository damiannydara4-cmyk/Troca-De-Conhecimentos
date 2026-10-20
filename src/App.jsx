import React, { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

import Inicio from "./pages/Inicio.jsx";
import Conhecimentos from "./pages/Conhecimentos.jsx";
import ConhecimentoOferecido from "./pages/ConhecimentoOferecido.jsx";
import FaleComEquipe from "./pages/FaleComEquipe.jsx";
import MensagemEnviada from "./pages/MensagemEnviada.jsx";
import Login from "./pages/Login.jsx";
import CadastroConta from "./pages/CadastroConta.jsx";
import RecuperarSenha from "./pages/RecuperarSenha.jsx";

/* Endereços de cada tela (um só lugar para consultar/alterar) */
const ROTAS = {
  inicio: "/",
  conhecimentos: "/conhecimentos",
  conhecimentoOferecido: "/conhecimento-oferecido",
  contato: "/contato",
  mensagemEnviada: "/mensagem-enviada",
  login: "/login",
  cadastro: "/cadastro",
  recuperarSenha: "/recuperar-senha",
};

/* Ao trocar de tela, volta ao topo da página */
function RolarParaOTopo() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/* Cada tela continua recebendo as mesmas props de antes (onVoltar, onEntrar...).
   Estes componentes só traduzem essas props em navegação do React Router. */

function InicioRota() {
  const navigate = useNavigate();
  return (
    <Inicio
      onIrParaConhecimentos={() => navigate(ROTAS.conhecimentos)}
      onOferecerConhecimento={() => navigate(ROTAS.conhecimentos, { state: { abrirOferta: true } })}
      onFalarComEquipe={() => navigate(ROTAS.contato)}
    />
  );
}

function ConhecimentosRota() {
  const navigate = useNavigate();
  const { state, key } = useLocation();
  return (
    <Conhecimentos
      key={key}
      abrirOferta={Boolean(state?.abrirOferta)}
      onVoltarInicio={() => navigate(ROTAS.inicio)}
    />
  );
}

function ConhecimentoOferecidoRota() {
  const navigate = useNavigate();
  const { state } = useLocation();
  // Sem o nome do conhecimento (acesso direto pela URL), não há o que confirmar
  if (!state?.conhecimento) return <Navigate to={ROTAS.conhecimentos} replace />;
  return (
    <ConhecimentoOferecido
      conhecimento={state.conhecimento}
      onVer={() => navigate(ROTAS.conhecimentos)}
    />
  );
}

function FaleComEquipeRota() {
  const navigate = useNavigate();
  return (
    <FaleComEquipe
      onVoltar={() => navigate(ROTAS.inicio)}
      onEnviar={(email) => navigate(ROTAS.mensagemEnviada, { state: { email } })}
    />
  );
}

function MensagemEnviadaRota() {
  const navigate = useNavigate();
  const { state } = useLocation();
  // Só faz sentido chegar aqui depois de enviar o formulário de contato
  if (!state?.email) return <Navigate to={ROTAS.contato} replace />;
  return <MensagemEnviada email={state.email} onVoltar={() => navigate(ROTAS.inicio)} />;
}

function LoginRota() {
  const navigate = useNavigate();
  return (
    <Login
      onVoltar={() => navigate(ROTAS.inicio)}
      onIrParaCadastro={() => navigate(ROTAS.cadastro)}
      onIrParaRecuperacao={() => navigate(ROTAS.recuperarSenha)}
      onLogin={() => navigate(ROTAS.inicio)}
    />
  );
}

function CadastroRota() {
  const navigate = useNavigate();
  return (
    <CadastroConta
      onVoltar={() => navigate(ROTAS.inicio)}
      onEntrar={() => navigate(ROTAS.login)}
      onIrParaRecuperacao={() => navigate(ROTAS.recuperarSenha)}
      onCadastrar={() => navigate(ROTAS.login)}
    />
  );
}

function RecuperarSenhaRota() {
  const navigate = useNavigate();
  return (
    <RecuperarSenha
      onVoltar={() => navigate(ROTAS.inicio)}
      onEntrar={() => navigate(ROTAS.login)}
      onIrParaCadastro={() => navigate(ROTAS.cadastro)}
    />
  );
}

export default function App() {
  return (
    <>
      <RolarParaOTopo />
      <Routes>
        <Route path={ROTAS.inicio} element={<InicioRota />} />
        <Route path={ROTAS.conhecimentos} element={<ConhecimentosRota />} />
        <Route path={ROTAS.conhecimentoOferecido} element={<ConhecimentoOferecidoRota />} />
        <Route path={ROTAS.contato} element={<FaleComEquipeRota />} />
        <Route path={ROTAS.mensagemEnviada} element={<MensagemEnviadaRota />} />
        <Route path={ROTAS.login} element={<LoginRota />} />
        <Route path={ROTAS.cadastro} element={<CadastroRota />} />
        <Route path={ROTAS.recuperarSenha} element={<RecuperarSenhaRota />} />

        {/* Endereço inexistente: volta para o início */}
        <Route path="*" element={<Navigate to={ROTAS.inicio} replace />} />
      </Routes>
    </>
  );
}