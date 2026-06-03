import { describe, it, expect } from "vitest";
import {
  totalPontosRealizados,
  agendamentosPendentes,
  pontosDoAgendamento,
} from "./agendamentos";

describe("totalPontosRealizados", () => {
  it("soma apenas os agendamentos REALIZADO", () => {
    const lista = [
      { status: "REALIZADO", totalPontos: 30 },
      { status: "PENDENTE", totalPontos: 50 },
      { status: "CANCELADO", totalPontos: 20 },
      { status: "NAO_COMPARECEU", totalPontos: 10 },
      { status: "REALIZADO", totalPontos: 5 },
    ];
    expect(totalPontosRealizados(lista)).toBe(35);
  });

  it("ignora PENDENTE — regressão do bug dos pontos acumulando antes do aceite", () => {
    const lista = [{ status: "PENDENTE", totalPontos: 100 }];
    expect(totalPontosRealizados(lista)).toBe(0);
  });

  it("aceita o campo legado totalPts", () => {
    const lista = [{ status: "REALIZADO", totalPts: 40 }];
    expect(totalPontosRealizados(lista)).toBe(40);
  });

  it("retorna 0 para lista vazia ou indefinida", () => {
    expect(totalPontosRealizados([])).toBe(0);
    expect(totalPontosRealizados()).toBe(0);
  });
});

describe("agendamentosPendentes", () => {
  it("retorna só os de status PENDENTE", () => {
    const lista = [
      { id: 1, status: "PENDENTE" },
      { id: 2, status: "REALIZADO" },
      { id: 3, status: "PENDENTE" },
      { id: 4, status: "CANCELADO" },
    ];
    expect(agendamentosPendentes(lista).map((a) => a.id)).toEqual([1, 3]);
  });

  it("retorna lista vazia quando não há pendentes", () => {
    expect(agendamentosPendentes([{ status: "REALIZADO" }])).toEqual([]);
  });
});

describe("pontosDoAgendamento", () => {
  it("prioriza totalPontos, cai para totalPts e depois 0", () => {
    expect(pontosDoAgendamento({ totalPontos: 12 })).toBe(12);
    expect(pontosDoAgendamento({ totalPts: 7 })).toBe(7);
    expect(pontosDoAgendamento({})).toBe(0);
  });
});
