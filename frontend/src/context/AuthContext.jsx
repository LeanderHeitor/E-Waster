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

  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem(USER_STORAGE_KEY);
      setToken(null);
      setUsuario(null);
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  const login = useCallback(async (email, senha) => {
    const data = await entrar({ email, senha });
    const usuarioLogado = { nome: data.nome, email: data.email };
    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(usuarioLogado));
    setToken(data.token);
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
