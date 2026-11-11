import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { caminhoConversa, caminhoPerfil } from "../routes.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useConversas } from "../contexts/ConversasContext.jsx";
import StatusTroca from "../components/StatusTroca.jsx";
import Estrelas from "../components/Estrelas.jsx";
import AvaliacaoModal from '../components/AvaliacaoModal';
import {
  STATUS,
  STATUS_ATIVOS,
  STATUS_HISTORICO,
  aceitarSolicitacao,
  cancelarSolicitacao,
  concluirTroca,
  observarTrocas,
  recusarSolicitacao,
} from "../services/trocaService.js";
import { garantirConversa } from "../services/chatService.js";
import { criarAvaliacao, observarAvaliacoesFeitas } from "../services/avaliacaoService.js";
import { formatarDataHora, iniciais } from "../utils/formatadores.js";

const FILTROS_HISTORICO = [
  ["todas", "Todas"],
  [STATUS.concluida, "Concluídas"],
  [STATUS.recusada, "Recusadas"],
  [STATUS.cancelada, "Canceladas"],
];

const mensagemDeErro = (err) =>
  err?.code === "permission-denied"
    ? "Você não tem permissão para fazer isso."
    : err?.code
      ? "Não foi possível concluir a ação. Tente novamente."
      : err?.message || "Algo deu errado. Tente novamente.";

