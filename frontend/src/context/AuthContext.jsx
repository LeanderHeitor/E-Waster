import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { entrar } from "../api/authApi";
import { TOKEN_STORAGE_KEY } from "../api/http";

const USER_STORAGE_KEY = "ewaster_user";

const AuthContext = createContext(null);

function lerUsuarioPersistido() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [usuario, setUsuario] = useState(() => lerUsuarioPersistido());

  // Escuta deslogues forçados (ex: Token expirado / 401 Unauthorized)
  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setToken(null);
      setUsuario(null);
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  // 🚀 FUNÇÃO DE LOGIN ADAPTATIVA e INTELIGENTE
  const login = useCallback(async (email, senha) => {
    // 1. Faz a requisição para a API (O HTTP.js já extrai o .data)
    const data = await entrar({ email, senha });

    let jwtToken = null;

    // 2. Identifica onde está o token na resposta do Spring Boot
    if (typeof data === 'string') {
      jwtToken = data; // Caso o backend devolva o texto puro do JWT
    } else if (data && typeof data === 'object') {
      // Caso o backend devolva um objeto JSON { token: "..." }
      jwtToken = data.token || data.jwt || data.accessToken || data.id_token;
    }

    // Se mesmo após mapear não acharmos nada, barramos o fluxo
    if (!jwtToken) {
      throw new Error("Token não encontrado na resposta do servidor.");
    }

    // 3. Cria o objeto do usuário local (usa nome/tipo da resposta quando vierem)
    const usuarioLogado = {
      nome: (data && data.nome) || email.split('@')[0],
      email: email.trim(),
      tipo: (data && data.tipo) || "USUARIO"
    };

    // 4. Salva de forma persistente no LocalStorage
    localStorage.setItem(TOKEN_STORAGE_KEY, jwtToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(usuarioLogado));

    // 5. Atualiza os estados globais do React (Isso destrava o App.jsx)
    setToken(jwtToken);
    setUsuario(usuarioLogado);

    return usuarioLogado;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUsuario(null);
  }, []);

  const value = {
    usuario,
    token,
    autenticado: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}