import React from "react";

/* Mostra uma nota de 0 a 5 em estrelas (arredonda para a estrela inteira mais próxima) */
export default function Estrelas({ valor, tamanho = "1rem" }) {
  const cheias = Math.round(valor);
  return (
    <span className="estrelas" style={{ fontSize: tamanho }} role="img" aria-label={`Nota ${valor} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= cheias ? "estrela estrela--cheia" : "estrela"}>★</span>
      ))}
    </span>
  );
}