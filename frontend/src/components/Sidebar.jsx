import logoImg from "../assets/Ewaister.png";
import { COLORS } from "../styles/colors";

function Sidebar({ screen, onNavigate, usuario, onLogout }) {
  const navItems = [
    { id: "home", label: "Inicio" },
    { id: "agendamento", label: "Agendar Coleta" },
    { id: "meus-agendamentos", label: "Meus Agendamentos" },
    { id: "ranking", label: "Ranking" },
  ];

  const activeGroup = screen.startsWith("agendamento") ? "agendamento"
    : screen.startsWith("meus-agendamentos") ? "meus-agendamentos"
    : screen.startsWith("ranking") ? "ranking"
    : "home";

  return (
    <div style={{ width: 240, minHeight: "100vh", background: COLORS.sidebarBg, display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "28px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <img src={logoImg} alt="E-Waster" style={{ width: 32, height: 32, flexShrink: 0 }} />
          <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.white, letterSpacing: "-0.5px" }}>E-Waster</div>
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Coleta Consciente</div>
      </div>

      <nav style={{ padding: "16px 12px", flex: 1 }}>
        {navItems.map((item) => {
          const ativo = activeGroup === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                width: "100%", textAlign: "left", border: "none", cursor: "pointer",
                padding: "10px 12px", borderRadius: 8, marginBottom: 4,
                background: ativo ? "rgba(255,255,255,0.15)" : "transparent",
                color: ativo ? COLORS.white : "rgba(255,255,255,0.65)",
                fontSize: 14, fontWeight: ativo ? 600 : 400,
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Logado como</div>
        {/* 🚀 CORRIGIDO: Agora renderiza apenas a propriedade string .nome */}
        <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", marginTop: 2, marginBottom: 10 }}>
          {usuario?.nome || "Usuário"}
        </div>
        <button
          onClick={onLogout}
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", borderRadius: 6, padding: "7px 12px", fontSize: 12, cursor: "pointer", width: "100%", textAlign: "center" }}
        >
          Sair
        </button>
      </div>
    </div>
  );
}

export default Sidebar;