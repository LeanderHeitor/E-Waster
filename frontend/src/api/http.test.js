import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { http, api, TOKEN_STORAGE_KEY } from "./http";

describe("RNF03 - Segurança/autenticação das requisições", () => {
  let adapterOriginal;

  beforeEach(() => {
    localStorage.clear();
    adapterOriginal = http.defaults.adapter;
  });

  afterEach(() => {
    http.defaults.adapter = adapterOriginal;
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("CT-26: não envia Authorization quando não há token salvo", async () => {
    http.defaults.adapter = vi.fn(async (config) => {
      expect(config.headers.Authorization).toBeUndefined();

      return {
        data: { ok: true },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    });

    await api.get("/usuarios/me");
  });

  it("CT-27: envia Authorization Bearer quando há token salvo", async () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, "token-teste");

    http.defaults.adapter = vi.fn(async (config) => {
      expect(config.headers.Authorization).toBe("Bearer token-teste");

      return {
        data: { ok: true },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    });

    await api.get("/usuarios/me");
  });

  it("CT-28: remove token e dispara evento quando recebe erro 401", async () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, "token-invalido");

    const listener = vi.fn();
    window.addEventListener("auth:unauthorized", listener);

    http.defaults.adapter = vi.fn(async (config) => {
      return Promise.reject({
        response: {
          status: 401,
          data: { message: "Nao autorizado" },
        },
        config,
        message: "Request failed with status code 401",
      });
    });

    await expect(api.get("/usuarios/me")).rejects.toThrow("Nao autorizado");

    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
    expect(listener).toHaveBeenCalled();

    window.removeEventListener("auth:unauthorized", listener);
  });
});