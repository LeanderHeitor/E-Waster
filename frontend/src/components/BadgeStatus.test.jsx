import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import BadgeStatus from "./BadgeStatus";

afterEach(cleanup);

describe("BadgeStatus", () => {
  it("mapeia os status do backend (CAIXA ALTA) para o rótulo certo", () => {
    // Regressão do bug: REALIZADO/NAO_COMPARECEU caíam no fallback e viravam 'Pendente'.
    const casos = [
      ["PENDENTE", "PENDENTE"],
      ["REALIZADO", "REALIZADO"],
      ["CANCELADO", "CANCELADO"],
      ["NAO_COMPARECEU", "NÃO COMPARECEU"],
    ];
    for (const [status, label] of casos) {
      const { unmount } = render(<BadgeStatus status={status} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    }
  });

  it("REALIZADO não exibe 'PENDENTE' (o bug original)", () => {
    render(<BadgeStatus status="REALIZADO" />);
    expect(screen.queryByText("PENDENTE")).not.toBeInTheDocument();
  });

  it("usa o próprio texto como fallback para status desconhecido", () => {
    render(<BadgeStatus status="QUALQUER" />);
    expect(screen.getByText("QUALQUER")).toBeInTheDocument();
  });
});
