import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROTAS } from "../routes.js";

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

// Enquanto não existe back-end, a lista fica salva no navegador (localStorage)
const CHAVE_LISTA = "banco-de-trocas:conhecimentos";
const CHAVE_SOLICITADAS = "banco-de-trocas:solicitadas";

const lerSalvo = (chave, padrao) => {
  try {
    const salvo = localStorage.getItem(chave);
    return salvo ? JSON.parse(salvo) : padrao;
  } catch {
    return padrao;
  }
};

const salvar = (chave, valor) => {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* sem armazenamento disponível: a lista vale só até recarregar a página */
  }
};

// Classe de cor do selo de nível
const classeNivel = (nivel) => {
  if (nivel === "Iniciante") return "nivel-iniciante";
  if (nivel === "Intermediário") return "nivel-intermediario";
  if (nivel === "Avançado") return "nivel-avancado";
  return "";
};

// "Carla Mendes" -> "CM"
const iniciais = (nome) =>
  nome.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

// Janela modal reaproveitada pelos dois pop-ups (usa classes do Bootstrap)
function Janela({ onFechar, children }) {
  return (
    <>
      <div className="modal-backdrop show"></div>
      <div className="modal d-block" onClick={onFechar}>
        <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <button className="btn-close modal-close-abs" aria-label="Fechar" onClick={onFechar}></button>
            <div className="modal-body p-4">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Conhecimentos() {
  const navigate = useNavigate();
  const location = useLocation(); // location.state.abrirOferta vem do botão "Oferecer conhecimentos" da Início

  const [lista, setLista] = useState(() => lerSalvo(CHAVE_LISTA, CONHECIMENTOS_INICIAIS));
  // Ids dos conhecimentos que já tiveram troca solicitada
  const [solicitadas, setSolicitadas] = useState(() => lerSalvo(CHAVE_SOLICITADAS, []));

  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  const [busca, setBusca] = useState("");

  // trocaSelecionada = conhecimento escolhido ou null | ofertaAberta = true/false
  const [trocaSelecionada, setTrocaSelecionada] = useState(null);
  const [ofertaAberta, setOfertaAberta] = useState(Boolean(location.state?.abrirOferta));
  const [aviso, setAviso] = useState(null);
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

  const fecharOferta = () => {
    setOfertaAberta(false);
    // Limpa o "abrir já com o formulário" para não reabrir ao recarregar a página
    if (location.state?.abrirOferta) {
      navigate(ROTAS.conhecimentos, { replace: true, state: null });
    }
  };

  const handleCriar = (e) => {
    e.preventDefault();
    if (!novo.titulo.trim() || !novo.descricao.trim() || !novo.autor.trim()) {
      setAviso("Preencha todos os campos obrigatórios.");
      return;
    }
    // Salva na hora (antes de sair da tela) e segue para a confirmação
    const atualizada = [{ id: Date.now(), ...novo }, ...lista];
    setLista(atualizada);
    salvar(CHAVE_LISTA, atualizada);
    navigate(ROTAS.conhecimentoOferecido, { state: { conhecimento: novo.titulo } });
  };

  const handleSolicitar = (e) => {
    e.preventDefault();
    const atualizada = [...solicitadas, trocaSelecionada.id];
    setSolicitadas(atualizada);
    salvar(CHAVE_SOLICITADAS, atualizada);
    setAviso(`Solicitação enviada com sucesso para ${trocaSelecionada.autor}!`);
    setTrocaSelecionada(null);
  };

  const limparFiltros = () => {
    setCategoriaAtiva("Todos");
    setBusca("");
  };

  return (
    <>
      <div className="container py-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3 mb-4">
          <div>
            <h1 className="display-5 fw-bolder">Conhecimentos disponíveis para troca</h1>
            <p className="text-secondary fs-5 mb-0">
              Explore o que a comunidade tem a oferecer e conecte-se com quem sabe.
            </p>
          </div>
          <button className="btn btn-dark-bt text-nowrap" onClick={() => setOfertaAberta(true)}>
            + Oferecer conhecimento
          </button>
        </div>

        {/* Filtros e busca */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5">
          <div className="d-flex gap-2 overflow-auto pb-2">
            {CATEGORIAS.map((c) => (
              <button
                key={c}
                className={`chip ${categoriaAtiva === c ? "active" : ""}`}
                onClick={() => setCategoriaAtiva(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="search-field">
            <span className="search-field__icon" aria-hidden="true">🔍</span>
            <input
              type="text"
              className="form-control"
              placeholder="Pesquisar conhecimentos..."
              aria-label="Pesquisar conhecimentos"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>

        {/* Cartões */}
        <div className="row g-4">
          {listaFiltrada.map((k) => (
            <div key={k.id} className="col-12 col-md-6 col-lg-4">
              <article className="card-bt card-bt--hover h-100 p-4 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
                    <span className="tag">{k.categoria}</span>
                    <span className={`nivel ${classeNivel(k.nivel)}`}>{k.nivel}</span>
                  </div>
                  <h3 className="h5 fw-bold">{k.titulo}</h3>
                  <p className="small text-secondary">{k.descricao}</p>
                </div>

                <div>
                  <hr className="divider-dashed" />
                  <div className="d-flex align-items-center justify-content-between gap-3">
                    <div className="d-flex align-items-center gap-2">
                      <span className="avatar">{iniciais(k.autor)}</span>
                      <div>
                        <p className="small fw-bold mb-0 lh-sm">{k.autor}</p>
                        {k.cargo && <p className="small text-secondary mb-0 lh-sm">{k.cargo}</p>}
                      </div>
                    </div>
                    {solicitadas.includes(k.id) ? (
                      <button className="btn btn-done btn-sm text-nowrap" disabled>
                        ✓ Troca solicitada
                      </button>
                    ) : (
                      <button className="btn btn-line btn-sm text-nowrap" onClick={() => setTrocaSelecionada(k)}>
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
          <div className="empty-state text-center p-5 my-4">
            <h3 className="h5 fw-bold">Nenhum conhecimento encontrado</h3>
            <p className="small text-secondary">
              Tente buscar por outros termos ou mudar os filtros selecionados.
            </p>
            <button className="btn btn-brand btn-sm" onClick={limparFiltros}>
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* Pop-up: solicitar troca */}
      {trocaSelecionada && (
        <Janela onFechar={() => setTrocaSelecionada(null)}>
          <span className="tag">{trocaSelecionada.categoria}</span>
          <h3 className="h4 fw-bold mt-2">Solicitar troca de conhecimento</h3>
          <p className="small text-secondary">
            Você está enviando um pedido de troca para <strong>{trocaSelecionada.autor}</strong>.
          </p>

          <div className="card-bt p-3 mb-3">
            <p className="fw-bold small mb-1">{trocaSelecionada.titulo}</p>
            <p className="small text-secondary mb-0">{trocaSelecionada.descricao}</p>
          </div>

          <form onSubmit={handleSolicitar}>
            <div className="mb-3">
              <label htmlFor="troca-oferta" className="form-label">
                Qual habilidade ou conhecimento você oferece em troca?
              </label>
              <input
                id="troca-oferta"
                type="text"
                className="form-control"
                required
                placeholder="Ex: Introdução ao Figma, Inglês Intermediário..."
              />
            </div>
            <div className="mb-3">
              <label htmlFor="troca-msg" className="form-label">Mensagem inicial (opcional)</label>
              <textarea
                id="troca-msg"
                rows="3"
                className="form-control"
                placeholder="Apresente-se brevemente e sugira dias ou horários preferidos..."
              ></textarea>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-cancel btn-sm" onClick={() => setTrocaSelecionada(null)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-brand btn-sm">Confirmar solicitação</button>
            </div>
          </form>
        </Janela>
      )}

      {/* Pop-up: oferecer conhecimento */}
      {ofertaAberta && (
        <Janela onFechar={fecharOferta}>
          <h3 className="h4 fw-bold">Oferecer novo conhecimento</h3>
          <p className="small text-secondary">
            Preencha os detalhes do conhecimento que você deseja compartilhar com a comunidade.
          </p>

          <form onSubmit={handleCriar}>
            <div className="mb-3">
              <label htmlFor="of-titulo" className="form-label">Título do conhecimento *</label>
              <input
                id="of-titulo"
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
                <label htmlFor="of-categoria" className="form-label">Categoria *</label>
                <select
                  id="of-categoria"
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
                <label htmlFor="of-nivel" className="form-label">Nível *</label>
                <select
                  id="of-nivel"
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
              <label htmlFor="of-autor" className="form-label">Seu nome *</label>
              <input
                id="of-autor"
                type="text"
                className="form-control"
                required
                placeholder="Ex: Matheus Lima"
                value={novo.autor}
                onChange={(e) => setNovo({ ...novo, autor: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="of-cargo" className="form-label">Sua especialidade / cargo</label>
              <input
                id="of-cargo"
                type="text"
                className="form-control"
                placeholder="Ex: Desenvolvedor Web, Estudante..."
                value={novo.cargo}
                onChange={(e) => setNovo({ ...novo, cargo: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="of-descricao" className="form-label">Descrição detalhada *</label>
              <textarea
                id="of-descricao"
                rows="3"
                className="form-control"
                required
                placeholder="Explique o que o aluno vai aprender nesta troca..."
                value={novo.descricao}
                onChange={(e) => setNovo({ ...novo, descricao: e.target.value })}
              ></textarea>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-cancel btn-sm" onClick={fecharOferta}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-brand btn-sm">Publicar conhecimento</button>
            </div>
          </form>
        </Janela>
      )}

      {/* Aviso (toast) */}
      {aviso && (
        <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 2000 }}>
          <div className="toast show text-bg-dark" role="status">
            <div className="toast-body fw-semibold d-flex align-items-center gap-2">
              <span className="dot-ok"></span>
              {aviso}
            </div>
          </div>
        </div>
      )}
    </>
  );
}