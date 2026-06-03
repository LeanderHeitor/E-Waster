import { useEffect } from "react";
import { COLORS } from "../styles/colors";

// Toast simples e autônomo: aparece no canto inferior direito e some sozinho.
// `message` vazio/null => não renderiza nada.
function Toast({ message, type = "error", onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(onClose, duration); // dispensa automática (deferida, não síncrona)
    return () => clearTimeout(id);
  }, [message, duration, onClose]);

  if (!message) return null;

  const estilos = {
    error: { bg: "#FEF2F2", border: "#FCA5A5", text: "#B71C1C", icon: "⚠️" },
    success: { bg: COLORS.greenBg, border: COLORS.green, text: COLORS.green, icon: "✓" },
  };
  const c = estilos[type] || estilos.error;

  return (
    <div
      role="alert"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: 10,
        maxWidth: 380,
        padding: "14px 16px",
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 12,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        color: c.text,
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      <span style={{ fontSize: 16 }}>{c.icon}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        aria-label="Fechar"
        style={{ background: "none", border: "none", color: c.text, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0 }}
      >
        ×
      </button>
    </div>
  );
}

export default Toast;
