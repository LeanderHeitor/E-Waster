import { COLORS } from "../styles/colors";
function BotaoVoltar({ onClick, label = "Voltar" }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none", border: "none", cursor: "pointer",
        color: COLORS.green, fontSize: 14, fontWeight: 500,
        padding: "0 0 20px", display: "flex", alignItems: "center", gap: 6,
      }}
    >
      &larr; {label}
    </button>
  );
}
export default BotaoVoltar;
