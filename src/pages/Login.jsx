import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Campo from "../components/Campo.jsx";
import BotoesSociais from "../components/BotoesSociais.jsx";
import { ROTAS } from "../routes.js";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { state } = useLocation(); // { cadastrado: true } vindo do cadastro | { from } vindo da RotaProtegida
  const { entrar, autenticado, carregando } = useAuth();

  const [form, setForm] = useState({ email: "", senha: "" });
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  // Para onde ir depois de entrar: a página que o usuário tentou abrir, ou o início
  const destino = state?.from?.pathname ?? ROTAS.inicio;

  // Quem já está logado não precisa ver a tela de login
  if (!carregando && autenticado) return <Navigate to={destino} replace />;

  const handleEntrar = async (e) => {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await entrar(form.email.trim(), form.senha);
      navigate(destino, { replace: true });
    } catch (err) {
      setErro(err.message || "Não foi possível entrar.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="container auth-main">
      <div className="auth-card">
        <div className="tabs-bt">
          <span className="tab-bt active" aria-current="page">Entrar</span>
          <Link to={ROTAS.cadastro} className="tab-bt">Cadastrar</Link>
        </div>

        <h1 className="auth-title">Bem-vindo de volta</h1>
        <p className="auth-subtitle">Entre com suas informações para continuar</p>

        {state?.cadastrado && (
          <div className="alert-ok" role="status">✓ Conta criada! Entre para continuar.</div>
        )}
        {state?.from && !state?.cadastrado && (
          <div className="alert-ok" role="status">Entre para acessar esta página.</div>
        )}
        {erro && <div className="alert-erro" role="alert">{erro}</div>}

        <form onSubmit={handleEntrar}>
          <Campo id="login-email" label="E-mail" type="email" placeholder="seu@email.com"
            required autoComplete="email" value={form.email} onChange={set("email")} />
          <Campo id="login-senha" label="Senha" type="password" placeholder="••••••••"
            required autoComplete="current-password" value={form.senha} onChange={set("senha")} />

          <button type="submit" className="btn btn-brand w-100 mt-2" disabled={enviando}>
            {enviando ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <BotoesSociais />

        <div className="text-center small text-secondary mt-4">
          <p className="mb-2">
            Não tem uma conta?{" "}
            <Link to={ROTAS.cadastro} className="link-inline">Cadastre-se</Link>
          </p>
          <p className="mb-0">
            Esqueceu sua senha?{" "}
            <Link to={ROTAS.recuperarSenha} className="link-inline">Recuperar senha</Link>
          </p>
        </div>
      </div>
    </div>
  );
}