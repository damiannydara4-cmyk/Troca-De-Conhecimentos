import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Inicio.css";
import previaPlataforma from "../assets/previaWeb.png";

//  Dados da tela (listas usadas com .map)
const STATS = [
  { v: "12.400+", l: "Criadores de conteúdo" },
  { v: "85.000+", l: "Artigos e tutoriais" },
  { v: "320.000+", l: "Usuários ativos" },
  { v: "140+", l: "Comunidades temáticas" },
];

const FUNC = [
  { i: "✍️", t: "Editor rico", d: "Escreva artigos, tutoriais e guias com um editor poderoso." },
  { i: "📁", t: "Coleções temáticas", d: "Organize e descubra conhecimento por área de interesse." },
  { i: "💬", t: "Discussões abertas", d: "Comentários e debates direto no conteúdo publicado." },
  { i: "🔔", t: "Notificações inteligentes", d: "Receba atualizações dos criadores e temas que você segue." },
  { i: "🔍", t: "Busca semântica", d: "Encontre exatamente o que precisa com busca contextual." },
  { i: "📊", t: "Métricas de impacto", d: "Veja como seu conteúdo está alcançando a comunidade." },
];

const PASSOS = [
  { t: "Crie sua conta", d: "Cadastro rápido com e-mail ou Google" },
  { t: "Publique seu conhecimento", d: "Escreva artigos, grave vídeos ou organize coleções" },
  { t: "Conecte-se com a comunidade", d: "Seguidores, comentários e colaboração" },
];

const DEPOIMENTOS = [
  { q: "Finalmente uma plataforma que valoriza quem compartilha conhecimento de qualidade.", n: "Marina Alves", c: "Design" },
  { q: "Uso todos os dias para aprender e também para publicar meus tutoriais de design.", n: "Rafael Costa", c: "Tecnologia" },
  { q: "A busca semântica é incrível. Acho exatamente o que preciso, sempre.", n: "Camila Rocha", c: "Idiomas" },
];

