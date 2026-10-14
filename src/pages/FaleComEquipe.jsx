import React, { useState } from 'react';

/**
 * Tela 1 — Fale com a equipe (modelo: wireframe de contato)
 * Requer: import "bootstrap/dist/css/bootstrap.min.css" no ponto de entrada do projeto.
 * Props: onEnviar(email) — chamado ao enviar o formulário; onVoltar() — clique no logo.
 */
const FAQ = [
  "Como funciona a troca de conhecimentos?",
  "Posso oferecer mais de um conhecimento?",
  "A plataforma é gratuita?",
];

const CONTATOS = [
  { icone: "📧", rotulo: "E-mail", valor: "equipe@bancodetrocas.com.br" },
  { icone: "💬", rotulo: "Resposta em", valor: "Até 2 dias úteis" },
  { icone: "🌐", rotulo: "Comunidade", valor: "forum.bancodetrocas.com.br" },
];

const vazio = { nome: "", email: "", assunto: "", mensagem: "" };

export default function FaleComEquipe({ onEnviar, onVoltar }) {
  const [form, setForm] = useState(vazio);
  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const enviar = (e) => {
    e.preventDefault();
    onEnviar?.(form.email);
  };

  return (
    <div className="ft-page">
      <style>{css}</style>

      <header className="ft-header">
        <button type="button" className="ft-logo" onClick={onVoltar}>
          ← Banco de Trocas <small>[logo]</small>
        </button>
        <small className="ft-nota">[wireframe lo-fi — contato]</small>
      </header>

      <main className="container ft-main">
        <div className="row g-5">
          {/* Coluna esquerda */}
          <section className="col-lg-5">
            <div className="ft-eyebrow">[ FALAR COM A EQUIPE ]</div>
            <h1 className="ft-title">Fale com a gente</h1>
            <p className="ft-intro">
              Tem alguma dúvida, sugestão ou quer saber mais sobre o Banco de Trocas? Nossa equipe está pronta para ajudar.
            </p>

            {CONTATOS.map((c) => (
              <div className="ft-box ft-contato" key={c.rotulo}>
                <span className="ft-emoji" aria-hidden="true">{c.icone}</span>
                <div>
                  <div className="ft-rotulo">{c.rotulo}</div>
                  <div className="ft-valor">{c.valor}</div>
                </div>
              </div>
            ))}

            <div className="ft-box ft-faq">
              <h2>Perguntas frequentes</h2>
              <ul>
                {FAQ.map((q) => (
                  <li key={q}>
                    <a href="#faq" onClick={(e) => e.preventDefault()}>→ {q}</a>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Coluna direita */}
          <section className="col-lg-7">
            <form className="ft-box ft-form" onSubmit={enviar}>
              <h2>Enviar mensagem</h2>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label htmlFor="ft-nome" className="ft-label">Nome</label>
                  <input id="ft-nome" className="form-control ft-input" placeholder="Seu nome" required
                    value={form.nome} onChange={set("nome")} />
                </div>
                <div className="col-6">
                  <label htmlFor="ft-email" className="ft-label">E-mail</label>
                  <input id="ft-email" type="email" className="form-control ft-input" placeholder="seu@email.com" required
                    value={form.email} onChange={set("email")} />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="ft-assunto" className="ft-label">Assunto</label>
                <select id="ft-assunto" className="form-select ft-input" required
                  value={form.assunto} onChange={set("assunto")}>
                  <option value="">Selecione um assunto...</option>
                  <option>Dúvida geral</option>
                  <option>Sugestão</option>
                  <option>Problema técnico</option>
                  <option>Parceria</option>
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="ft-msg" className="ft-label">Mensagem</label>
                <textarea id="ft-msg" rows={5} className="form-control ft-input" placeholder="Escreva sua mensagem aqui..." required
                  value={form.mensagem} onChange={set("mensagem")} />
              </div>

              <div className="d-flex gap-3">
                <button type="button" className="ft-btn ft-btn-sec" onClick={() => setForm(vazio)}>Cancelar</button>
                <button type="submit" className="ft-btn ft-btn-pri flex-grow-1">Enviar mensagem</button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

const css = `
@import url("https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap");
.ft-page{min-height:100vh;background:#F8FAFC;color:#111827;font-family:"Caveat","Segoe Print",cursive;font-size:1.2rem}
.ft-header{display:flex;justify-content:space-between;align-items:center;background:#fff;border-bottom:2px solid #111827;padding:.9rem 2rem}
.ft-logo{background:none;border:0;padding:0;font:inherit;font-size:1.3rem;color:#111827}
.ft-logo small,.ft-nota{font-size:.85rem;color:#6B7280}
.ft-main{max-width:980px;padding:3rem 1rem 4rem}
.ft-eyebrow{border-top:1px dashed #9CA3AF;padding-top:.3rem;font-size:.9rem;letter-spacing:.06em;color:#6B7280;margin-bottom:.6rem}
.ft-title{font-size:2.6rem;font-weight:700;margin:0 0 .8rem}
.ft-intro{margin-bottom:1.6rem;line-height:1.7}
.ft-box{background:#fff;border:2px solid #111827;box-shadow:0 0 0 1px #E5E7EB}
.ft-contato{display:flex;align-items:center;gap:1rem;padding:1.1rem 1.2rem;margin-bottom:1rem}
.ft-emoji{font-size:1.6rem;width:32px;text-align:center}
.ft-rotulo{font-size:.9rem;color:#4B5563}
.ft-valor{font-size:1.15rem}
.ft-faq{padding:1.3rem 1.3rem .6rem;margin-top:1.8rem}
.ft-faq h2{font-size:1.15rem;font-weight:500;margin:0 0 .5rem}
.ft-faq ul{list-style:none;margin:0;padding:0}
.ft-faq li{border-top:1px dashed #9CA3AF;padding:.65rem 0}
.ft-faq a{color:#111827;text-decoration:none;font-size:1.05rem}
.ft-faq a:hover{text-decoration:underline}
.ft-form{padding:2rem 2rem 2.4rem}
.ft-form h2{font-size:1.7rem;font-weight:700;margin:0 0 1.6rem}
.ft-label{display:block;font-size:1rem;margin-bottom:.4rem}
.ft-input.form-control,.ft-input.form-select{border:2px solid #111827;border-radius:0;color:#111827;font-family:inherit;font-size:1.1rem;padding:.7rem .8rem;background-color:#fff}
.ft-input::placeholder{color:#6B7280;font-style:italic}
.ft-input:focus{border-color:#111827;box-shadow:0 0 0 .25rem rgba(163,230,53,.6)}
.ft-btn{border:2px solid #111827;border-radius:0;padding:.8rem 1.2rem;font:inherit;font-size:1.15rem;color:#111827}
.ft-btn-sec{background:#fff;min-width:146px}
.ft-btn-sec:hover{background:#F3F4F6}
.ft-btn-pri{background:#A3E635;font-weight:700}
.ft-btn-pri:hover{background:#8FD11F}
.ft-btn:focus-visible,.ft-logo:focus-visible{outline:3px solid #111827;outline-offset:3px}
`;