export default function MinhasTrocas() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { conversas } = useConversas();

  const [trocas, setTrocas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState(null);
  const [aba, setAba] = useState("recebidas"); // "recebidas" | "enviadas" | "historico"
  const [filtroHistorico, setFiltroHistorico] = useState("todas");
  const [ocupadoId, setOcupadoId] = useState(null); // troca com ação em andamento
  const [aviso, setAviso] = useState(null);

  // Avaliações que EU já fiz: Map (id da troca -> avaliação)
  const [avaliacoesFeitas, setAvaliacoesFeitas] = useState(new Map());
  const [avaliandoTroca, setAvaliandoTroca] = useState(null); // troca aberta no pop-up de avaliação
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);

  // Escuta as trocas em tempo real e encerra o listener ao sair da tela
  useEffect(() => {
    setCarregando(true);
    setErroCarga(null);
    const cancelar = observarTrocas(
      usuario.id,
      (lista) => {
        setTrocas(lista);
        setCarregando(false);
      },
      (err) => {
        console.error("Erro ao carregar trocas:", err);
        setErroCarga("Não foi possível carregar suas trocas. Tente novamente.");
        setCarregando(false);
      }
    );
    return cancelar;
  }, [usuario.id]);

  // Escuta as avaliações que eu já fiz (para esconder o botão "Avaliar" nas trocas já avaliadas)
  useEffect(() => {
    return observarAvaliacoesFeitas(usuario.id, setAvaliacoesFeitas, (err) =>
      console.error("Erro ao carregar avaliações:", err)
    );
  }, [usuario.id]);

  useEffect(() => {
    if (!aviso) return undefined;
    const t = setTimeout(() => setAviso(null), 3500);
    return () => clearTimeout(t);
  }, [aviso]);

  const ativa = (t) => STATUS_ATIVOS.includes(t.status);
  const recebidas = trocas.filter((t) => t.destinatarioId === usuario.id && ativa(t));
  const enviadas = trocas.filter((t) => t.solicitanteId === usuario.id && ativa(t));
  const historico = trocas.filter(
    (t) => STATUS_HISTORICO.includes(t.status) && (filtroHistorico === "todas" || t.status === filtroHistorico)
  );
  const pendentesParaMim = recebidas.filter((t) => t.status === STATUS.pendente).length;
  const concluidasSemMinhaAvaliacao = trocas.filter(
    (t) => t.status === STATUS.concluida && !avaliacoesFeitas.has(t.id)
  ).length;

  const listas = { recebidas, enviadas, historico };
  const lista = listas[aba];

  const executar = async (troca, acao, mensagemOk, confirmacao) => {
    if (confirmacao && !window.confirm(confirmacao)) return;
    setOcupadoId(troca.id);
    try {
      await acao(troca.id, usuario.id);
      setAviso(mensagemOk);
    } catch (err) {
      console.error("Erro na ação da troca:", err);
      setAviso(mensagemDeErro(err));
    } finally {
      setOcupadoId(null);
    }
  };

  const abrirConversa = async (troca) => {
    setOcupadoId(troca.id);
    try {
      await garantirConversa(troca);
      navigate(caminhoConversa(troca.id));
    } catch (err) {
      console.error("Erro ao abrir conversa:", err);
      setAviso(mensagemDeErro(err));
      setOcupadoId(null);
    }
  };

  const enviarAvaliacao = async ({ nota, comentario }) => {
    setEnviandoAvaliacao(true);
    try {
      await criarAvaliacao(usuario, avaliandoTroca, { nota, comentario });
      setAviso("Avaliação enviada! Obrigado pelo feedback.");
      setAvaliandoTroca(null);
    } catch (err) {
      console.error("Erro ao avaliar:", err);
      setAviso(mensagemDeErro(err));
    } finally {
      setEnviandoAvaliacao(false);
    }
  };

  const abas = [
    ["recebidas", `Recebidas (${recebidas.length})`],
    ["enviadas", `Enviadas (${enviadas.length})`],
    ["historico", "Histórico"],
  ];

  return (
    <div className="container py-5">
      <h1 className="display-5 fw-bolder">Minhas trocas</h1>
      <p className="text-secondary fs-5 mb-4">
        Acompanhe as solicitações que você recebeu e enviou.
        {pendentesParaMim > 0 && (
          <strong className="text-body"> Você tem {pendentesParaMim} aguardando resposta.</strong>
        )}
        {concluidasSemMinhaAvaliacao > 0 && (
          <strong className="text-body">
            {" "}Você tem {concluidasSemMinhaAvaliacao} troca(s) concluída(s) para avaliar (aba Histórico).
          </strong>
        )}
      </p>

      <div className="d-flex flex-wrap gap-2 mb-3">
        {abas.map(([valor, rotulo]) => (
          <button key={valor} className={`chip ${aba === valor ? "active" : ""}`} onClick={() => setAba(valor)}>
            {rotulo}
          </button>
        ))}
      </div>

      {aba === "historico" && (
        <div className="d-flex flex-wrap gap-2 mb-4">
          {FILTROS_HISTORICO.map(([valor, rotulo]) => (
            <button
              key={valor}
              className={`chip ${filtroHistorico === valor ? "active" : ""}`}
              onClick={() => setFiltroHistorico(valor)}
            >
              {rotulo}
            </button>
          ))}
        </div>
      )}

      {carregando && <p className="text-center text-secondary my-5" role="status">Carregando trocas…</p>}

      {!carregando && erroCarga && (
        <div className="empty-state text-center p-5 my-4">
          <h3 className="h5 fw-bold">Algo deu errado</h3>
          <p className="small text-secondary mb-0">{erroCarga}</p>
        </div>
      )}

      {!carregando && !erroCarga && lista.length === 0 && (
        <div className="empty-state text-center p-5 my-4">
          <h3 className="h5 fw-bold">Nada por aqui ainda</h3>
          <p className="small text-secondary mb-0">
            {aba === "recebidas" && "Quando alguém pedir uma troca com você, a solicitação aparece aqui."}
            {aba === "enviadas" && "Suas solicitações em andamento aparecem aqui. Peça uma troca na tela Conhecimentos."}
            {aba === "historico" && "Trocas concluídas, recusadas e canceladas ficam guardadas aqui."}
          </p>
        </div>
      )}

      <div className="row g-4">
        {!carregando &&
          lista.map((t) => {
            const euSolicitei = t.solicitanteId === usuario.id;
            const outroNome = euSolicitei ? t.destinatarioNome : t.solicitanteNome;
            const outroId = euSolicitei ? t.destinatarioId : t.solicitanteId;
            const ocupado = ocupadoId === t.id;
            const temConversa = conversas.some((c) => c.id === t.id);
            const podeConversar = ativa(t) || t.status === STATUS.concluida || temConversa;
            const minhaAvaliacao = avaliacoesFeitas.get(t.id);

            return (
              <div key={t.id} className="col-12 col-lg-6">
                <article className="card-bt h-100 p-4 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <span className="avatar">{iniciais(outroNome)}</span>
                        <div>
                          <p className="small fw-bold mb-0 lh-sm">
                            <Link to={caminhoPerfil(outroId)} className="link-inline">{outroNome}</Link>
                          </p>
                          <p className="small text-secondary mb-0 lh-sm">
                            {euSolicitei ? "Você solicitou" : "Solicitou a você"}
                          </p>
                        </div>
                      </div>
                      <StatusTroca status={t.status} />
                    </div>

                    <p className="small mb-1">
                      <span className="text-secondary">{euSolicitei ? "Você quer: " : "Quer aprender com você: "}</span>
                      <strong>{t.conhecimentoDesejadoTitulo}</strong>
                    </p>
                    <p className="small mb-3">
                      <span className="text-secondary">{euSolicitei ? "Você oferece: " : "Oferece em troca: "}</span>
                      <strong>{t.conhecimentoOferecidoTitulo}</strong>
                    </p>

                    <p className="small text-secondary mb-0">
                      Criada em {formatarDataHora(t.criadoEmMs)}
                      {t.status === STATUS.concluida && ` · Concluída em ${formatarDataHora(t.concluidaEmMs)}`}
                      {t.status === STATUS.recusada && ` · Recusada em ${formatarDataHora(t.respondidaEmMs)}`}
                      {t.status === STATUS.cancelada && ` · Cancelada em ${formatarDataHora(t.canceladaEmMs)}`}
                      {t.status === STATUS.aceita && ` · Aceita em ${formatarDataHora(t.respondidaEmMs)}`}
                    </p>

                    {t.status === STATUS.concluida && minhaAvaliacao && (
                      <p className="small mt-2 mb-0 d-flex align-items-center gap-2">
                        Sua avaliação: <Estrelas valor={minhaAvaliacao.nota} />
                      </p>
                    )}
                  </div>

                  <div className="d-flex flex-wrap justify-content-end gap-2 mt-3">
                    {t.status === STATUS.pendente && !euSolicitei && (
                      <>
                        <button
                          className="btn btn-cancel btn-sm"
                          disabled={ocupado}
                          onClick={() =>
                            executar(t, recusarSolicitacao, "Solicitação recusada.", "Recusar esta solicitação?")
                          }
                        >
                          Recusar
                        </button>
                        <button
                          className="btn btn-brand btn-sm"
                          disabled={ocupado}
                          onClick={() => executar(t, aceitarSolicitacao, "Solicitação aceita!")}
                        >
                          Aceitar
                        </button>
                      </>
                    )}

                    {t.status === STATUS.pendente && euSolicitei && (
                      <button
                        className="btn btn-cancel btn-sm"
                        disabled={ocupado}
                        onClick={() =>
                          executar(t, cancelarSolicitacao, "Solicitação cancelada.", "Cancelar esta solicitação?")
                        }
                      >
                        Cancelar solicitação
                      </button>
                    )}

                    {t.status === STATUS.aceita && (
                      <button
                        className="btn btn-dark-bt btn-sm"
                        disabled={ocupado}
                        onClick={() =>
                          executar(
                            t,
                            concluirTroca,
                            "Troca marcada como concluída!",
                            "Marcar esta troca como concluída? Depois disso ela não pode mais ser alterada."
                          )
                        }
                      >
                        Marcar como concluída
                      </button>
                    )}

                    {t.status === STATUS.concluida && !minhaAvaliacao && (
                      <button className="btn btn-brand btn-sm" disabled={ocupado} onClick={() => setAvaliandoTroca(t)}>
                        ★ Avaliar {outroNome.split(" ")[0]}
                      </button>
                    )}

                    {podeConversar && (
                      <button className="btn btn-line btn-sm" disabled={ocupado} onClick={() => abrirConversa(t)}>
                        {temConversa ? "Abrir conversa" : "Conversar"}
                      </button>
                    )}
                  </div>
                </article>
              </div>
            );
          })}
      </div>

      {avaliandoTroca && (
        <AvaliacaoModal
          troca={avaliandoTroca}
          outroNome={
            avaliandoTroca.solicitanteId === usuario.id
              ? avaliandoTroca.destinatarioNome
              : avaliandoTroca.solicitanteNome
          }
          enviando={enviandoAvaliacao}
          onEnviar={enviarAvaliacao}
          onFechar={() => setAvaliandoTroca(null)}
        />
      )}

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