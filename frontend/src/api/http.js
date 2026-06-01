import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api/v1";

export const TOKEN_STORAGE_KEY = "ewaster_token";

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      // Sinaliza para o AuthContext derrubar a sessão e voltar para /login
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    return Promise.reject(normalizeError(error));
  }
);

function normalizeError(error) {
  const data = error.response?.data;
  const mensagem =
    typeof data === "string" && data
      ? data
      : data?.erro || data?.message || error.message || "Nao foi possivel completar a requisicao.";

  const e = new Error(mensagem);
  e.status = error.response?.status;
  return e;
}

export const api = {
  get: (path) => http.get(path).then((r) => r.data),
  post: (path, body) => http.post(path, body).then((r) => r.data),
};
