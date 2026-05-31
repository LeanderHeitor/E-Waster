import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { AuthProvider, useAuth } from "./AuthContext";

const mockEntrar = vi.hoisted(() => vi.fn());

vi.mock("../api/authApi", () => ({
  entrar: mockEntrar,
}));

vi.mock("../api/http", () => ({
  TOKEN_STORAGE_KEY: "ewaster_token",
}));

function AuthConsumerTeste() {
  const { usuario, autenticado, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="autenticado">{autenticado ? "sim" : "nao"}</div>
      <div data-testid="usuario">{usuario?.nome || "sem usuario"}</div>

      <button onClick={() => login("teste@email.com", "123456")}>
        Fazer login
      </button>

      <button onClick={logout}>
        Sair
      </button>
    </div>
  );
}

describe("RF02 - Sessão de usuário", () => {
  beforeEach(() => {
    localStorage.clear();
    mockEntrar.mockReset();
  });
  
  afterEach(() => {
  cleanup();
});

  it("CT-24: persiste sessão após login", async () => {
    mockEntrar.mockResolvedValueOnce({
      token: "token-falso",
      nome: "Eito",
      email: "teste@email.com",
    });

    render(
      <AuthProvider>
        <AuthConsumerTeste />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: /fazer login/i }));

    await waitFor(() => {
      expect(localStorage.getItem("ewaster_token")).toBe("token-falso");
      expect(localStorage.getItem("ewaster_user")).toContain("Eito");
      expect(screen.getByTestId("autenticado")).toHaveTextContent("sim");
      expect(screen.getByTestId("usuario")).toHaveTextContent("Eito");
    });
  });

  it("CT-25: logout limpa sessão do usuário", async () => {
    localStorage.setItem("ewaster_token", "token-falso");
    localStorage.setItem(
      "ewaster_user",
      JSON.stringify({ nome: "Eito", email: "teste@email.com" })
    );

    render(
      <AuthProvider>
        <AuthConsumerTeste />
      </AuthProvider>
    );

    expect(screen.getByTestId("autenticado")).toHaveTextContent("sim");
    expect(screen.getByTestId("usuario")).toHaveTextContent("Eito");

    fireEvent.click(screen.getByRole("button", { name: /sair/i }));

    await waitFor(() => {
      expect(localStorage.getItem("ewaster_token")).toBeNull();
      expect(localStorage.getItem("ewaster_user")).toBeNull();
      expect(screen.getByTestId("autenticado")).toHaveTextContent("nao");
      expect(screen.getByTestId("usuario")).toHaveTextContent("sem usuario");
    });
  });
});