import { api } from "./http";

// Lista os slots de coleta disponiveis (GET /slots, exige JWT).
// O backend ja devolve dia/data/turno/horario/vagas/max prontos para a UI.
export function listarSlots() {
  return api.get("/slots");
}