// Tela 
//   onFalarComEquipe -> chamada ao clicar em "Falar com a equipe" (o App troca para a tela de contato)
export default function Inicio({ onIrParaConhecimentos, onOferecerConhecimento, onFalarComEquipe }) {
  // Estado do modal: null = fechado | "login" | "register"
  const [modal, setModal] = useState(null);

  return (
    <div className="home-page">
      {/* Cabeçalho */}
      <nav className="navbar sticky-top">
        <div className="container">
          <span className="navbar-brand fw-bolder">Banco de Trocas</span>

          <div className="d-flex align-items-center gap-3 fw-bold small">
            <a href="#" className="text-decoration-none text-reset">Início</a>
            <a href="#conhecimentos" className="text-decoration-none text-reset" onClick={(e) => {
               e.preventDefault();
                onIrParaConhecimentos && onIrParaConhecimentos();
                }}>Conhecimentos</a>
            <button className="btn btn-line btn-sm" onClick={() => setModal("login")}>
              Entrar
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container py-5 my-4">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <h1 className="display-5 fw-bolder">
              Compartilhe o que você sabe.
              <span className="d-block text-secondary opacity-75">Aprenda com quem sabe mais.</span>
            </h1>
            <p className="text-secondary mt-4" style={{ maxWidth: 440 }}>
              Publique artigos, tutoriais e guias, e descubra conhecimentos de outras pessoas.
            </p>
            <div className="d-flex flex-wrap gap-3 mt-4">
            <button className="btn btn-brand" onClick={onIrParaConhecimentos}>Explorar conhecimentos</button>
            <button className="btn btn-line" onClick={onOferecerConhecimento}>Oferecer conhecimentos</button>
            </div>
          </div>
          <div className="col-lg-6">
            <img
              src={previaPlataforma}
              alt="Prévia da tela de Conhecimentos do Banco de Trocas"
              className="img-fluid w-100 previa-img"
           />
          </div>
        </div>
      </section>

      {/* Estatísticas */}
      <section className="band">
        <div className="container py-4">
          <div className="row text-center g-4">
            {STATS.map((item) => (
              <div key={item.l} className="col-6 col-md-3">
                <p className="display-6 fw-bolder mb-1">{item.v}</p>
                <p className="small text-secondary mb-0">{item.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section className="container py-5 my-4">
        <h2 className="fw-bolder">Tudo que você precisa para compartilhar conhecimento</h2>
        <div className="row g-4 mt-2">
          {FUNC.map((f) => (
            <div key={f.t} className="col-12 col-sm-6 col-lg-4">
              <article className="card-bt h-100 p-4">
                <span className="icon-box d-inline-flex align-items-center justify-content-center">{f.i}</span>
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
                <span className="step-num d-inline-flex align-items-center justify-content-center">{i + 1}</span>
                <h3 className="h6 fw-bold mt-3">{p.t}</h3>
                <p className="small text-secondary mb-0">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="container py-5 my-4">
        <h2 className="fw-bolder">O que nossa comunidade diz</h2>
        <div className="row g-4 mt-2">
          {DEPOIMENTOS.map((d) => (
            <div key={d.n} className="col-md-4">
              <figure className="card-bt h-100 p-4 d-flex flex-column mb-0">
                <blockquote className="flex-grow-1">“{d.q}”</blockquote>
                <figcaption className="d-flex justify-content-between align-items-center small mt-3">
                  <span className="fw-bold">{d.n}</span>
                  <span className="tag">{d.c}</span>
                </figcaption>
              </figure>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="band">
        <div className="container py-5 text-center" style={{ maxWidth: 720 }}>
          <h2 className="fw-bolder">Pronto para compartilhar o que você sabe?</h2>
          <p className="text-secondary mt-3">
            Crie sua conta em poucos minutos e publique seu primeiro conteúdo hoje.
          </p>
          <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
            <button className="btn btn-brand" onClick={() => setModal("register")}>
              Criar conta gratuita
            </button>
            {/* Leva para a tela de contato (controlada pelo App.jsx) */}
            <button className="btn btn-line" onClick={onFalarComEquipe}>
              Falar com a equipe
            </button>
          </div>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="bg-white" style={{ borderTop: "2px solid #111827" }}>
        <div className="container py-5">
          <div className="row g-4">
            <div className="col-md-3">
              <p className="fw-bolder">Banco de Trocas</p>
              <p className="small text-secondary">Uma plataforma para compartilhar e descobrir conhecimento.</p>
            </div>
            <div className="col-6 col-md-3">
              <p className="small fw-bold">Produto</p>
              <p className="small text-secondary mb-1">Funcionalidades</p>
              <p className="small text-secondary mb-1">Conhecimentos</p>
            </div>
            <div className="col-6 col-md-3">
              <p className="small fw-bold">Comunidade</p>
              <p className="small text-secondary mb-1">Criadores</p>
              <p className="small text-secondary mb-1">Eventos</p>
            </div>
            <div className="col-6 col-md-3">
              <p className="small fw-bold">Empresa</p>
              <p className="small text-secondary mb-1">Sobre nós</p>
              <p className="small text-secondary mb-1">Contato</p>
            </div>
          </div>
          <p className="small text-secondary border-top pt-3 mt-4 mb-0">
            © 2026 Banco de Trocas. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Modal de login / cadastro */}
      {modal && (
        <>
          <div className="modal-backdrop show"></div>

          <div className="modal d-block" onClick={() => setModal(null)}>
            <div
              className="modal-dialog modal-dialog-centered modal-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content" style={{ border: "2px solid #111827", borderRadius: 16 }}>
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bolder">
                    {modal === "login" ? "Entrar" : "Criar conta gratuita"}
                  </h5>
                  <button className="btn-close" onClick={() => setModal(null)}></button>
                </div>

                <div className="modal-body">
                  <label className="form-label small fw-bold">E-mail</label>
                  <input type="email" className="form-control mb-3" placeholder="voce@email.com" />
                  <button className="btn btn-brand w-100" onClick={() => setModal(null)}>
                    {modal === "login" ? "Entrar" : "Cadastrar"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
