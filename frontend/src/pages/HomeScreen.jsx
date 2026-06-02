import PageHeader from "../components/PageHeader";
import { COLORS } from "../styles/colors";

function HomeScreen({ onNavigate, usuario, totalPontos, totalAgendamentos, totalHistorico }) {
  // 🚀 Extrai o nome de dentro do objeto se ele existir, ou usa o próprio valor caso venha como texto limpo.
  const nomeUsuario = typeof usuario === "object" ? (usuario?.nome || usuario?.username || "Usuário") : usuario;

  return (
    <div
      style={{
        minHeight: "calc(100vh - 72px)",
        padding: "32px",
        borderRadius: 24,
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.55), rgba(255,255,255,0.72)), url("/user-home-bg.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <PageHeader
        title={`Bem-vindo, ${nomeUsuario}`} // 🚀 Agora exibe o texto correto e não trava o React
        subtitle="Gerencie suas coletas de residuos eletronicos."
        subtitleColor="#1f2937"
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 32, maxWidth: 520 }}>
        <div style={{ background: COLORS.white, border: `1px solid ${COLORS.grayBorder}`, borderRadius: 12, padding: "20px 24px" }}>
          <div style={{ fontSize: 13, color: COLORS.textSec, marginBottom: 6 }}>Seus pontos</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.text }}>{totalPontos}</div>
          <div style={{ fontSize: 12, color: COLORS.textSec, marginTop: 4 }}>
            {totalPontos === 0 ? "Faca um agendamento para ganhar" : "Acumulados via agendamentos ativos"}
          </div>
        </div>
        <div style={{ background: COLORS.white, border: `1px solid ${COLORS.grayBorder}`, borderRadius: 12, padding: "20px 24px" }}>
          <div style={{ fontSize: 13, color: COLORS.textSec, marginBottom: 6 }}>Agendamentos ativos</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.text }}>{totalAgendamentos}</div>
          <div style={{ fontSize: 12, color: COLORS.textSec, marginTop: 4 }}>
            {totalAgendamentos === 0 ? "Nenhum agendamento pendente" : `${totalAgendamentos} pendente(s)`}
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 600, color: COLORS.text, margin: "0 0 16px" }}>Acoes rapidas</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, maxWidth: 640 }}>
        <button
          onClick={() => onNavigate("agendamento")}
          style={{ border: `1px solid ${COLORS.grayBorder}`, borderRadius: 12, padding: "24px", background: COLORS.white, cursor: "pointer", textAlign: "left" }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = COLORS.green}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = COLORS.grayBorder}
        >
          <div style={{ width: 48, height: 48, borderRadius: 10, background: COLORS.greenBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: COLORS.green, marginBottom: 14 }}>AGD</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>Agendar Coleta</div>
          <div style={{ fontSize: 13, color: COLORS.textSec, marginTop: 4, lineHeight: 1.4 }}>Escolha data, turno e os itens que vai entregar</div>
        </button>
        <button
          onClick={() => onNavigate("meus-agendamentos")}
          style={{ border: `1px solid ${COLORS.grayBorder}`, borderRadius: 12, padding: "24px", background: COLORS.white, cursor: "pointer", textAlign: "left" }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = COLORS.green}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = COLORS.grayBorder}
        >
          <div style={{ width: 48, height: 48, borderRadius: 10, background: COLORS.greenBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: COLORS.green, marginBottom: 14 }}>HIST</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>Meus Agendamentos</div>
          <div style={{ fontSize: 13, color: COLORS.textSec, marginTop: 4, lineHeight: 1.4 }}>
            {totalHistorico === 0
              ? "Nenhum agendamento ainda"
              : totalAgendamentos === 0
                ? `Ver historico (${totalHistorico} cancelado(s))`
                : `${totalAgendamentos} ativo(s) — ver historico`}
          </div>
        </button>
      </div>
    </div>
  );
}

export default HomeScreen;