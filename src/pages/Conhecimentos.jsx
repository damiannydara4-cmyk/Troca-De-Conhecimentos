import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Conhecimentos.css";


const CONHECIMENTOS_INICIAIS = [
  {
    id: 1,
    titulo: "Introdução ao Python",
    categoria: "Tecnologia",
    nivel: "Iniciante",
    descricao: "Aprenda os fundamentos de Python do zero, com exemplos práticos e exercícios.",
    autor: "Carla Mendes",
    cargo: "Engenheira de Software",
  },
  {
    id: 2,
    titulo: "Design de interfaces acessíveis",
    categoria: "Design",
    nivel: "Intermediário",
    descricao: "Princípios de acessibilidade aplicados ao design de produtos digitais.",
    autor: "Rafael Souza",
    cargo: "Product Designer",
  },
  {
    id: 3,
    titulo: "Finanças pessoais para autônomos",
    categoria: "Finanças",
    nivel: "Iniciante",
    descricao: "Como organizar renda variável, impostos e reserva de emergência.",
    autor: "Ana Beatriz",
    cargo: "Consultora Financeira",
  },
  {
    id: 4,
    titulo: "Fotografia urbana com celular",
    categoria: "Fotografia",
    nivel: "Iniciante",
    descricao: "Técnicas de composição e luz para fazer boas fotos com smartphone.",
    autor: "Lucas Ferreira",
    cargo: "Fotógrafo Profissional",
  },
  {
    id: 5,
    titulo: "Machine Learning na prática",
    categoria: "Tecnologia",
    nivel: "Avançado",
    descricao: "Modelos supervisionados e não supervisionados com Python e scikit-learn.",
    autor: "Priya Sharma",
    cargo: "Cientista de Dados",
  },
  {
    id: 6,
    titulo: "Culinária vegetariana",
    categoria: "Gastronomia",
    nivel: "Iniciante",
    descricao: "Receitas nutritivas e saborosas sem proteína animal, do básico ao elaborado.",
    autor: "Joana Castro",
    cargo: "Chef de Cozinha",
  },
];

const CATEGORIAS = ["Todos", "Tecnologia", "Design", "Finanças", "Fotografia", "Gastronomia", "Saúde","Outros"];
const NIVEIS = ["Iniciante", "Intermediário", "Avançado"];

const FORMULARIO_VAZIO = {
  titulo: "",
  categoria: "Tecnologia",
  nivel: "Iniciante",
  descricao: "",
  autor: "",
  cargo: "",
};

// Classe de cor do selo de nível
const classeNivel = (nivel) => {
  if (nivel === "Iniciante") return "nivel-iniciante";
  if (nivel === "Intermediário") return "nivel-intermediario";
  if (nivel === "Avançado") return "nivel-avancado";
  return "nivel-padrao";
};

//"CM"
const iniciais = (nome) =>
  nome.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

