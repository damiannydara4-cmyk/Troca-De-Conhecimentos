import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ROTAS, caminhoPerfil } from "../routes.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import Estrelas from "../components/Estrelas.jsx";
import { buscarPerfil } from "../services/perfilService.js";
import { calcularReputacao, listarAvaliacoesRecebidas } from "../services/avaliacaoService.js";
import { TIPOS, listarMeusConhecimentos } from "../services/conhecimentoService.js";
import { formatarDataHora, iniciais } from "../utils/formatadores.js";

const formatarMedia = (media) =>
  media.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export default function PerfilUsuario() {
  const { usuarioId } = useParams();
  const { usuario } = useAuth();

  const [perfil, setPerfil] = useState(null);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [conhecimentos, setConhecimentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(null);

    Promise.all([
      buscarPerfil(usuarioId),
      listarAvaliacoesRecebidas(usuarioId),
      listarMeusConhecimentos(usuarioId), // (o nome diz "meus", mas serve para qualquer pessoa)
    ])
      .then(([dadosPerfil, listaAvaliacoes, listaConhecimentos]) => {
        if (!ativo) return;
        setPerfil(dadosPerfil);
        setAvaliacoes(listaAvaliacoes);
        setConhecimentos(listaConhecimentos);
      })
      .catch((err) => {
        console.error("Erro ao carregar perfil:", err);
        if (ativo) setErro("Não foi possível carregar este perfil. Tente novamente.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [usuarioId, tentativa]);

  if (carregando) {
    return <p className="text-center text-secondary my-5" role="status">Carregando perfil…</p>;
  }

  if (erro) {
    return (
      <div className="container py-5">
        <div className="empty-state text-center p-5">
          <h3 className="h5 fw-bold">Algo deu errado</h3>
          <p className="small text-secondary">{erro}</p>
          <button className="btn btn-brand btn-sm" onClick={() => setTentativa((n) => n + 1)}>
            Tentar de novo
          </button>
        </div>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="container py-5">
        <div className="empty-state text-center p-5">
          <h3 className="h5 fw-bold">Perfil não encontrado</h3>
          <Link to={ROTAS.conhecimentos} className="btn btn-brand btn-sm">Ver conhecimentos</Link>
        </div>
      </div>
    );
  }

  const { total, media, distribuicao } = calcularReputacao(avaliacoes);
  const ehMeuPerfil = usuario?.id === perfil.id;

  return (
    <div className="container py-5" style={{ maxWidth: 920 }}>
      {/* Cabeçalho do perfil */}
      <div className="card-bt p-4 mb-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center gap-4">
          <span className="avatar avatar--grande">{iniciais(perfil.nome)}</span>

          <div className="flex-grow-1">
            <h1 className="h2 fw-bolder mb-1">
              {perfil.nome} {ehMeuPerfil && <span className="tag ms-2">Você</span>}
            </h1>
            {perfil.bio && <p className="text-secondary mb-1">{perfil.bio}</p>}
            {perfil.criadoEmMs > 0 && (
              <p className="small text-secondary mb-0">
                Membro desde {new Date(perfil.criadoEmMs).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>

          <div className="text-md-center">
            {total > 0 ? (
              <>
                <div className="reputacao-nota">{formatarMedia(media)}</div>
                <Estrelas valor={media} tamanho="1.2rem" />
                <p className="small text-secondary mb-0">
                  {total} avaliaç{total === 1 ? "ão" : "ões"}
                </p>
              </>
            ) : (
              <p className="small text-secondary mb-0">Ainda sem avaliações</p>
            )}
          </div>
        </div>

        {total > 0 && (
          <div className="mt-4">
            {[5, 4, 3, 2, 1].map((n) => (
              <div key={n} className="d-flex align-items-center gap-2 small mb-1">
                <span style={{ width: 28 }}>{n} ★</span>
                <div className="barra-reputacao flex-grow-1">
                  <div className="barra-reputacao__preenchida" style={{ width: `${(distribuicao[n] / total) * 100}%` }} />
                </div>
                <span className="text-secondary" style={{ width: 24 }}>{distribuicao[n]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="row g-4">
        {/* Avaliações recebidas */}
        <div className="col-12 col-lg-7">
          <h2 className="h5 fw-bold mb-3">Avaliações recebidas</h2>

          {avaliacoes.length === 0 ? (
            <div className="empty-state text-center p-4">
              <p className="small text-secondary mb-0">
                {ehMeuPerfil
                  ? "Quando alguém avaliar uma troca concluída com você, a avaliação aparece aqui."
                  : "Esta pessoa ainda não recebeu avaliações."}
              </p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {avaliacoes.map((a) => (
                <article key={a.id} className="card-bt p-3">
                  <div className="d-flex justify-content-between align-items-center gap-2 mb-1">
                    <Link to={caminhoPerfil(a.avaliadorId)} className="fw-bold small link-inline">
                      {a.avaliadorNome}
                    </Link>
                    <Estrelas valor={a.nota} />
                  </div>
                  {a.comentario && <p className="small mb-2">{a.comentario}</p>}
                  <p className="small text-secondary mb-0">
                    {a.assunto && <>Troca: {a.assunto} · </>}
                    {formatarDataHora(a.criadoEmMs)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Conhecimentos da pessoa */}
        <div className="col-12 col-lg-5">
          <h2 className="h5 fw-bold mb-3">Conhecimentos</h2>
          {conhecimentos.length === 0 ? (
            <div className="empty-state text-center p-4">
              <p className="small text-secondary mb-0">Nenhum conhecimento publicado.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {conhecimentos.map((k) => (
                <div key={k.id} className="card-bt p-3">
                  <p className="fw-bold small mb-1">{k.titulo}</p>
                  <span
                    className={`badge rounded-pill ${k.tipo === "aprender" ? "text-bg-warning" : "text-bg-primary"}`}
                  >
                    {TIPOS[k.tipo]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}