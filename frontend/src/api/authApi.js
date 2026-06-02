import { api } from "./http";

export function cadastrarUsuario({ nome, email, senha }) {
  return api.post("/auth/register", { nome, email, senha });
}

export function entrar({ email, senha }) {
  return api.post("/auth/login", { email, senha });
}