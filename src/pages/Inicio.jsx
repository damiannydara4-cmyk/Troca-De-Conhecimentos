import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import previaPlataforma from "../assets/previaWeb.png";
import { ROTAS } from "../routes.js";
import { contarConhecimentos } from "../services/conhecimentoService.js";

const FUNC = [
  { i: "✏️", t: "Ofereça o que sabe", d: "Cadastre seus conhecimentos e habilidades para ensinar." },
  { i: "📚", t: "Categorias temáticas", d: "Organize e descubra conhecimento por área de interesse." },
  { i: "💬", t: "Converse diretamente", d: "Combine horários e detalhes pelo chat integrado à troca." },
  { i: "🔔", t: "Acompanhe suas trocas", d: "Veja o status de cada solicitação em tempo real." },
  { i: "🔍", t: "Busca e filtros", d: "Encontre exatamente o que precisa com filtros por categoria e nível." },
  { i: "⭐", t: "Sistema de avaliações", d: "Avalie as trocas concluídas e construa sua reputação." },
];

const PASSOS = [
  { t: "Crie sua conta", d: "Cadastro rápido com e-mail — confirme e já pode entrar." },
  { t: "Publique seu conhecimento", d: "Diga o que você sabe ensinar ou o que quer aprender." },
  { t: "Conecte-se e troque", d: "Solicite uma troca, converse e conclua quando quiser." },
];

export default function Inicio() {
  const [totais, setTotais] = useState(null);

  useEffect(() => {
    contarConhecimentos()
      .then(setTotais)
      .catch(() => {
        // Falha silenciosa: a tela funciona mesmo sem os números
      });
  }, []);

  const stats = totais
    ? [
        { v: `${totais.totalConhecimentos}`, l: "Conhecimentos publicados" },
        { v: `${totais.totalCategorias}`, l: "Categorias disponíveis" },
      ]
    : [];

  return (
    <>
      {/* Hero */}
      <section className="container py-5 my-4">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <h1 className="display-5 fw-bolder">
              Compartilhe o que você sabe.
              <span className="d-block text-secondary opacity-75">Aprenda com quem sabe mais.</span>
            </h1>
            <p className="text-secondary mt-4" style={{ maxWidth: 440 }}>
              Publique seus conhecimentos, encontre o que quer aprender e troque com pessoas reais.
            </p>
            <div className="d-flex flex-wrap gap-3 mt-4">
              <Link to={ROTAS.conhecimentos} className="btn btn-brand">Explorar conhecimentos</Link>
              <Link to={ROTAS.conhecimentos} state={{ abrirOferta: true }} className="btn btn-line">
                Oferecer conhecimentos
              </Link>
            </div>
          </div>
          <div className="col-lg-6">
            <img
              src={previaPlataforma}
              alt="Prévia da tela de Conhecimentos do Banco de Trocas"
              className="img-fluid w-100 img-framed"
            />
          </div>
        </div>
      </section>

      {/* Estatísticas reais (só aparece quando os dados carregam) */}
      {stats.length > 0 && (
        <section className="band">
          <div className="container py-4">
            <div className="row text-center g-4 justify-content-center">
              {stats.map((item) => (
                <div key={item.l} className="col-6 col-md-3">
                  <p className="display-6 fw-bolder mb-1">{item.v}</p>
                  <p className="small text-secondary mb-0">{item.l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Funcionalidades */}
      <section className="container py-5 my-4">
        <h2 className="fw-bolder">Tudo que você precisa para trocar conhecimento</h2>
        <div className="row g-4 mt-2">
          {FUNC.map((f) => (
            <div key={f.t} className="col-12 col-sm-6 col-lg-4">
              <article className="card-bt h-100 p-4">
                <span className="icon-box">{f.i}</span>
                <h3 className="h6 fw-bold mt-3">{f.t}</h3>
                <p className="small text-secondary mb-0">{f.d}</p>
              </article>
            </div>
          ))}
        </div>
      </section>

      {/* Como funciona */}
      <section className="band">
        <div className="container py-5">
          <h2 className="fw-bolder">Como funciona em 3 passos</h2>
          <div className="row g-4 mt-3 text-center">
            {PASSOS.map((p, i) => (
              <div key={p.t} className="col-md-4">
                <span className="step-num">{i + 1}</span>
                <h3 className="h6 fw-bold mt-3">{p.t}</h3>
                <p className="small text-secondary mb-0">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="band">
        <div className="container py-5 text-center" style={{ maxWidth: 720 }}>
          <h2 className="fw-bolder">Pronto para trocar conhecimentos?</h2>
          <p className="text-secondary mt-3">
            Crie sua conta em poucos minutos e publique seu primeiro conhecimento hoje.
          </p>
          <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
            <Link to={ROTAS.cadastro} className="btn btn-brand">Criar conta gratuita</Link>
            <Link to={ROTAS.contato} className="btn btn-line">Falar com a equipe</Link>
          </div>
        </div>
      </section>
    </>
  );
}