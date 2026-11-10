import React from "react";
import { ROTULO_STATUS } from "../services/trocaService.js";

/* Selo colorido com o status da troca (as cores estão em global.css) */
export default function StatusTroca({ status }) {
  return <span className={`status-troca status-troca--${status}`}>{ROTULO_STATUS[status] ?? status}</span>;
}