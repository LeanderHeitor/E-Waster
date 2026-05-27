import PageHeader from "../components/PageHeader";
import { COLORS } from "../styles/colors";
function AgendamentoSucesso({ agendamento, onHome, onVerAgendamentos }) {
  return (
  <div
    style={{
      minHeight: "calc(100vh - 72px)",
      padding: "32px",
      borderRadius: 24,

      backgroundImage:
        'linear-gradient(rgba(255,255,255,0.74), rgba(255,255,255,0.82)), url("/image5.webp")',

      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",

      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
      <div
  style={{
    maxWidth: 560,
    width: "100%",

    background: "rgba(255,255,255,0.92)",

    border: `1px solid ${COLORS.grayBorder}`,
    borderRadius: 12,
    padding: "40px",
    textAlign: "center",

    backdropFilter: "blur(6px)",
  }}
>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: COLORS.greenBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: COLORS.green, margin: "0 auto 20px" }}>OK</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>Agendamento confirmado</div>
        <div style={{ fontSize: 14, color: COLORS.textSec, lineHeight: 1.6 }}>
          {agendamento.slot.dia}, {agendamento.slot.data} &mdash; {agendamento.slot.turno} &bull; {agendamento.slot.horario}
        </div>

        <div style={{ marginTop: 20, background: COLORS.orangeLight, borderRadius: 10, padding: "14px 24px", display: "inline-block" }}>
          <div style={{ fontSize: 12, color: COLORS.orange, fontWeight: 500 }}>Pontos ganhos</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: COLORS.orange }}>+{agendamento.totalPontos}</div>
        </div>

        <div style={{ background: COLORS.grayLight, borderRadius: 8, padding: "14px 20px", marginTop: 20, fontSize: 13, color: COLORS.textSec, lineHeight: 1.6, textAlign: "left" }}>
          Compareça no horario agendado com os residuos selecionados. Voce receberá um lembrete antes da data.
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
          <button onClick={onVerAgendamentos} style={{ padding: "11px 24px", background: COLORS.white, color: COLORS.green, border: `1px solid ${COLORS.green}`, borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Ver meus agendamentos
          </button>
          <button onClick={onHome} style={{ padding: "11px 24px", background: COLORS.green, color: COLORS.white, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Voltar ao inicio
          </button>
        </div>
      </div>
    </div>
  );
}

export default AgendamentoSucesso;