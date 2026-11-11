import React, { useState } from "react";
import { LIMITE_COMENTARIO } from "../services/avaliacaoService.js";

const ROTULOS = { 1: "Ruim", 2: "Regular", 3: "Bom", 4: "Muito bom", 5: "Excelente" };

/* Pop-up para avaliar a outra pessoa depois de uma troca concluída.
   Usa as mesmas classes de modal do Bootstrap que a tela Conhecimentos já usa. */
export default function AvaliacaoModal({ troca, outroNome, enviando, onEnviar, onFechar }) {
  const [nota, setNota] = useState(0);
  const [destaque, setDestaque] = useState(0); // estrela sob o mouse
  const [comentario, setComentario] = useState("");

  const fechar = () => {
    if (!enviando) onFechar();
  };

  const aoEnviar = (e) => {
    e.preventDefault();
    if (nota === 0) return;
    onEnviar({ nota, comentario });
  };

  const mostrada = destaque || nota;

  return (
    <>
      <div className="modal-backdrop show"></div>
      <div className="modal d-block" onClick={fechar}>
        <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <button className="btn-close modal-close-abs" aria-label="Fechar" onClick={fechar}></button>
            <div className="modal-body p-4">
              <h3 className="h4 fw-bold">Avaliar {outroNome}</h3>
              <p className="small text-secondary">
                Troca: <strong>{troca.conhecimentoOferecidoTitulo} ⇄ {troca.conhecimentoDesejadoTitulo}</strong>
              </p>

              <form onSubmit={aoEnviar}>
                <div className="mb-3">
                  <span className="form-label d-block">Sua nota *</span>
                  <div className="d-flex align-items-center gap-2">
                    <div className="estrelas" role="radiogroup" aria-label="Nota de 1 a 5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          role="radio"
                          aria-checked={nota === n}
                          aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
                          className={`estrela-btn ${n <= mostrada ? "estrela--cheia" : ""}`}
                          onClick={() => setNota(n)}
                          onMouseEnter={() => setDestaque(n)}
                          onMouseLeave={() => setDestaque(0)}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <span className="small text-secondary">{mostrada ? ROTULOS[mostrada] : "Escolha uma nota"}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="av-comentario" className="form-label">Comentário (opcional)</label>
                  <textarea
                    id="av-comentario"
                    rows="3"
                    className="form-control"
                    maxLength={LIMITE_COMENTARIO}
                    placeholder="Como foi a troca? O que você aprendeu?"
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                  ></textarea>
                  <div className="small text-secondary text-end mt-1">{comentario.length}/{LIMITE_COMENTARIO}</div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-cancel btn-sm" onClick={fechar} disabled={enviando}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-brand btn-sm" disabled={enviando || nota === 0}>
                    {enviando ? "Enviando…" : "Enviar avaliação"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}