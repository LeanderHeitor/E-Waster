// Base URL da API do backend.
//
// Em desenvolvimento usa o backend local (porta 8081).
// Em produção (Render/Vercel), defina a variável de ambiente VITE_API_URL
// apontando para o backend publicado, ex:
//   VITE_API_URL=https://ewaster-backend.onrender.com/api/v1
//
// O Vite injeta esse valor no momento do build (npm run build).
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8081/api/v1";
