import React, { useState } from "react";
import FaleComEquipe from "./pages/FaleComEquipe.jsx";
import MensagemEnviada from "./pages/MensagemEnviada.jsx";
import ConhecimentoOferecido from "./pages/ConhecimentoOferecido.jsx";
import CadastroConta from "./pages/CadastroConta.jsx";
import RecuperarSenha from "./pages/RecuperarSenha.jsx";


export default function App() {
  // Estado para controlar a tela visível no momento:
  // 'contato' | 'mensagem_enviada' | 'conhecimento_oferecido' | 'cadastro' | 'recuperar_senha'
  const [telaAtual, setTelaAtual] = useState("cadastro");

  // Guarda o e-mail preenchido no formulário para exibir na tela de confirmação
  const [emailContato, setEmailContato] = useState("");

  // Transição: Formulário submetido -> Tela de Confirmação da Mensagem
  const handleEnviarMensagem = (email) => {
    setEmailContato(email);
    setTelaAtual("mensagem_enviada");
  };

  // Voltar para a tela inicial de Contato
  const handleVoltarInicio = () => {
    setTelaAtual("contato");
  };

  return (
    <div className="app-container">
      {/* Menu fixo no topo para você alternar e testar qualquer uma das telas durante o desenvolvimento */}
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
        <span style={{ color: "#A3E635", fontWeight: "bold" }}>
          Navegação de Teste:
        </span>
        <button
          type="button"
          onClick={() => setTelaAtual("contato")}
          style={{
            background: telaAtual === "contato" ? "#A3E635" : "transparent",
            color: telaAtual === "contato" ? "#111827" : "#fff",
            border: "1px solid #A3E635",
            padding: "0.2rem 0.6rem",
            cursor: "pointer",
          }}
        >
          1. Fale com a Equipe
        </button>
        <button
          type="button"
          onClick={() => setTelaAtual("mensagem_enviada")}
          style={{
            background:
              telaAtual === "mensagem_enviada" ? "#A3E635" : "transparent",
            color: telaAtual === "mensagem_enviada" ? "#111827" : "#fff",
            border: "1px solid #A3E635",
            padding: "0.2rem 0.6rem",
            cursor: "pointer",
          }}
        >
          2. Mensagem Enviada
        </button>
        <button
          type="button"
          onClick={() => setTelaAtual("conhecimento_oferecido")}
          style={{
            background:
              telaAtual === "conhecimento_oferecido" ? "#A3E635" : "transparent",
            color: telaAtual === "conhecimento_oferecido" ? "#111827" : "#fff",
            border: "1px solid #A3E635",
            padding: "0.2rem 0.6rem",
            cursor: "pointer",
          }}
        >
          3. Conhecimento Oferecido
        </button>
        <button
          type="button"
          onClick={() => setTelaAtual("cadastro")}
          style={{
            background: telaAtual === "cadastro" ? "#A3E635" : "transparent",
            color: telaAtual === "cadastro" ? "#111827" : "#fff",
            border: "1px solid #A3E635",
            padding: "0.2rem 0.6rem",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          4. Cadastro de Conta
        </button>
        <button
          type="button"
          onClick={() => setTelaAtual("recuperar_senha")}
          style={{
            background:
              telaAtual === "recuperar_senha" ? "#A3E635" : "transparent",
            color: telaAtual === "recuperar_senha" ? "#111827" : "#fff",
            border: "1px solid #A3E635",
            padding: "0.2rem 0.6rem",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          5. Recuperação de Senha
        </button>
      </nav>

      {/* Renderização Condicional das Telas */}
      {telaAtual === "contato" && (
        <FaleComEquipe
          onEnviar={handleEnviarMensagem}
          onVoltar={handleVoltarInicio}
        />
      )}

      {telaAtual === "mensagem_enviada" && (
        <MensagemEnviada
          email={emailContato || "usuario@exemplo.com"}
          onVoltar={handleVoltarInicio}
        />
      )}

      {telaAtual === "conhecimento_oferecido" && (
        <ConhecimentoOferecido
          conhecimento="React & Bootstrap"
          onVer={handleVoltarInicio}
        />
      )}

      {telaAtual === "cadastro" && (
        <CadastroConta
          onIrParaRecuperacao={() => setTelaAtual("recuperar_senha")}
          onVoltar={handleVoltarInicio}
          onEntrar={() => alert("Navegação para Tela de Login (exclusivamente visual)")}
        />
      )}

      {telaAtual === "recuperar_senha" && (
        <RecuperarSenha
          onIrParaCadastro={() => setTelaAtual("cadastro")}
          onVoltar={handleVoltarInicio}
          onEntrar={() => alert("Navegação para Tela de Login (exclusivamente visual)")}
        />
      )}
    </div>
  );
}
