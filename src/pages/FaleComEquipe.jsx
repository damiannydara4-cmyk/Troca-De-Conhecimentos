import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROTAS } from "../routes.js";

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

const VAZIO = { nome: "", email: "", assunto: "", mensagem: "" };

export default function FaleComEquipe() {
  const navigate = useNavigate();
  const [form, setForm] = useState(VAZIO);

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const enviar = (e) => {
    e.preventDefault();
    navigate(ROTAS.mensagemEnviada, { state: { email: form.email } });
  };

  return (
    <div className="container py-5">
      <div className="row g-5">
        {/* Coluna esquerda */}
        <section className="col-lg-5">
          <p className="eyebrow mb-2">Falar com a equipe</p>
          <h1 className="display-6 fw-bolder">Fale com a gente</h1>
          <p className="text-secondary mb-4">
            Tem alguma dúvida, sugestão ou quer saber mais sobre o Banco de Trocas?
            Nossa equipe está pronta para ajudar.
          </p>

          {CONTATOS.map((c) => (
            <div className="card-bt d-flex align-items-center gap-3 p-3 mb-3" key={c.rotulo}>
              <span className="icon-box" aria-hidden="true">{c.icone}</span>
              <div>
                <div className="small text-secondary">{c.rotulo}</div>
                <div className="fw-bold">{c.valor}</div>
              </div>
            </div>
          ))}

          <div className="card-bt p-4 mt-4">
            <h2 className="h6 fw-bold mb-3">Perguntas frequentes</h2>
            <ul className="list-unstyled mb-0">
              {FAQ.map((pergunta) => (
                <li key={pergunta} className="small py-2 border-top">→ {pergunta}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Coluna direita */}
        <section className="col-lg-7">
          <form className="card-bt p-4 p-md-5" onSubmit={enviar}>
            <h2 className="h4 fw-bolder mb-4">Enviar mensagem</h2>

            <div className="row g-3 mb-3">
              <div className="col-sm-6">
                <label htmlFor="ft-nome" className="form-label">Nome</label>
                <input id="ft-nome" className="form-control" placeholder="Seu nome" required
                  value={form.nome} onChange={set("nome")} />
              </div>
              <div className="col-sm-6">
                <label htmlFor="ft-email" className="form-label">E-mail</label>
                <input id="ft-email" type="email" className="form-control" placeholder="seu@email.com" required
                  value={form.email} onChange={set("email")} />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="ft-assunto" className="form-label">Assunto</label>
              <select id="ft-assunto" className="form-select" required
                value={form.assunto} onChange={set("assunto")}>
                <option value="">Selecione um assunto...</option>
                <option>Dúvida geral</option>
                <option>Sugestão</option>
                <option>Problema técnico</option>
                <option>Parceria</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="ft-msg" className="form-label">Mensagem</label>
              <textarea id="ft-msg" rows={5} className="form-control" placeholder="Escreva sua mensagem aqui..." required
                value={form.mensagem} onChange={set("mensagem")} />
            </div>

            <div className="d-flex gap-3">
              <button type="button" className="btn btn-cancel" onClick={() => setForm(VAZIO)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-brand flex-grow-1">Enviar mensagem</button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}