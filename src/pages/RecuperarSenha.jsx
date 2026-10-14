import React, { useState } from 'react';

/**
 * Tela de Recuperação de Senha da Conta (wireframe lo-fi — recuperação)
 * Mantém a simetria, simplicidade e posicionamento dos elementos com base na identidade visual e no layout de autenticação.
 * Props:
 * - onIrParaCadastro(): chamado para voltar à tela de Cadastro de Conta
 * - onVoltar(): chamado ao clicar no logo para voltar ao início
 * - onEntrar(): chamado ao clicar em "Entrar"
 * - onRecuperar(dados): chamado ao submeter a solicitação de redefinição
 */
export default function RecuperarSenha({
  onIrParaCadastro,
  onVoltar,
  onEntrar,
  onRecuperar,
}) {
  const [form, setForm] = useState({
    email: '',
    codigo: '',
    novaSenha: '',
    confirmarNovaSenha: '',
  });

  const [sucesso, setSucesso] = useState(false);

  const handleChange = (campo) => (e) => {
    setForm({ ...form, [campo]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSucesso(true);
    onRecuperar?.(form);
  };

  return (
    <div className="rec-page">
      <style>{css}</style>

      {/* Cabeçalho padrão do projeto */}
      <header className="rec-header">
        <button type="button" className="rec-logo" onClick={onVoltar}>
          ← Banco de Trocas <small>[logo]</small>
        </button>
        <small className="rec-nota">[wireframe lo-fi — recuperação de senha]</small>
      </header>

      {/* Conteúdo Centralizado */}
      <main className="container rec-main">
        <div className="rec-card">
          {/* Seletor Superior (Alternância entre Voltar ao Cadastro / Recuperar) */}
          <div className="rec-tabs">
            <button
              type="button"
              className="rec-tab rec-tab-inactive"
              onClick={onIrParaCadastro}
            >
              ← Cadastrar
            </button>
            <button
              type="button"
              className="rec-tab rec-tab-active"
            >
              Recuperar
            </button>
          </div>

          {/* Título e Subtítulo */}
          <div className="rec-heading">
            <h1 className="rec-title">Recupere sua senha</h1>
            <p className="rec-subtitle">Preencha as informações para redefinir seu acesso</p>
          </div>

          {/* Mensagem de confirmação visual */}
          {sucesso && (
            <div className="rec-alerta-sucesso" role="status">
              ✓ Instruções enviadas para <strong>{form.email || "seu e-mail"}</strong>! Verifique sua caixa de entrada. (Demonstração visual)
            </div>
          )}

          {/* Formulário de Recuperação com ritmo idêntico de 4 campos */}
          <form onSubmit={handleSubmit} className="rec-form">
            <div className="mb-3">
              <label htmlFor="rec-email" className="rec-label">
                E-mail cadastrado
              </label>
              <input
                id="rec-email"
                type="email"
                className="form-control rec-input"
                placeholder="seu@email.com"
                required
                value={form.email}
                onChange={handleChange('email')}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="rec-codigo" className="rec-label">
                Código de verificação <small className="text-muted">(se já recebeu por e-mail)</small>
              </label>
              <input
                id="rec-codigo"
                type="text"
                className="form-control rec-input"
                placeholder="Ex: 123456"
                value={form.codigo}
                onChange={handleChange('codigo')}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="rec-nova-senha" className="rec-label">
                Nova senha
              </label>
              <input
                id="rec-nova-senha"
                type="password"
                className="form-control rec-input"
                placeholder="••••••••"
                required
                value={form.novaSenha}
                onChange={handleChange('novaSenha')}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="rec-confirmar-nova-senha" className="rec-label">
                Confirmar nova senha
              </label>
              <input
                id="rec-confirmar-nova-senha"
                type="password"
                className="form-control rec-input"
                placeholder="••••••••"
                required
                value={form.confirmarNovaSenha}
                onChange={handleChange('confirmarNovaSenha')}
              />
            </div>

            {/* Botão de Ação Principal */}
            <button type="submit" className="rec-btn-submit">
              Redefinir senha
            </button>
          </form>

          {/* Divisor com texto */}
          <div className="rec-divider">
            <span>ou alterne para</span>
          </div>

          {/* Botões de Ação Alternativos */}
          <div className="row g-2 mb-4">
            <div className="col-6">
              <button
                type="button"
                className="rec-btn-alt"
                onClick={onIrParaCadastro}
              >
                Criar conta
              </button>
            </div>
            <div className="col-6">
              <button
                type="button"
                className="rec-btn-alt"
                onClick={onEntrar || (() => alert("Navegação para Entrar (exclusivamente visual)"))}
              >
                Fazer login
              </button>
            </div>
          </div>

          {/* Links Inferiores */}
          <div className="rec-links">
            <p className="mb-0">
              Lembrou sua senha?{' '}
              <button
                type="button"
                className="rec-link"
                onClick={onIrParaCadastro}
              >
                Voltar ao cadastro
              </button>
            </p>
          </div>

          {/* Nota de rodapé lo-fi */}
          <div className="rec-rodape-nota">
            [wireframe lo-fi — recuperação de senha]
          </div>
        </div>
      </main>
    </div>
  );
}

const css = `
@import url("https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap");

.rec-page {
  min-height: 100vh;
  background: #F8FAFC;
  color: #111827;
  font-family: "Caveat", "Segoe Print", cursive;
  font-size: 1.2rem;
}

.rec-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-bottom: 2px solid #111827;
  padding: 0.9rem 2rem;
}

.rec-logo {
  background: none;
  border: 0;
  padding: 0;
  font: inherit;
  font-size: 1.3rem;
  color: #111827;
  cursor: pointer;
}

.rec-logo small,
.rec-nota {
  font-size: 0.85rem;
  color: #6B7280;
}

.rec-main {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem 1rem 4rem;
}

.rec-card {
  width: 100%;
  max-width: 460px;
  background: #fff;
  border: 2px solid #111827;
  box-shadow: 0 0 0 1px #E5E7EB;
  padding: 2.2rem 2rem;
}

/* Tabs superiores */
.rec-tabs {
  display: flex;
  border: 2px solid #111827;
  margin-bottom: 2rem;
}

.rec-tab {
  flex: 1;
  padding: 0.75rem 0.5rem;
  font-family: inherit;
  font-size: 1.25rem;
  border: none;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s ease-in-out;
}

.rec-tab-inactive {
  background: #fff;
  color: #111827;
  border-right: 2px solid #111827;
}

.rec-tab-inactive:hover {
  background: #F3F4F6;
}

.rec-tab-active {
  background: #111827;
  color: #fff;
  font-weight: 700;
}

/* Tipografia */
.rec-heading {
  margin-bottom: 1.6rem;
}

.rec-title {
  font-size: 2.4rem;
  font-weight: 700;
  margin: 0 0 0.3rem;
  color: #111827;
}

.rec-subtitle {
  font-size: 1.15rem;
  color: #6B7280;
  margin: 0;
  font-style: italic;
}

/* Alerta de confirmação visual */
.rec-alerta-sucesso {
  background: #F0FDF4;
  border: 2px solid #111827;
  color: #166534;
  padding: 0.8rem 1rem;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

/* Campos de formulário */
.rec-label {
  display: block;
  font-size: 1.1rem;
  margin-bottom: 0.35rem;
  color: #111827;
}

.rec-input.form-control {
  border: 2px solid #111827;
  border-radius: 0;
  color: #111827;
  font-family: inherit;
  font-size: 1.15rem;
  padding: 0.7rem 0.85rem;
  background-color: #fff;
}

.rec-input::placeholder {
  color: #9CA3AF;
  font-style: italic;
}

.rec-input:focus {
  border-color: #111827;
  box-shadow: 0 0 0 0.25rem rgba(163, 230, 53, 0.6);
  outline: none;
}

/* Botão principal com estética wireframe + identidade da marca */
.rec-btn-submit {
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

.rec-btn-submit:hover {
  background: #A3E635;
  color: #111827;
  border-color: #111827;
}

.rec-btn-submit:focus-visible,
.rec-btn-alt:focus-visible,
.rec-tab:focus-visible,
.rec-logo:focus-visible {
  outline: 3px solid #111827;
  outline-offset: 3px;
}

/* Divisor tracejado */
.rec-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.8rem 0;
  color: #6B7280;
  font-size: 1rem;
}

.rec-divider::before,
.rec-divider::after {
  content: '';
  flex: 1;
  border-top: 1px dashed #9CA3AF;
}

.rec-divider span {
  padding: 0 0.8rem;
  font-style: italic;
}

/* Botões alternativos */
.rec-btn-alt {
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

.rec-btn-alt:hover {
  background: #F3F4F6;
}

/* Links no rodapé do card */
.rec-links {
  text-align: center;
  margin-top: 1.2rem;
  font-size: 1.1rem;
  color: #4B5563;
}

.rec-link {
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

.rec-link:hover {
  color: #000;
}

/* Nota wireframe */
.rec-rodape-nota {
  text-align: center;
  margin-top: 2rem;
  padding-top: 0.8rem;
  border-top: 1px dashed #D1D5DB;
  font-size: 0.9rem;
  color: #9CA3AF;
}
`;

