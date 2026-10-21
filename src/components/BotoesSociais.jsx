import React from "react";

/* Login social ainda não existe: os botões ficam visíveis, porém desativados. */
export default function BotoesSociais() {
  return (
    <>
      <div className="divider-text">
        <span>ou continue com</span>
      </div>
      <div className="row g-2">
        {["Google", "GitHub"].map((nome) => (
          <div className="col-6" key={nome}>
            <button type="button" className="btn btn-line w-100" disabled title="Em breve">
              {nome}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}