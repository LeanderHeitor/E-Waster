import { COLORS } from "../styles/colors";

const STATUS_CONFIG = {
  Pendente: { cor: "#1565C0", bg: "#E3F2FD", label: "Pendente" },
  Realizado: { cor: COLORS.green, bg: COLORS.greenBg, label: "Realizado" },
  Cancelado: { cor: "#B71C1C", bg: "#FFEBEE", label: "Cancelado" },
  "Nao compareceu": { cor: COLORS.orange, bg: COLORS.orangeLight, label: "Nao compareceu" },
};

function BadgeStatus({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Pendente"];

  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: 20,
        color: cfg.cor,
        background: cfg.bg,
        letterSpacing: "0.3px",
      }}
    >
      {cfg.label.toUpperCase()}
    </span>
  );
}

export default BadgeStatus;
