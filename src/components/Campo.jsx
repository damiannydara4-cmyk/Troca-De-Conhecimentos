import React from "react";

/* Campo de formulário padrão: rótulo + input + mensagem de erro opcional.
   Qualquer outra prop (type, value, onChange, required...) vai direto para o <input>. */
export default function Campo({ id, label, dica, erro, ...inputProps }) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">
        {label}
        {dica && <small className="text-secondary fw-normal"> {dica}</small>}
      </label>
      <input
        id={id}
        className={`form-control${erro ? " is-invalid" : ""}`}
        {...inputProps}
      />
      {erro && <div className="invalid-feedback">{erro}</div>}
    </div>
  );
}