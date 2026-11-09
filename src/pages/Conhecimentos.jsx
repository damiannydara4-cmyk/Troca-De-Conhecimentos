import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROTAS } from "../routes.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import {
  TIPOS,
  criarConhecimento,
  listarCategorias,
  listarConhecimentos,
} from "../services/conhecimentoService.js";

const NIVEIS = ["Iniciante", "Intermediário", "Avançado"];

const FORMULARIO_VAZIO = {
  titulo: "",
  categoriaId: "",
  nivel: "Iniciante",
  descricao: "",
  cargo: "",
  tipo: "ensinar",
};

// As solicitações de troca ainda ficam no navegador (viram coleção "exchanges" numa próxima etapa)
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
    /* sem armazenamento disponível: vale só até recarregar a página */
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
  const { usuario } = useAuth();

  const [categorias, setCategorias] = useState([]); // [{ id, nome }] vindas do Firestore
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState(null);
  const [tentativa, setTentativa] = useState(0); // aumenta para "tentar de novo"
  const [enviando, setEnviando] = useState(false);

  // Ids dos conhecimentos que já tiveram troca solicitada
  const [solicitadas, setSolicitadas] = useState(() => lerSalvo(CHAVE_SOLICITADAS, []));

  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [tipoAtivo, setTipoAtivo] = useState("todos"); // "todos" | "ensinar" | "aprender"

  // trocaSelecionada = conhecimento escolhido ou null | ofertaAberta = true/false
  const [trocaSelecionada, setTrocaSelecionada] = useState(null);
  const [ofertaAberta, setOfertaAberta] = useState(Boolean(location.state?.abrirOferta));
  const [aviso, setAviso] = useState(null);
  const [novo, setNovo] = useState(FORMULARIO_VAZIO);

  // Carrega categorias e conhecimentos do Firestore ao abrir a tela
  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErroCarga(null);

    Promise.all([listarCategorias(), listarConhecimentos()])
      .then(([cats, itens]) => {
        if (!ativo) return;
        setCategorias(cats);
        setLista(itens);
      })
      .catch((err) => {
        console.error("Erro ao carregar conhecimentos:", err); // se faltar índice, o link para criá-lo aparece aqui
        if (ativo) setErroCarga("Não foi possível carregar os conhecimentos. Tente novamente.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [tentativa]);

  // Some o aviso depois de 3,5 segundos
  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 3500);
    return () => clearTimeout(t);
  }, [aviso]);

  const nomeDaCategoria = (id) => categorias.find((c) => c.id === id)?.nome ?? "Outros";
  const nomesDasCategorias = ["Todos", ...categorias.map((c) => c.nome)];

  // Cada conhecimento ganha o nome da categoria (a tela filtra e mostra pelo nome)
  const itens = useMemo(
    () => lista.map((k) => ({ ...k, categoria: nomeDaCategoria(k.categoriaId) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lista, categorias]
  );

  // Filtro por categoria + busca (título, descrição ou autor)
  const termo = busca.toLowerCase();
  const listaFiltrada = itens.filter((k) => {
    const daCategoria = categoriaAtiva === "Todos" || k.categoria === categoriaAtiva;
    const daBusca =
      k.titulo.toLowerCase().includes(termo) ||
      k.descricao.toLowerCase().includes(termo) ||
      k.autor.toLowerCase().includes(termo);
    const daTipo = tipoAtivo === "todos" || k.tipo === tipoAtivo;
    return daCategoria && daBusca && daTipo;
  });

  const fecharOferta = () => {
    setOfertaAberta(false);
    // Limpa o "abrir já com o formulário" para não reabrir ao recarregar a página
    if (location.state?.abrirOferta) {
      navigate(ROTAS.conhecimentos, { replace: true, state: null });
    }
  };

  const handleCriar = async (e) => {
    e.preventDefault();
    const titulo = novo.titulo.trim();
    const descricao = novo.descricao.trim();
    if (!titulo || !descricao) {
      setAviso("Preencha todos os campos obrigatórios.");
      return;
    }
    if (titulo.length < 3 || titulo.length > 100) {
      setAviso("O título precisa ter entre 3 e 100 caracteres.");
      return;
    }
    if (descricao.length < 10 || descricao.length > 1000) {
      setAviso("A descrição precisa ter entre 10 e 1000 caracteres.");
      return;
    }

    setEnviando(true);
    try {
      await criarConhecimento(usuario, {
        ...novo,
        categoriaId: novo.categoriaId || categorias[0]?.id,
      });
      navigate(ROTAS.conhecimentoOferecido, { state: { conhecimento: titulo, tipo: novo.tipo } });
    } catch (err) {
      console.error("Erro ao publicar conhecimento:", err);
      setAviso("Não foi possível publicar agora. Tente novamente.");
      setEnviando(false);
    }
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
    setTipoAtivo("todos");  };

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

        {/* Filtro por tipo */}
        <div className="d-flex flex-wrap gap-2 mb-3">
          {[["todos", "Todos os tipos"], ...Object.entries(TIPOS)].map(([valor, rotulo]) => (
            <button
              key={valor}
              className={`chip ${tipoAtivo === valor ? "active" : ""}`}
              onClick={() => setTipoAtivo(valor)}
            >
              {rotulo}
            </button>
          ))}
        </div>

        {/* Filtros e busca */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5">
          <div className="d-flex gap-2 overflow-auto pb-2">
            {nomesDasCategorias.map((c) => (
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
                    <div className="d-flex flex-wrap align-items-center gap-2">
                      <span className="tag">{k.categoria}</span>
                      <span
                        className={`badge rounded-pill ${
                          k.tipo === "aprender" ? "text-bg-warning" : "text-bg-primary"
                        }`}
                      >
                        {TIPOS[k.tipo]}
                      </span>
                    </div>
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
                    {k.donoId === usuario?.id ? (
                      <span className="small text-secondary text-nowrap">Seu conhecimento</span>
                    ) : solicitadas.includes(k.id) ? (
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

        {/* Carregando / erro / nenhum resultado */}
        {carregando && (
          <p className="text-center text-secondary my-5" role="status">Carregando conhecimentos…</p>
        )}

        {!carregando && erroCarga && (
          <div className="empty-state text-center p-5 my-4">
            <h3 className="h5 fw-bold">Algo deu errado</h3>
            <p className="small text-secondary">{erroCarga}</p>
            <button className="btn btn-brand btn-sm" onClick={() => setTentativa((n) => n + 1)}>
              Tentar de novo
            </button>
          </div>
        )}

        {!carregando && !erroCarga && listaFiltrada.length === 0 && (
          <div className="empty-state text-center p-5 my-4">
            {lista.length === 0 ? (
              <>
                <h3 className="h5 fw-bold">Ainda não há conhecimentos publicados</h3>
                <p className="small text-secondary">Seja a primeira pessoa a compartilhar o que sabe.</p>
                <button className="btn btn-brand btn-sm" onClick={() => setOfertaAberta(true)}>
                  + Oferecer conhecimento
                </button>
              </>
            ) : (
              <>
                <h3 className="h5 fw-bold">Nenhum conhecimento encontrado</h3>
                <p className="small text-secondary">
                  Tente buscar por outros termos ou mudar os filtros selecionados.
                </p>
                <button className="btn btn-brand btn-sm" onClick={limparFiltros}>
                  Limpar filtros
                </button>
              </>
            )}
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
        <h3 className="h4 fw-bold">Cadastrar conhecimento</h3>
          <p className="small text-secondary">
             Escolha se você quer ensinar ou aprender e preencha os detalhes.
          </p>

          <form onSubmit={handleCriar}>
            <div className="mb-3">
              <label htmlFor="of-tipo" className="form-label">Tipo *</label>
              <select
                id="of-tipo"
                className="form-select"
                value={novo.tipo}
                onChange={(e) => setNovo({ ...novo, tipo: e.target.value })}
              >
                {Object.entries(TIPOS).map(([valor, rotulo]) => (
                  <option key={valor} value={valor}>{rotulo}</option>
                ))}
              </select>
            </div>

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
                  value={novo.categoriaId || categorias[0]?.id || ""}
                  onChange={(e) => setNovo({ ...novo, categoriaId: e.target.value })}
                >
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
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
              <button type="submit" className="btn btn-brand btn-sm" disabled={enviando}>
                {enviando ? "Publicando…" : "Publicar conhecimento"}
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
              <span className="dot-ok"></span>
              {aviso}
            </div>
          </div>
        </div>
      )}
    </>
  );
}