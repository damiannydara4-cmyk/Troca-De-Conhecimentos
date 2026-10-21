import React, { useState } from "react";
import { Link } from "react-router-dom";
import Campo from "../components/Campo.jsx";
import { ROTAS } from "../routes.js";

export default function RecuperarSenha() {
  const [form, setForm] = useState({ email: "", codigo: "", novaSenha: "", confirmarNovaSenha: "" });
  const [enviado, setEnviado] = useState(false);

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const senhasDiferentes =
    form.confirmarNovaSenha !== "" && form.novaSenha !== form.confirmarNovaSenha;

  const redefinir = (e) => {
    e.preventDefault();
    if (senhasDiferentes) return;
    setEnviado(true);
  };

  return (
    <div className="container auth-main">
      <div className="auth-card">
        <div className="tabs-bt">
          <Link to={ROTAS.login} className="tab-bt">← Entrar</Link>
          <span className="tab-bt active" aria-current="page">Recuperar</span>
        </div>

        <h1 className="auth-title">Recupere sua senha</h1>
        <p className="auth-subtitle">Preencha as informações para redefinir seu acesso</p>

        {enviado && (
          <div className="alert-ok" role="status">
            ✓ Instruções enviadas para {form.email}! Verifique sua caixa de entrada.
          </div>
        )}

        <form onSubmit={redefinir}>
          <Campo id="rec-email" label="E-mail cadastrado" type="email" placeholder="seu@email.com"
            required value={form.email} onChange={set("email")} />
          <Campo id="rec-codigo" label="Código de verificação" dica="(se já recebeu por e-mail)"
            placeholder="Ex: 123456" value={form.codigo} onChange={set("codigo")} />
          <Campo id="rec-nova" label="Nova senha" type="password" placeholder="••••••••"
            required value={form.novaSenha} onChange={set("novaSenha")} />
          <Campo id="rec-confirmar" label="Confirmar nova senha" type="password" placeholder="••••••••"
            required value={form.confirmarNovaSenha} onChange={set("confirmarNovaSenha")}
            erro={senhasDiferentes ? "As senhas não coincidem." : null} />

          <button type="submit" className="btn btn-brand w-100 mt-2">Redefinir senha</button>
        </form>

        <div className="text-center small text-secondary mt-4">
          Não tem uma conta?{" "}
          <Link to={ROTAS.cadastro} className="link-inline">Cadastre-se</Link>
        </div>
      </div>
    </div>
  );
}