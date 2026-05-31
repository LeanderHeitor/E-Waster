import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import LoginScreen from "./LoginScreen";

const mockLogin = vi.hoisted(() => vi.fn());

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

describe("RF02 - Login de usuário", () => {
  beforeEach(() => {
    mockLogin.mockReset();
  });
  afterEach(() => {
    cleanup();
  });

  it("CT-20: não chama login quando a senha está vazia", () => {
  render(<LoginScreen onIrCadastro={vi.fn()} />);

  fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
    target: { value: "teste@email.com" },
  });

  fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

  expect(mockLogin).not.toHaveBeenCalled();
});

  it("CT-21: exibe erro ao informar credenciais inválidas", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Credenciais inválidas"));

    render(<LoginScreen onIrCadastro={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
      target: { value: "erro@email.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("Sua senha"), {
      target: { value: "senhaerrada" },
    });

    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    expect(await screen.findByText(/credenciais inválidas/i)).toBeInTheDocument();
  });

  it("CT-22: chama o login ao informar credenciais válidas", async () => {
    mockLogin.mockResolvedValueOnce();

    render(<LoginScreen onIrCadastro={vi.fn()} />);

    fireEvent.change(screen.getAllByPlaceholderText("seu@email.com")[0], {
      target: { value: "eito@email.com" },
    });

    fireEvent.change(screen.getAllByPlaceholderText("Sua senha")[0], {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("eito@email.com", "123456");
    });
  });
});