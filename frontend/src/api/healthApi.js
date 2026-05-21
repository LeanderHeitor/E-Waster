import { api } from "./http";

export function verificarApi() {
  return api.get("/health");
}