// Janela modal reaproveitada pelos dois pop-ups (usa classes do Bootstrap)
function Janela({ onFechar, children }) {
  return (
    <>
    <div className="modal-backdrop show"></div>
      <div className="modal d-block" onClick={onFechar}>
        <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content janela">
            <button className="btn-close janela-fechar" aria-label="Fechar" onClick={onFechar}></button>
            <div className="modal-body p-4">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}

//  Tela 
export default function Conhecimentos({ onVoltarInicio, abrirOferta = false }) {
  const [lista, setLista] = useState(CONHECIMENTOS_INICIAIS);
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  const [busca, setBusca] = useState("");

  //trocaSelecionada = conhecimento escolhido ou null | ofertaAberta = true/false
  const [trocaSelecionada, setTrocaSelecionada] = useState(null);
  const [ofertaAberta, setOfertaAberta] = useState(abrirOferta);
  const [aviso, setAviso] = useState(null);

  // Guarda os ids dos conhecimentos que já tiveram troca solicitada
  const [solicitadas, setSolicitadas] = useState([]);

  const [novo, setNovo] = useState(FORMULARIO_VAZIO);

  // Some o aviso depois de 3,5 segundos
  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 3500);
    return () => clearTimeout(t);
  }, [aviso]);

  // Filtro por categoria + busca (título, descrição ou autor)
  const termo = busca.toLowerCase();
  const listaFiltrada = lista.filter((k) => {
    const daCategoria = categoriaAtiva === "Todos" || k.categoria === categoriaAtiva;
    const daBusca =
      k.titulo.toLowerCase().includes(termo) ||
      k.descricao.toLowerCase().includes(termo) ||
      k.autor.toLowerCase().includes(termo);
    return daCategoria && daBusca;
  });

  const handleCriar = (e) => {
    e.preventDefault();
    if (!novo.titulo || !novo.descricao || !novo.autor) {
      setAviso("Preencha todos os campos obrigatórios.");
      return;
    }
    setLista([{ id: Date.now(), ...novo }, ...lista]);
    setOfertaAberta(false);
    setNovo(FORMULARIO_VAZIO);
    setAviso("Novo conhecimento oferecido com sucesso!");
  };

  const handleSolicitar = (e) => {
    e.preventDefault();
    setSolicitadas([...solicitadas, trocaSelecionada.id]);
    setAviso(`Solicitação enviada com sucesso para ${trocaSelecionada.autor}!`);
    setTrocaSelecionada(null);
  };

  const limparFiltros = () => {
    setCategoriaAtiva("Todos");
    setBusca("");
  };

  return (
    <div className="conhecimentos-page d-flex flex-column">
      {/* Cabeçalho */}
      <header className="cabecalho sticky-top">
        <div
          className="container d-flex align-items-center justify-content-between gap-3"
          style={{ height: 80 }}
        >
          <button className="voltar d-flex align-items-center gap-2" onClick={onVoltarInicio}>
            <span className="seta">←</span>
            <span className="fs-5 fw-bold">Banco de Trocas</span>
          </button>

          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-line btn-sm text-uppercase" onClick={onVoltarInicio}>
              Início
            </button>
            <button className="btn btn-escuro btn-sm" onClick={() => setOfertaAberta(true)}>
              + Oferecer conhecimento
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="container py-5 flex-grow-1">
        <div className="mb-4">
          <h1 className="display-5 fw-bolder">Conhecimentos disponíveis para troca</h1>
          <p className="text-secondary fst-italic fs-5">
            Explore o que a comunidade tem a oferecer e conecte-se com quem sabe.
          </p>
        </div>

        {/* Filtros e busca */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5">
          <div className="d-flex gap-2 overflow-auto pb-2">
            {CATEGORIAS.map((c) => (
              <button
              key={c}
              className={`chip ${categoriaAtiva === c ? "ativo" : ""}`}
            onClick={() => setCategoriaAtiva(c)}
              >
              {c}
              </button>
            ))}
          </div>
        <div className="campo-busca position-relative">
        <span className="lupa">🔍</span>
        <input
         type="text"
        className="form-control"
        placeholder="Pesquisar conhecimentos..."
       value={busca}
       onChange={(e) => setBusca(e.target.value)}
        />
      </div>
    </div>

{/* Cartões */}
<div className="row g-4">
  {listaFiltrada.map((k) => (
    <div key={k.id} className="col-12 col-md-6 col-lg-4">
      <article className="card-bt h-100 p-4 d-flex flex-column justify-content-between">
        <div>
          <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
            <span className="tag-cat">{k.categoria}</span>
            <span className={`nivel ${classeNivel(k.nivel)}`}>{k.nivel}</span>
          </div>
          <h3 className="h5 fw-bold">{k.titulo}</h3>
          <p className="small text-secondary fst-italic">{k.descricao}</p>
        </div>

        <div>
          <hr className="divisor" />
          <div className="d-flex align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-2">
              <span className="avatar">{iniciais(k.autor)}</span>
              <div>
                <p className="small fw-bold mb-0 lh-sm">{k.autor}</p>
                {k.cargo && <p className="cargo mb-0 lh-sm">{k.cargo}</p>}
              </div>
            </div>
          {solicitadas.includes(k.id) ? (
          <button className="btn btn-solicitada btn-sm text-nowrap" disabled>
           ✓ Troca solicitada
           </button>
          ) : (
           <button
             className="btn btn-line btn-sm text-nowrap"
            onClick={() => setTrocaSelecionada(k)}
           >
          Solicitar troca
           </button>
          )}
          </div>
        </div>
      </article>
    </div>
  ))}
</div>

{/* Nenhum resultado */}
{listaFiltrada.length === 0 && (
  <div className="vazio text-center p-5 my-4">
    <h3 className="h5 fw-bold">Nenhum conhecimento encontrado</h3>
    <p className="small text-secondary">
      Tente buscar por outros termos ou mudar os filtros selecionados.
    </p>
    <button className="btn btn-brand btn-sm" onClick={limparFiltros}>
      Limpar filtros
    </button>
  </div>
)}
      </main>

     {/* Rodapé */}
<footer className="rodape py-4 mt-5">
  <div className="container d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3 small text-secondary">
    <div className="d-flex align-items-center gap-2">
      <span className="logo-bt">BT</span>
      <span className="fw-semibold">Banco de Trocas</span>
      <span>• Conectando pessoas através do conhecimento</span>
    </div>
    <div className="d-flex gap-3">
      <a href="#" className="text-secondary" onClick={(e) => e.preventDefault()}>Privacidade</a>
      <a href="#" className="text-secondary" onClick={(e) => e.preventDefault()}>Termos</a>
      <a href="#" className="text-secondary" onClick={(e) => e.preventDefault()}>Suporte</a>
    </div>
  </div>
</footer>

    {/* Pop-up: solicitar troca */}
{trocaSelecionada && (
  <Janela onFechar={() => setTrocaSelecionada(null)}>
    <span className="tag-cat">{trocaSelecionada.categoria}</span>
    <h3 className="h4 fw-bold mt-2">Solicitar troca de conhecimento</h3>
    <p className="small text-secondary">
      Você está enviando um pedido de troca para <strong>{trocaSelecionada.autor}</strong>.
    </p>

    <div className="caixa-escolhido p-3 mb-3">
      <p className="fw-bold small mb-1">{trocaSelecionada.titulo}</p>
      <p className="small text-secondary mb-0">{trocaSelecionada.descricao}</p>
    </div>

    <form onSubmit={handleSolicitar}>
      <div className="mb-3">
        <label className="form-label small fw-bold">
          Qual habilidade ou conhecimento você oferece em troca?
        </label>
        <input
          type="text"
          className="form-control"
          required
          placeholder="Ex: Introdução ao Figma, Inglês Intermediário..."
        />
      </div>
      <div className="mb-3">
        <label className="form-label small fw-bold">Mensagem inicial (opcional)</label>
        <textarea
          rows="3"
          className="form-control"
          placeholder="Apresente-se brevemente e sugira dias ou horários preferidos..."
        ></textarea>
      </div>
      <div className="d-flex justify-content-end gap-2">
        <button type="button" className="btn btn-cancelar btn-sm" onClick={() => setTrocaSelecionada(null)}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-brand btn-sm">
          Confirmar solicitação
        </button>
      </div>
    </form>
  </Janela>
)}

    {/* Pop-up: oferecer conhecimento */}
{ ofertaAberta && (
  <Janela onFechar={() => setOfertaAberta(false)}>
    <span className="icone-mais">+</span>
    <h3 className="h4 fw-bold mt-2">Oferecer novo conhecimento</h3>
    <p className="small text-secondary">
      Preencha os detalhes do conhecimento que você deseja compartilhar com a comunidade.
    </p>

    <form onSubmit={handleCriar}>
      <div className="mb-3">
        <label className="form-label small fw-bold">Título do conhecimento *</label>
        <input
          type="text"
          className="form-control"
          required
          placeholder="Ex: Lógica de Programação com JavaScript"
          value={novo.titulo}
          onChange={(e) => setNovo({ ...novo, titulo: e.target.value })}
        />
      </div>

      <div className="row g-3 mb-3">
        <div className="col-6">
          <label className="form-label small fw-bold">Categoria *</label>
          <select
            className="form-select"
            value={novo.categoria}
            onChange={(e) => setNovo({ ...novo, categoria: e.target.value })}
          >
            {CATEGORIAS.filter((c) => c !== "Todos").map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="col-6">
          <label className="form-label small fw-bold">Nível *</label>
          <select
            className="form-select"
            value={novo.nivel}
            onChange={(e) => setNovo({ ...novo, nivel: e.target.value })}
          >
            {NIVEIS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label small fw-bold">Seu nome *</label>
        <input
          type="text"
          className="form-control"
          required
          placeholder="Ex: Matheus Lima"
          value={novo.autor}
          onChange={(e) => setNovo({ ...novo, autor: e.target.value })}
        />
      </div>

      <div className="mb-3">
        <label className="form-label small fw-bold">Sua especialidade / cargo</label>
        <input
          type="text"
          className="form-control"
          placeholder="Ex: Desenvolvedor Web, Estudante..."
          value={novo.cargo}
          onChange={(e) => setNovo({ ...novo, cargo: e.target.value })}
        />
      </div>

      <div className="mb-3">
        <label className="form-label small fw-bold">Descrição detalhada *</label>
        <textarea
          rows="3"
          className="form-control"
          required
          placeholder="Explique o que o aluno vai aprender nesta troca..."
          value={novo.descricao}
          onChange={(e) => setNovo({ ...novo, descricao: e.target.value })}
        ></textarea>
      </div>

      <div className="d-flex justify-content-end gap-2">
        <button type="button" className="btn btn-cancelar btn-sm" onClick={() => setOfertaAberta(false)}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-brand btn-sm">
          Publicar conhecimento
        </button>
      </div>
    </form>
  </Janela>
)}
     {/* Aviso (toast) */}
{aviso && (
  <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 2000 }}>
    <div className="toast show text-bg-dark" role="status">
      <div className="toast-body fw-semibold d-flex align-items-center gap-2">
        <span className="bolinha"></span>
        {aviso}
      </div>
    </div>
  </div>
)}
    </div>
  );
}