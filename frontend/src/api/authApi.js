import { api } from "./http";

export function cadastrarUsuario({ nome, email, senha }) {
  return api.post("/auth/register", { nome, email, senha });
}
