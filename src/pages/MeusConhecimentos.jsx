import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ROTAS } from "../routes.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import {
  TIPOS,
  listarCategorias,
  listarMeusConhecimentos,
} from "../services/conhecimentoService.js";

// Classe de cor do selo de nível (mesma da tela Conhecimentos)
const classeNivel = (nivel) => {
  if (nivel === "Iniciante") return "nivel-iniciante";
  if (nivel === "Intermediário") return "nivel-intermediario";
  if (nivel === "Avançado") return "nivel-avancado";
  return "";
};

export default function MeusConhecimentos() {
  const { usuario } = useAuth();

  const [categorias, setCategorias] = useState([]);
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState(null);
  const [tentativa, setTentativa] = useState(0); // aumenta para "tentar de novo"
  const [tipoAtivo, setTipoAtivo] = useState("todos"); // "todos" | "ensinar" | "aprender"

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
              <article className="card-bt h-100 p-4">
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
                <p className="small text-secondary mb-0">{k.descricao}</p>
              </article>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}