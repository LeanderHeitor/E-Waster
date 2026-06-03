import { useState } from "react";
import PageHeader from "../components/PageHeader";
import BadgeStatus from "../components/BadgeStatus";
import { COLORS } from "../styles/colors";

function MeusAgendamentos({ agendamentos, onAgendar, onCancelar }) {
  const [confirmandoCancelar, setConfirmandoCancelar] = useState(null);

  if (!agendamentos || agendamentos.length === 0) {
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
        <PageHeader title="Meus Agendamentos" subtitle="Histórico de coletas agendadas." />
        <div style={{ background: COLORS.white, border: `1px solid ${COLORS.grayBorder}`, borderRadius: 12, padding: "60px 40px", textAlign: "center", maxWidth: 480 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: COLORS.grayLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: COLORS.gray, margin: "0 auto 20px" }}>VAZIO</div>
          <div style={{ fontSize: 17, fontWeight: 600, color: COLORS.text, marginBottom: 8 }}>Nenhum agendamento ainda</div>
          <div style={{ fontSize: 14, color: COLORS.textSec, lineHeight: 1.6, marginBottom: 24 }}>
            Quando você agendar uma coleta, ela aparecerá aqui com todos os detalhes e pontos estimados.
          </div>
          <button onClick={onAgendar} style={{ padding: "11px 28px", background: COLORS.green, color: COLORS.white, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Agendar minha primeira coleta
          </button>
        </div>
      </div>
    );
  }

  // Mapeia os pontos tratando o status em maiúsculo vindo do Back-end
  const totalPontosGerais = agendamentos
  .filter((a) => a.status === "REALIZADO")
  .reduce((sum, a) => sum + (a.totalPts || a.totalPontos || 0), 0);

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
        subtitle={`${agendamentos.length} agendamento(s) — ${totalPontosGerais} pontos estimados`}
        action={
          <button onClick={onAgendar} style={{ padding: "10px 20px", background: COLORS.green, color: COLORS.white, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Novo agendamento
          </button>
        }
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {ordenados.map((agd) => {
          const cancelando = confirmandoCancelar === agd.id;

          // Trata tanto maiúsculo do back quanto o textual do front antigo
          const status = agd.status;

const isCancelado =
  status === "CANCELADO" ||
  status === "Cancelado" ||
  status === "NAO_COMPARECEU";

const isRealizado = status === "REALIZADO";

const podeCancelar = status === "PENDENTE" || status === "Pendente";

          const pontosDoAgendamento = agd.totalPts || agd.totalPontos || 0;

          // Formatação amigável de data vinda do LocalDate do Java (yyyy-MM-dd)
          const dataFormatada = agd.slot?.data
            ? agd.slot.data.split("-").reverse().join("/")
            : "Data indisponível";

          const textoHorario = agd.slot
            ? `${agd.slot.horarioInicio?.substring(0, 5)} às ${agd.slot.horarioFim?.substring(0, 5)}`
            : "";

          return (
            <div
              key={agd.id}
              style={{
                background: COLORS.white,
                border: `1px solid ${COLORS.grayBorder}`,
                borderRadius: 12, padding: "20px 24px",
                opacity: isCancelado ? 0.6 : 1,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>
                      Coleta Agendada: {dataFormatada}
                    </div>
                    <BadgeStatus status={agd.status} />
                  </div>
                  <div style={{ fontSize: 13, color: COLORS.textSec }}>{textoHorario}</div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0, marginLeft: 16 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: COLORS.orange, fontWeight: 600 }}>PONTOS</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: isCancelado ? COLORS.gray : COLORS.orange }}>
                      {isCancelado ? <s>+{pontosDoAgendamento}</s> : `+${pontosDoAgendamento}`}
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
                        Não
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ borderTop: `1px solid ${COLORS.grayBorder}`, paddingTop: 12 }}>
                <div style={{ fontSize: 12, color: COLORS.textSec, marginBottom: 8, fontWeight: 500 }}>Itens selecionados:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {agd.itens && agd.itens.map((item) => {
                    // Calcula os pontos baseados no retorno real do seu AgendamentoController do Java
                    const nomeExibicao = item.nomeResiduo || item.nome || "Resíduo";
                    const ptsDoItem = (item.pontuacaoBase || item.pontos || 0) * (item.quantidade || 1);

                    return (
                      <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 6, background: isCancelado ? COLORS.grayLight : COLORS.greenBg, borderRadius: 20, padding: "4px 12px" }}>
                        <span style={{ fontSize: 12, color: isCancelado ? COLORS.gray : COLORS.green, fontWeight: 500 }}>
                          {nomeExibicao} (x{item.quantidade})
                        </span>
                        <span style={{ fontSize: 11, color: isCancelado ? COLORS.gray : COLORS.orange, fontWeight: 600 }}>
                          +{ptsDoItem} pts
                        </span>
                      </div>
                    );
                  })}
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