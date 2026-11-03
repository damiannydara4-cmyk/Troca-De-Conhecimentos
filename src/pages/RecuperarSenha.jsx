import React, { useState } from "react";
import { Link } from "react-router-dom";
import Campo from "../components/Campo.jsx";
import { ROTAS } from "../routes.js";
import { authService } from "../services/authService.js";
import { validarEmail } from "../utils/validacoes.js";

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [erroEmail, setErroEmail] = useState(null);
  const [erro, setErro] = useState(null);
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const redefinir = async (e) => {
    e.preventDefault();
    setErro(null);
    setEnviado(false);

    const problema = validarEmail(email);
    setErroEmail(problema);
    if (problema) return;

    setEnviando(true);
    try {
      await authService.recuperarSenha(email.trim());
      setEnviado(true);
    } catch (err) {
      setErro(err.message || "Não foi possível enviar o e-mail.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="container auth-main">
      <div className="auth-card">
        <div className="tabs-bt">
          <Link to={ROTAS.login} className="tab-bt">← Entrar</Link>
          <span className="tab-bt active" aria-current="page">Recuperar</span>
        </div>

        <h1 className="auth-title">Recupere sua senha</h1>
        <p className="auth-subtitle">Informe seu e-mail e enviaremos um link para criar uma nova senha</p>

        {enviado && (
          <div className="alert-ok" role="status">
            ✓ Se existir uma conta com {email.trim()}, enviamos um link para redefinir a senha.
            Verifique sua caixa de entrada e o spam.
          </div>
        )}
        {erro && <div className="alert-erro" role="alert">{erro}</div>}

        <form onSubmit={redefinir} noValidate>
          <Campo id="rec-email" label="E-mail cadastrado" type="email" placeholder="seu@email.com"
            autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} erro={erroEmail} />

          <button type="submit" className="btn btn-brand w-100 mt-2" disabled={enviando}>
            {enviando ? "Enviando…" : "Enviar link de redefinição"}
          </button>
        </form>

        <div className="text-center small text-secondary mt-4">
          Não tem uma conta?{" "}
          <Link to={ROTAS.cadastro} className="link-inline">Cadastre-se</Link>
        </div>
      </div>
    </div>
  );
}