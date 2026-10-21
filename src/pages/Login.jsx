import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Campo from "../components/Campo.jsx";
import BotoesSociais from "../components/BotoesSociais.jsx";
import { ROTAS } from "../routes.js";

export default function Login() {
  const navigate = useNavigate();
  const { state } = useLocation(); // { cadastrado: true } quando vem do cadastro
  const [form, setForm] = useState({ email: "", senha: "" });

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const entrar = (e) => {
    e.preventDefault();
    navigate(ROTAS.inicio);
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

        <form onSubmit={entrar}>
          <Campo id="login-email" label="E-mail" type="email" placeholder="seu@email.com"
            required value={form.email} onChange={set("email")} />
          <Campo id="login-senha" label="Senha" type="password" placeholder="••••••••"
            required value={form.senha} onChange={set("senha")} />

          <button type="submit" className="btn btn-brand w-100 mt-2">Entrar</button>
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