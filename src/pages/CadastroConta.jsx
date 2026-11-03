import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Campo from "../components/Campo.jsx";
import BotoesSociais from "../components/BotoesSociais.jsx";
import { ROTAS } from "../routes.js";
import { authService } from "../services/authService.js";
import { validarCadastro } from "../utils/validacoes.js";

export default function CadastroConta() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: "", email: "", senha: "", confirmarSenha: "" });
  const [erros, setErros] = useState({});
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const senhasDiferentes = form.confirmarSenha !== "" && form.senha !== form.confirmarSenha;

  const cadastrar = async (e) => {
    e.preventDefault();
    setErro(null);

    const novosErros = validarCadastro(form);
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setEnviando(true);
    try {
      await authService.cadastrar({
        nome: form.nome.trim(),
        email: form.email.trim(),
        senha: form.senha,
      });
      navigate(ROTAS.login, { state: { cadastrado: true } });
    } catch (err) {
      setErro(err.message || "Não foi possível criar a conta.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="container auth-main">
      <div className="auth-card">
        <div className="tabs-bt">
          <Link to={ROTAS.login} className="tab-bt">Entrar</Link>
          <span className="tab-bt active" aria-current="page">Cadastrar</span>
        </div>

        <h1 className="auth-title">Crie sua conta</h1>
        <p className="auth-subtitle">Preencha as informações para começar</p>

        {erro && <div className="alert-erro" role="alert">{erro}</div>}

        <form onSubmit={cadastrar} noValidate>
          <Campo id="cad-nome" label="Nome completo" placeholder="Seu nome"
            autoComplete="name" value={form.nome} onChange={set("nome")} erro={erros.nome} />
          <Campo id="cad-email" label="E-mail" type="email" placeholder="seu@email.com"
            autoComplete="email" value={form.email} onChange={set("email")} erro={erros.email} />
          <Campo id="cad-senha" label="Senha" dica="(mínimo 8 caracteres, com letras e números)"
            type="password" placeholder="••••••••"
            autoComplete="new-password" value={form.senha} onChange={set("senha")} erro={erros.senha} />
          <Campo id="cad-confirmar" label="Confirmar senha" type="password" placeholder="••••••••"
            autoComplete="new-password" value={form.confirmarSenha} onChange={set("confirmarSenha")}
            erro={erros.confirmarSenha || (senhasDiferentes ? "As senhas não coincidem." : null)} />

          <button type="submit" className="btn btn-brand w-100 mt-2" disabled={enviando}>
            {enviando ? "Criando conta…" : "Criar conta"}
          </button>
        </form>

        <BotoesSociais />

        <div className="text-center small text-secondary mt-4">
          <p className="mb-2">
            Já tem uma conta?{" "}
            <Link to={ROTAS.login} className="link-inline">Entrar</Link>
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