import React, { useState } from 'react';

/**
 * Tela de Cadastro de Conta (wireframe lo-fi — autenticação)
 * Inspirada fielmente no layout da foto anexada e na identidade visual do Banco de Trocas.
 * Props:
 * - onIrParaRecuperacao(): chamado ao clicar em "Recuperar senha"
 * - onVoltar(): chamado ao clicar no logo para voltar ao fluxo inicial
 * - onEntrar(): chamado ao clicar em "Entrar"
 * - onCadastrar(dados): chamado ao submeter o formulário de cadastro
 */
export default function CadastroConta({
  onIrParaRecuperacao,
  onVoltar,
  onEntrar,
  onCadastrar,
}) {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  });

  const [sucesso, setSucesso] = useState(false);

  const handleChange = (campo) => (e) => {
    setForm({ ...form, [campo]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSucesso(true);
    onCadastrar?.(form);
  };

  return (
    <div className="cad-page">
      <style>{css}</style>

      {/* Cabeçalho padrão do projeto */}
      <header className="cad-header">
        <button type="button" className="cad-logo" onClick={onVoltar}>
          ← Banco de Trocas <small>[logo]</small>
        </button>
        <small className="cad-nota">[wireframe lo-fi — autenticação]</small>
      </header>

      {/* Conteúdo Centralizado */}
      <main className="container cad-main">
        <div className="cad-card">
          {/* Seletor Superior (Tabs Entrar / Cadastrar) */}
          <div className="cad-tabs">
            <button
              type="button"
              className="cad-tab cad-tab-inactive"
              onClick={onEntrar || (() => alert("Navegação para Entrar (exclusivamente visual)"))}
            >
              Entrar
            </button>
            <button
              type="button"
              className="cad-tab cad-tab-active"
            >
              Cadastrar
            </button>
          </div>

          {/* Título e Subtítulo */}
          <div className="cad-heading">
            <h1 className="cad-title">Crie sua conta</h1>
            <p className="cad-subtitle">Preencha as informações para começar</p>
          </div>

          {/* Mensagem de sucesso visual após submissão */}
          {sucesso && (
            <div className="cad-alerta-sucesso" role="status">
              ✓ Cadastro realizado com sucesso para <strong>{form.nome || "Novo Usuário"}</strong>! (Tela exclusivamente visual)
            </div>
          )}

          {/* Formulário de Cadastro */}
          <form onSubmit={handleSubmit} className="cad-form">
            <div className="mb-3">
              <label htmlFor="cad-nome" className="cad-label">
                Nome completo
              </label>
              <input
                id="cad-nome"
                type="text"
                className="form-control cad-input"
                placeholder="Seu nome"
                required
                value={form.nome}
                onChange={handleChange('nome')}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="cad-email" className="cad-label">
                E-mail
              </label>
              <input
                id="cad-email"
                type="email"
                className="form-control cad-input"
                placeholder="seu@email.com"
                required
                value={form.email}
                onChange={handleChange('email')}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="cad-senha" className="cad-label">
                Senha
              </label>
              <input
                id="cad-senha"
                type="password"
                className="form-control cad-input"
                placeholder="••••••••"
                required
                value={form.senha}
                onChange={handleChange('senha')}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="cad-confirmar-senha" className="cad-label">
                Confirmar senha
              </label>
              <input
                id="cad-confirmar-senha"
                type="password"
                className="form-control cad-input"
                placeholder="••••••••"
                required
                value={form.confirmarSenha}
                onChange={handleChange('confirmarSenha')}
              />
            </div>

            {/* Botão de Ação Principal */}
            <button type="submit" className="cad-btn-submit">
              Criar conta
            </button>
          </form>

          {/* Divisor com texto */}
          <div className="cad-divider">
            <span>ou continue com</span>
          </div>

          {/* Botões de Acesso Social */}
          <div className="row g-2 mb-4">
            <div className="col-6">
              <button
                type="button"
                className="cad-btn-social"
                onClick={() => alert("Login social Google (exclusivamente visual)")}
              >
                Google
              </button>
            </div>
            <div className="col-6">
              <button
                type="button"
                className="cad-btn-social"
                onClick={() => alert("Login social GitHub (exclusivamente visual)")}
              >
                GitHub
              </button>
            </div>
          </div>

          {/* Links Inferiores */}
          <div className="cad-links">
            <p className="mb-2">
              Já tem uma conta?{' '}
              <button
                type="button"
                className="cad-link"
                onClick={onEntrar || (() => alert("Navegação para Entrar (exclusivamente visual)"))}
              >
                Entrar
              </button>
            </p>
            <p className="mb-0">
              Esqueceu sua senha?{' '}
              <button
                type="button"
                className="cad-link"
                onClick={onIrParaRecuperacao}
              >
                Recuperar senha
              </button>
            </p>
          </div>

          {/* Nota de rodapé lo-fi fiel ao modelo */}
          <div className="cad-rodape-nota">
            [wireframe lo-fi — autenticação]
          </div>
        </div>
      </main>
    </div>
  );
}

const css = `
@import url("https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap");

.cad-page {
  min-height: 100vh;
  background: #F8FAFC;
  color: #111827;
  font-family: "Caveat", "Segoe Print", cursive;
  font-size: 1.2rem;
}

.cad-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-bottom: 2px solid #111827;
  padding: 0.9rem 2rem;
}

.cad-logo {
  background: none;
  border: 0;
  padding: 0;
  font: inherit;
  font-size: 1.3rem;
  color: #111827;
  cursor: pointer;
}

.cad-logo small,
.cad-nota {
  font-size: 0.85rem;
  color: #6B7280;
}

.cad-main {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem 1rem 4rem;
}

.cad-card {
  width: 100%;
  max-width: 460px;
  background: #fff;
  border: 2px solid #111827;
  box-shadow: 0 0 0 1px #E5E7EB;
  padding: 2.2rem 2rem;
}

/* Tabs superiores */
.cad-tabs {
  display: flex;
  border: 2px solid #111827;
  margin-bottom: 2rem;
}

.cad-tab {
  flex: 1;
  padding: 0.75rem 0.5rem;
  font-family: inherit;
  font-size: 1.25rem;
  border: none;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s ease-in-out;
}

.cad-tab-inactive {
  background: #fff;
  color: #111827;
  border-right: 2px solid #111827;
}

.cad-tab-inactive:hover {
  background: #F3F4F6;
}

.cad-tab-active {
  background: #111827;
  color: #fff;
  font-weight: 700;
}

/* Tipografia */
.cad-heading {
  margin-bottom: 1.6rem;
}

.cad-title {
  font-size: 2.4rem;
  font-weight: 700;
  margin: 0 0 0.3rem;
  color: #111827;
}

.cad-subtitle {
  font-size: 1.15rem;
  color: #6B7280;
  margin: 0;
  font-style: italic;
}

/* Alerta de confirmação visual */
.cad-alerta-sucesso {
  background: #F0FDF4;
  border: 2px solid #111827;
  color: #166534;
  padding: 0.8rem 1rem;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

/* Campos de formulário */
.cad-label {
  display: block;
  font-size: 1.1rem;
  margin-bottom: 0.35rem;
  color: #111827;
}

.cad-input.form-control {
  border: 2px solid #111827;
  border-radius: 0;
  color: #111827;
  font-family: inherit;
  font-size: 1.15rem;
  padding: 0.7rem 0.85rem;
  background-color: #fff;
}

.cad-input::placeholder {
  color: #9CA3AF;
  font-style: italic;
}

.cad-input:focus {
  border-color: #111827;
  box-shadow: 0 0 0 0.25rem rgba(163, 230, 53, 0.6);
  outline: none;
}

/* Botão principal com estética wireframe + identidade da marca */
.cad-btn-submit {
  width: 100%;
  background: #111827;
  color: #fff;
  border: 2px solid #111827;
  border-radius: 0;
  padding: 0.85rem 1.2rem;
  font-family: inherit;
  font-size: 1.3rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.cad-btn-submit:hover {
  background: #A3E635;
  color: #111827;
  border-color: #111827;
}

.cad-btn-submit:focus-visible,
.cad-btn-social:focus-visible,
.cad-tab:focus-visible,
.cad-logo:focus-visible {
  outline: 3px solid #111827;
  outline-offset: 3px;
}

/* Divisor tracejado */
.cad-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.8rem 0;
  color: #6B7280;
  font-size: 1rem;
}

.cad-divider::before,
.cad-divider::after {
  content: '';
  flex: 1;
  border-top: 1px dashed #9CA3AF;
}

.cad-divider span {
  padding: 0 0.8rem;
  font-style: italic;
}

/* Botões sociais */
.cad-btn-social {
  width: 100%;
  background: #fff;
  color: #111827;
  border: 2px solid #111827;
  border-radius: 0;
  padding: 0.65rem 0.5rem;
  font-family: inherit;
  font-size: 1.15rem;
  cursor: pointer;
  transition: background 0.15s ease-in-out;
}

.cad-btn-social:hover {
  background: #F3F4F6;
}

/* Links no rodapé do card */
.cad-links {
  text-align: center;
  margin-top: 1.2rem;
  font-size: 1.1rem;
  color: #4B5563;
}

.cad-link {
  background: none;
  border: none;
  padding: 0;
  font-family: inherit;
  font-size: inherit;
  font-weight: 700;
  color: #111827;
  text-decoration: underline;
  cursor: pointer;
}

.cad-link:hover {
  color: #000;
}

/* Nota wireframe */
.cad-rodape-nota {
  text-align: center;
  margin-top: 2rem;
  padding-top: 0.8rem;
  border-top: 1px dashed #D1D5DB;
  font-size: 0.9rem;
  color: #9CA3AF;
}
`;

