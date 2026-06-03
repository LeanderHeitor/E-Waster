import React from "react";
import PageHeader from "../components/PageHeader";
import { COLORS } from "../styles/colors";

function AgendamentoSucesso({ agendamento, onHome, onVerAgendamentos }) {

  // Função auxiliar para cortar os segundos (:00) caso venha "08:00:00" do Java
  const formatarHora = (horaString) => {
    if (!horaString) return "";
    return horaString.substring(0, 5);
  };

  // Resgata os dados com caminhos alternativos seguros (evita crashes por undefined)
  const dataAgendamento = agendamento?.slot?.data || "Sem data";
  const horaInicio = agendamento?.slot?.horarioInicio ? formatarHora(agendamento.slot.horarioInicio) : "";
  const horaFim = agendamento?.slot?.horarioFim ? formatarHora(agendamento.slot.horarioFim) : "";

  // Busca a pontuação total independente se a chave veio do Java como totalPontos, pontuacaoTotal ou pontos
  const pontosCalculados = agendamento?.totalPontos || agendamento?.pontuacaoTotal || agendamento?.pontos || 0;

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
          border: `1px solid ${COLORS.grayBorder || "#e5e7eb"}`,
          borderRadius: 12,
          padding: "40px",
          textAlign: "center",
          backdropFilter: "blur(6px)",
        }}
      >
        {/* ÍCONE DE SUCESSO */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: COLORS.greenBg || "#f0fdf4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 700,
            color: COLORS.green || "#16a34a",
            margin: "0 auto 20px"
          }}
        >
          OK
        </div>

        <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.text || "#1f2937", marginBottom: 8 }}>
          Agendamento confirmado
        </div>

        {/* CORREÇÃO DAS CHAVES DE DATA E HORÁRIO */}
        <div style={{ fontSize: 14, color: COLORS.textSec || "#4b5563", lineHeight: 1.6 }}>
          📅 {dataAgendamento} {horaInicio && `— ⏰ ${horaInicio} às ${horaFim}`}
        </div>

        {/* CAIXA DE PONTOS CORRIGIDA */}
        <div
          style={{
            marginTop: 20,
            background: COLORS.orangeLight || "#ffedd5",
            borderRadius: 10,
            padding: "14px 24px",
            display: "inline-block"
          }}
        >
          <div style={{ fontSize: 12, color: COLORS.orange || "#ea580c", fontWeight: 500 }}>
            Pontos pendentes
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: COLORS.orange || "#ea580c" }}>
            +{pontosCalculados}
          </div>
        </div>

        <div
          style={{
            background: COLORS.grayLight || "#f9fafb",
            borderRadius: 8,
            padding: "14px 20px",
            marginTop: 20,
            fontSize: 13,
            color: COLORS.textSec || "#6b7280",
            lineHeight: 1.6,
            textAlign: "left"
          }}
        >
          Compareça no horário agendado com os resíduos selecionados. Você receberá um lembrete antes da data.
        </div>

        {/* BOTÕES DE NAVEGAÇÃO */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
          <button
            onClick={onVerAgendamentos}
            style={{
              padding: "11px 24px",
              background: COLORS.white || "#ffffff",
              color: COLORS.green || "#2e7d32",
              border: `1px solid ${COLORS.green || "#2e7d32"}`,
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Ver meus agendamentos
          </button>

          <button
            onClick={onHome}
            style={{
              padding: "11px 24px",
              background: COLORS.green || "#2e7d32",
              color: COLORS.white || "#ffffff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Voltar ao início
          </button>
        </div>
      </div>
    </div>
  );
}

export default AgendamentoSucesso;