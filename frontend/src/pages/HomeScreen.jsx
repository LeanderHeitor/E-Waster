import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { verificarApi } from "../api/healthApi";
import { COLORS } from "../styles/colors";
function HomeScreen({ onNavigate, usuario, totalPontos, totalAgendamentos, totalHistorico }) {
  const [apiStatus, setApiStatus] = useState("Verificando API...");

  useEffect(() => {
    let ativo = true;

    verificarApi()
      .then((resposta) => {
        if (ativo) setApiStatus(resposta || "API online");
      })
      .catch(() => {
        if (ativo) setApiStatus("API indisponivel");
      });

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <div>
      <PageHeader
        title={`Bem-vindo, ${usuario}`}
        subtitle="Gerencie suas coletas de residuos eletronicos."
      />
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: `1px solid ${COLORS.grayBorder}`, borderRadius: 999, padding: "6px 12px", background: COLORS.white, color: apiStatus === "API indisponivel" ? "#D32F2F" : COLORS.green, fontSize: 12, fontWeight: 600, marginBottom: 20 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: apiStatus === "API indisponivel" ? "#D32F2F" : COLORS.green }} />
        {apiStatus}
      </div>
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
