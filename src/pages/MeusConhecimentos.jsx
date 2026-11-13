import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ROTAS } from "../routes.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import {
  TIPOS,
  atualizarConhecimento,
  excluirConhecimento,
  listarCategorias,
  listarMeusConhecimentos,
} from "../services/conhecimentoService.js";

const NIVEIS = ["Iniciante", "Intermediário", "Avançado"];

// Classe de cor do selo de nível (mesma da tela Conhecimentos)
const classeNivel = (nivel) => {
  if (nivel === "Iniciante") return "nivel-iniciante";
  if (nivel === "Intermediário") return "nivel-intermediario";
  if (nivel === "Avançado") return "nivel-avancado";
  return "";
};

// Janela modal reutilizável
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

export default function MeusConhecimentos() {
  const { usuario } = useAuth();

  const [categorias, setCategorias] = useState([]);
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState(null);
  const [tentativa, setTentativa] = useState(0); // aumenta para "tentar de novo"
  const [tipoAtivo, setTipoAtivo] = useState("todos"); // "todos" | "ensinar" | "aprender"

  // Edição
  const [editando, setEditando] = useState(null); // conhecimento sendo editado (ou null)
  const [formEdicao, setFormEdicao] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [erroEdicao, setErroEdicao] = useState(null);

  // Exclusão
  const [excluindo, setExcluindo] = useState(null); // conhecimento a ser excluído
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  const [aviso, setAviso] = useState(null);

  // Busca categorias e SÓ os conhecimentos do usuário logado
  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErroCarga(null);

    Promise.all([listarCategorias(), listarMeusConhecimentos(usuario.id)])
      .then(([cats, itens]) => {
        if (!ativo) return;
        setCategorias(cats);
        setLista(itens);
      })
      .catch((err) => {
        console.error("Erro ao carregar meus conhecimentos:", err);
        if (ativo) setErroCarga("Não foi possível carregar seus conhecimentos. Tente novamente.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [tentativa, usuario.id]);

  const nomeDaCategoria = (id) => categorias.find((c) => c.id === id)?.nome ?? "Outros";

  // Quantos há de cada tipo (aparece nos botões de filtro)
  const contagem = useMemo(
    () => ({
      todos: lista.length,
      ensinar: lista.filter((k) => k.tipo === "ensinar").length,
      aprender: lista.filter((k) => k.tipo === "aprender").length,
    }),
    [lista]
  );

  const listaFiltrada = lista.filter((k) => tipoAtivo === "todos" || k.tipo === tipoAtivo);

  const filtros = [
    ["todos", "Todos"],
    ["ensinar", TIPOS.ensinar],
    ["aprender", TIPOS.aprender],
  ];

  // Aviso temporário (3 s)
  const mostrarAviso = (msg) => {
    setAviso(msg);
    setTimeout(() => setAviso(null), 3000);
  };

  // ── Edição ─────────────────────────────────────────────────────────────────
  const abrirEdicao = (k) => {
    setEditando(k);
    setFormEdicao({
      titulo: k.titulo,
      descricao: k.descricao,
      categoriaId: k.categoriaId,
      nivel: k.nivel,
      tipo: k.tipo,
    });
    setErroEdicao(null);
  };

  const fecharEdicao = () => {
    if (!salvando) setEditando(null);
  };

  const salvarEdicao = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setErroEdicao(null);
    try {
      await atualizarConhecimento(editando.id, formEdicao);
      // Atualiza a lista local sem recarregar do Firestore
      setLista((prev) =>
        prev.map((k) =>
          k.id === editando.id
            ? { ...k, ...formEdicao, categoriaId: formEdicao.categoriaId }
            : k
        )
      );
      setEditando(null);
      mostrarAviso("Conhecimento atualizado!");
    } catch (err) {
      console.error("Erro ao editar conhecimento:", err);
      setErroEdicao(
        err?.code === "permission-denied"
          ? "Você não tem permissão para editar este conhecimento."
          : err?.message || "Não foi possível salvar. Tente novamente."
      );
    } finally {
      setSalvando(false);
    }
  };

  // ── Exclusão ───────────────────────────────────────────────────────────────
  const confirmarExclusao = (k) => {
    setExcluindo(k);
    setConfirmandoExclusao(false);
  };

  const executarExclusao = async () => {
    if (!excluindo) return;
    setConfirmandoExclusao(true);
    try {
      await excluirConhecimento(excluindo.id);
      setLista((prev) => prev.filter((k) => k.id !== excluindo.id));
      setExcluindo(null);
      mostrarAviso("Conhecimento removido.");
    } catch (err) {
      console.error("Erro ao excluir conhecimento:", err);
      mostrarAviso("Não foi possível remover. Tente novamente.");
      setExcluindo(null);
    } finally {
      setConfirmandoExclusao(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3 mb-4">
        <div>
          <h1 className="display-5 fw-bolder">Meus conhecimentos</h1>
          <p className="text-secondary fs-5 mb-0">
            Tudo o que você cadastrou para ensinar e aprender.
          </p>
        </div>
        <Link
          to={ROTAS.conhecimentos}
          state={{ abrirOferta: true }}
          className="btn btn-dark-bt text-nowrap"
        >
          + Cadastrar conhecimento
        </Link>
      </div>

      {/* Filtro por tipo */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {filtros.map(([valor, rotulo]) => (
          <button
            key={valor}
            className={`chip ${tipoAtivo === valor ? "active" : ""}`}
            onClick={() => setTipoAtivo(valor)}
          >
            {rotulo} ({contagem[valor]})
          </button>
        ))}
      </div>

      {carregando && (
        <p className="text-center text-secondary my-5" role="status">Carregando seus conhecimentos…</p>
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
          <h3 className="h5 fw-bold">
            {lista.length === 0 ? "Você ainda não cadastrou nenhum conhecimento" : "Nenhum conhecimento deste tipo"}
          </h3>
          <p className="small text-secondary">
            {lista.length === 0
              ? "Cadastre o que você sabe ensinar ou o que quer aprender."
              : "Troque o filtro para ver os outros."}
          </p>
          {lista.length === 0 && (
            <Link to={ROTAS.conhecimentos} state={{ abrirOferta: true }} className="btn btn-brand btn-sm">
              + Cadastrar conhecimento
            </Link>
          )}
        </div>
      )}

      {!carregando && !erroCarga && (
        <div className="row g-4">
          {listaFiltrada.map((k) => (
            <div key={k.id} className="col-12 col-md-6 col-lg-4">
              <article className="card-bt h-100 p-4 d-flex flex-column">
                <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
                  <div className="d-flex flex-wrap align-items-center gap-2">
                    <span className="tag">{nomeDaCategoria(k.categoriaId)}</span>
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
                <p className="small text-secondary flex-grow-1">{k.descricao}</p>
                {/* Ações */}
                <div className="d-flex gap-2 mt-3 justify-content-end">
                  <button
                    className="btn btn-line btn-sm"
                    onClick={() => abrirEdicao(k)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-cancel btn-sm"
                    onClick={() => confirmarExclusao(k)}
                  >
                    Remover
                  </button>
                </div>
              </article>
            </div>
          ))}
        </div>
      )}

      {/* Modal de edição */}
      {editando && (
        <Janela onFechar={fecharEdicao}>
          <h3 className="h4 fw-bold">Editar conhecimento</h3>
          <p className="small text-secondary">Atualize as informações abaixo.</p>

          {erroEdicao && <div className="alert-erro mb-3" role="alert">{erroEdicao}</div>}

          <form onSubmit={salvarEdicao}>
            <div className="mb-3">
              <label htmlFor="ed-tipo" className="form-label">Tipo *</label>
              <select
                id="ed-tipo"
                className="form-select"
                value={formEdicao.tipo}
                onChange={(e) => setFormEdicao({ ...formEdicao, tipo: e.target.value })}
                disabled={salvando}
              >
                {Object.entries(TIPOS).map(([valor, rotulo]) => (
                  <option key={valor} value={valor}>{rotulo}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="ed-titulo" className="form-label">Título *</label>
              <input
                id="ed-titulo"
                type="text"
                className="form-control"
                required
                value={formEdicao.titulo}
                onChange={(e) => setFormEdicao({ ...formEdicao, titulo: e.target.value })}
                disabled={salvando}
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <label htmlFor="ed-categoria" className="form-label">Categoria *</label>
                <select
                  id="ed-categoria"
                  className="form-select"
                  value={formEdicao.categoriaId}
                  onChange={(e) => setFormEdicao({ ...formEdicao, categoriaId: e.target.value })}
                  disabled={salvando}
                >
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
              <div className="col-6">
                <label htmlFor="ed-nivel" className="form-label">Nível *</label>
                <select
                  id="ed-nivel"
                  className="form-select"
                  value={formEdicao.nivel}
                  onChange={(e) => setFormEdicao({ ...formEdicao, nivel: e.target.value })}
                  disabled={salvando}
                >
                  {NIVEIS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="ed-descricao" className="form-label">Descrição *</label>
              <textarea
                id="ed-descricao"
                rows="3"
                className="form-control"
                required
                value={formEdicao.descricao}
                onChange={(e) => setFormEdicao({ ...formEdicao, descricao: e.target.value })}
                disabled={salvando}
              ></textarea>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-cancel btn-sm" onClick={fecharEdicao} disabled={salvando}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-brand btn-sm" disabled={salvando}>
                {salvando ? "Salvando…" : "Salvar alterações"}
              </button>
            </div>
          </form>
        </Janela>
      )}

      {/* Modal de confirmação de exclusão */}
      {excluindo && (
        <Janela onFechar={() => !confirmandoExclusao && setExcluindo(null)}>
          <h3 className="h4 fw-bold">Remover conhecimento</h3>
          <p className="text-secondary">
            Tem certeza que deseja remover <strong>{excluindo.titulo}</strong>?
          </p>
          <p className="small text-secondary">
            O conhecimento será ocultado da lista pública. Trocas já realizadas não são afetadas.
          </p>
          <div className="d-flex justify-content-end gap-2 mt-3">
            <button
              className="btn btn-cancel btn-sm"
              onClick={() => setExcluindo(null)}
              disabled={confirmandoExclusao}
            >
              Cancelar
            </button>
            <button
              className="btn btn-brand btn-sm"
              onClick={executarExclusao}
              disabled={confirmandoExclusao}
            >
              {confirmandoExclusao ? "Removendo…" : "Sim, remover"}
            </button>
          </div>
        </Janela>
      )}

      {/* Toast de aviso */}
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
    </div>
  );
}