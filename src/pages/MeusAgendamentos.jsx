import { useState } from "react";
import PageHeader from "../components/PageHeader";
import BadgeStatus from "../components/BadgeStatus";
import { COLORS } from "../styles/colors";

function MeusAgendamentos({ agendamentos, onAgendar, onCancelar }) {
  const [confirmandoCancelar, setConfirmandoCancelar] = useState(null);

  if (agendamentos.length === 0) {
    return (
  <div
    style={{
      minHeight: "calc(100vh - 72px)",
      padding: "32px",
      borderRadius: 24,

      backgroundImage:
        'linear-gradient(rgba(255,255,255,0.72), rgba(255,255,255,0.80)), url("/image2.png")',

      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}
  >
        <PageHeader title="Meus Agendamentos" subtitle="Historico de coletas agendadas." />
        <div style={{ background: COLORS.white, border: `1px solid ${COLORS.grayBorder}`, borderRadius: 12, padding: "60px 40px", textAlign: "center", maxWidth: 480 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: COLORS.grayLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: COLORS.gray, margin: "0 auto 20px" }}>VAZIO</div>
          <div style={{ fontSize: 17, fontWeight: 600, color: COLORS.text, marginBottom: 8 }}>Nenhum agendamento ainda</div>
          <div style={{ fontSize: 14, color: COLORS.textSec, lineHeight: 1.6, marginBottom: 24 }}>
            Quando voce agendar uma coleta, ela aparecera aqui com todos os detalhes e pontos estimados.
          </div>
          <button onClick={onAgendar} style={{ padding: "11px 28px", background: COLORS.green, color: COLORS.white, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Agendar minha primeira coleta
          </button>
        </div>
      </div>
    );
  }

  const totalPontos = agendamentos
    .filter((a) => a.status !== "Cancelado")
    .reduce((sum, a) => sum + a.totalPontos, 0);

  const ordenados = agendamentos.slice().reverse();

  return (
  <div
    style={{
      minHeight: "calc(100vh - 72px)",
      padding: "32px",
      borderRadius: 24,

      backgroundImage:
        'linear-gradient(rgba(255,255,255,0.72), rgba(255,255,255,0.80)), url("/image2.png")',

      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}
  >
      <PageHeader
        title="Meus Agendamentos"
        subtitle={`${agendamentos.length} agendamento(s) — ${totalPontos} pontos estimados`}
        action={
          <button onClick={onAgendar} style={{ padding: "10px 20px", background: COLORS.green, color: COLORS.white, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Novo agendamento
          </button>
        }
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {ordenados.map((agd) => {
          const cancelando = confirmandoCancelar === agd.id;
          const podeCancelar = agd.status === "Pendente";
          return (
            <div
              key={agd.id}
              style={{
                background: COLORS.white,
                border: `1px solid ${agd.status === "Cancelado" ? COLORS.grayBorder : COLORS.grayBorder}`,
                borderRadius: 12, padding: "20px 24px",
                opacity: agd.status === "Cancelado" ? 0.6 : 1,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>
                      {agd.slot.dia}, {agd.slot.data} &mdash; {agd.slot.turno}
                    </div>
                    <BadgeStatus status={agd.status} />
                  </div>
                  <div style={{ fontSize: 13, color: COLORS.textSec }}>{agd.slot.horario}</div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0, marginLeft: 16 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: COLORS.orange, fontWeight: 600 }}>PONTOS ESTIMADOS</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: agd.status === "Cancelado" ? COLORS.gray : COLORS.orange }}>
                      {agd.status === "Cancelado" ? <s>+{agd.totalPontos}</s> : `+${agd.totalPontos}`}
                    </div>
                  </div>

                  {podeCancelar && !cancelando && (
                    <button
                      onClick={() => setConfirmandoCancelar(agd.id)}
                      style={{ padding: "9px 18px", background: "none", border: "1px solid #D32F2F", color: "#D32F2F", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
                    >
                      Cancelar agendamento
                    </button>
                  )}

                  {podeCancelar && cancelando && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, color: COLORS.text, whiteSpace: "nowrap" }}>Tem certeza?</span>
                      <button
                        onClick={() => { onCancelar(agd.id); setConfirmandoCancelar(null); }}
                        style={{ padding: "9px 16px", background: "#D32F2F", border: "none", color: COLORS.white, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
                      >
                        Sim
                      </button>
                      <button
                        onClick={() => setConfirmandoCancelar(null)}
                        style={{ padding: "9px 16px", background: COLORS.grayLight, border: `1px solid ${COLORS.grayBorder}`, color: COLORS.text, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                      >
                        Nao
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ borderTop: `1px solid ${COLORS.grayBorder}`, paddingTop: 12 }}>
                <div style={{ fontSize: 12, color: COLORS.textSec, marginBottom: 8, fontWeight: 500 }}>Itens selecionados:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {agd.itens.map((item) => (
                    <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 6, background: agd.status === "Cancelado" ? COLORS.grayLight : COLORS.greenBg, borderRadius: 20, padding: "4px 12px" }}>
                      <span style={{ fontSize: 12, color: agd.status === "Cancelado" ? COLORS.gray : COLORS.green, fontWeight: 500 }}>{item.nome}</span>
                      <span style={{ fontSize: 11, color: agd.status === "Cancelado" ? COLORS.gray : COLORS.orange, fontWeight: 600 }}>+{item.pontos}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MeusAgendamentos;