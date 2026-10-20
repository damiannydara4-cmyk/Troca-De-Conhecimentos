
import React, { useState } from "react";

// Suas telas
import Inicio from "./pages/Inicio.jsx";
import Conhecimentos from "./pages/Conhecimentos.jsx";

// Telas que já existiam no projeto compartilhado
import FaleComEquipe from "./pages/FaleComEquipe.jsx";
import MensagemEnviada from "./pages/MensagemEnviada.jsx";
import ConhecimentoOferecido from "./pages/ConhecimentoOferecido.jsx";
import CadastroConta from "./pages/CadastroConta.jsx";
import RecuperarSenha from "./pages/RecuperarSenha.jsx";
import Login from "./pages/Login.jsx";

export default function App() {
  const [telaAtual, setTelaAtual] = useState("inicio");
  const [abrirOferta, setAbrirOferta] = useState(false);
  const [emailContato, setEmailContato] = useState("");

  // Abre a tela de conhecimentos
  const handleIrParaConhecimentos = () => {
    setAbrirOferta(false);
    setTelaAtual("conhecimentos");
  };

  // Abre conhecimentos com o formulário de oferta
  const handleOferecerConhecimento = () => {
    setAbrirOferta(true);
    setTelaAtual("conhecimentos");
  };

  // Volta para a página inicial
  const handleVoltarInicio = () => {
    setTelaAtual("inicio");
  };

  // Envia o usuário para a confirmação de contato
  const handleEnviarMensagem = (email) => {
    setEmailContato(email);
    setTelaAtual("mensagem_enviada");
  };

  return (
    <div className="app-container">

      {/* Menu temporário para testar todas as telas */}
      <nav
        style={{
          background: "#111827",
          color: "#fff",
          padding: "0.5rem 1rem",
          display: "flex",
          gap: "0.75rem",
          alignItems: "center",
          flexWrap: "wrap",
          fontSize: "0.85rem",
        }}
      >
        <strong style={{ color: "#A3E635" }}>
          Navegação de Teste:
        </strong>

        {[
          ["inicio", "Início"],
          ["conhecimentos", "Conhecimentos"],
          ["contato", "Fale com a Equipe"],
          ["mensagem_enviada", "Mensagem Enviada"],
          ["conhecimento_oferecido", "Conhecimento Oferecido"],
          ["cadastro", "Cadastro de Conta"],
          ["recuperar_senha", "Recuperação de Senha"],
          ["login", "Login"],
        ].map(([id, nome]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setTelaAtual(id);
              if (id === "conhecimentos") {
                setAbrirOferta(false);
              }
            }}
            style={{
              background:
                telaAtual === id ? "#A3E635" : "transparent",
              color:
                telaAtual === id ? "#111827" : "#fff",
              border: "1px solid #A3E635",
              padding: "0.2rem 0.6rem",
              cursor: "pointer",
            }}
          >
            {nome}
          </button>
        ))}
      </nav>

      {/* Sua tela inicial */}
      {telaAtual === "inicio" && (
        <Inicio
          onIrParaConhecimentos={handleIrParaConhecimentos}
          onOferecerConhecimento={handleOferecerConhecimento}
          onFalarComEquipe={() => setTelaAtual("contato")}
        />
      )}

      {/* Sua tela de conhecimentos */}
      {telaAtual === "conhecimentos" && (
        <Conhecimentos
          abrirOferta={abrirOferta}
          onVoltarInicio={handleVoltarInicio}
        />
      )}

      {/* Tela de contato existente */}
      {telaAtual === "contato" && (
        <FaleComEquipe
          onEnviar={handleEnviarMensagem}
          onVoltar={handleVoltarInicio}
        />
      )}

      {/* Confirmação de mensagem existente */}
      {telaAtual === "mensagem_enviada" && (
        <MensagemEnviada
          email={emailContato || "usuario@exemplo.com"}
          onVoltar={handleVoltarInicio}
        />
      )}

      {/* Componente de conhecimento oferecido existente */}
      {telaAtual === "conhecimento_oferecido" && (
        <ConhecimentoOferecido
          conhecimento="React & Bootstrap"
          onVer={handleVoltarInicio}
        />
      )}

      {/* Cadastro existente */}
      {telaAtual === "cadastro" && (
        <CadastroConta
          onIrParaRecuperacao={() =>
            setTelaAtual("recuperar_senha")
          }
          onVoltar={handleVoltarInicio}
          onEntrar={() => setTelaAtual("login")}
        />
      )}

      {/* Recuperação de senha existente */}
      {telaAtual === "recuperar_senha" && (
        <RecuperarSenha
          onIrParaCadastro={() => setTelaAtual("cadastro")}
          onVoltar={handleVoltarInicio}
          onEntrar={() => setTelaAtual("login")}
        />
      )}

      {/* Login */}
      {telaAtual === "login" && (
        <Login
          onIrParaCadastro={() => setTelaAtual("cadastro")}
          onIrParaRecuperacao={() =>
            setTelaAtual("recuperar_senha")
          }
          onVoltar={handleVoltarInicio}
        />
      )}

    </div>
  );
}
