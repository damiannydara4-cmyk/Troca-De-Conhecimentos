/* Pequenas funções de formatação usadas em várias telas. */

// "Carla Mendes" -> "CM"
export const iniciais = (nome) =>
  (nome || "?").trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

// 1731180000000 -> "09/11/2026 14:30"
export function formatarDataHora(ms) {
  if (!ms) return "";
  return new Date(ms).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

// Hoje mostra só a hora ("14:30"); outros dias mostram a data ("09/11/2026")
export function formatarDataCurta(ms) {
  if (!ms) return "";
  const data = new Date(ms);
  const hoje = new Date();
  const mesmoDia = data.toDateString() === hoje.toDateString();
  return mesmoDia
    ? data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : data.toLocaleDateString("pt-BR");
}