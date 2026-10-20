import React, { useState } from 'react';
import './Login.css';

export default function Login({
  onIrParaCadastro,
  onIrParaRecuperacao,
  onVoltar,
  onLogin,
}) {
  const [form, setForm] = useState({
    email: '',
    senha: '',
  });

  const [sucesso, setSucesso] = useState(false);

  const handleChange = (campo) => (e) => {
    setForm({ ...form, [campo]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSucesso(true);
    onLogin?.(form);
  };

  return (
    <div className="log-page">
      {/* Cabeçalho padrão do projeto */}
      <header className="log-header">
        <button type="button" className="log-logo" onClick={onVoltar}>
          <span className="log-seta">←</span> Banco de Trocas
        </button>
      </header>

      {/* Conteúdo Centralizado */}
      <main className="container log-main">
        <div className="log-card">
          {/* Seletor Superior (Tabs Entrar / Cadastrar) */}
          <div className="log-tabs">
            <button
              type="button"
              className="log-tab log-tab-active"
            >
              Entrar
            </button>
            <button
              type="button"
              className="log-tab log-tab-inactive"
              onClick={onIrParaCadastro || (() => alert("Navegação para Cadastro (exclusivamente visual)"))}
            >
              Cadastrar
            </button>
          </div>

          {/* Título e Subtítulo */}
          <div className="log-heading">
            <h1 className="log-title">Bem-vindo de volta</h1>
            <p className="log-subtitle">Entre com suas informações para continuar</p>
          </div>

          {/* Mensagem de sucesso dentro do card após submissão */}
          {sucesso && (
            <div className="log-alerta-sucesso" role="status">
              <span className="log-bolinha" aria-hidden="true">✓</span>
              <span>Login realizado com sucesso!</span>
            </div>
          )}

          {/* Formulário de Login */}
          <form onSubmit={handleSubmit} className="log-form">
            <div className="mb-3">
              <label htmlFor="log-email" className="log-label">
                E-mail
              </label>
              <input
                id="log-email"
                type="email"
                className="form-control log-input"
                placeholder="seu@email.com"
                required
                value={form.email}
                onChange={handleChange('email')}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="log-senha" className="log-label">
                Senha
              </label>
              <input
                id="log-senha"
                type="password"
                className="form-control log-input"
                placeholder="••••••••"
                required
                value={form.senha}
                onChange={handleChange('senha')}
              />
            </div>

            {/* Botão de Ação Principal */}
            <button type="submit" className="log-btn-submit">
              Entrar
            </button>
          </form>

          {/* Divisor com texto */}
          <div className="log-divider">
            <span>ou continue com</span>
          </div>

          {/* Botões de Acesso Social */}
          <div className="row g-2 mb-4">
            <div className="col-6">
              <button
                type="button"
                className="log-btn-social"
                onClick={() => alert("Login social Google (exclusivamente visual)")}
              >
                Google
              </button>
            </div>
            <div className="col-6">
              <button
                type="button"
                className="log-btn-social"
                onClick={() => alert("Login social GitHub (exclusivamente visual)")}
              >
                GitHub
              </button>
            </div>
          </div>

          {/* Links Inferiores */}
          <div className="log-links">
            <p className="mb-2">
              Não tem uma conta?{' '}
              <button
                type="button"
                className="log-link"
                onClick={onIrParaCadastro || (() => alert("Navegação para Cadastro (exclusivamente visual)"))}
              >
                Cadastre-se
              </button>
            </p>
            <p className="mb-0">
              Esqueceu sua senha?{' '}
              <button
                type="button"
                className="log-link"
                onClick={onIrParaRecuperacao}
              >
                Recuperar senha
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
