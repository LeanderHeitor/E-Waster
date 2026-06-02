import React from "react";
import { COLORS } from "../styles/colors";

export default function AgendamentoList({ slotsData = [], agendamentos = [], onSelect }) {

  // Evita crash se a API vier vazia ou undefined
  const slots = Array.isArray(slotsData) ? slotsData : [];

  // Agrupa por data (o Java retorna o campo 'data' como YYYY-MM-DD)
  const slotsPorData = slots.reduce((acc, slot) => {
    const data = slot.data || "Sem data";

    if (!acc[data]) {
      acc[data] = [];
    }

    acc[data].push(slot);
    return acc;
  }, {});

  // Função auxiliar para cortar os segundos (:00) caso o Java mande ex: "08:00:00"
  const formatarHora = (horaString) => {
    if (!horaString) return "";
    return horaString.substring(0, 5);
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1f2937", marginBottom: 4 }}>
        Agendar Coleta
      </h2>
      <p style={{ fontSize: 14, color: "#4b5563", marginBottom: 24 }}>
        Selecione uma data e um horário disponível para realizar o descarte.
      </p>

      {/* 🔴 CASO NÃO TENHA SLOTS DISPONÍVEIS */}
      {slots.length === 0 ? (
        <div style={{
          padding: "24px",
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #e5e7eb",
          color: "#6b7280"
        }}>
          <p>Nenhum horário disponível para agendamento no momento.</p>
        </div>
      ) : (
        Object.entries(slotsPorData).map(([data, horarios]) => (
          <div key={data} style={{ marginBottom: 24 }}>

            {/* HEADER DA DATA */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>📅</span>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#374151", margin: 0 }}>
                {data}
              </h3>
            </div>

            {/* GRID DE HORÁRIOS */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {horarios.map((slot, index) => {

                // CORREÇÃO CRUCIAL: Lendo as propriedades exatas do seu SlotColeta.java
                const inicio = slot.horarioInicio;
                const fim = slot.horarioFim;

                return (
                  <button
                    key={slot.id || index}
                    onClick={() => onSelect(slot)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "12px 20px",
                      borderRadius: 12,
                      border: "1px solid #e5e7eb",
                      cursor: "pointer",
                      background: "#ffffff",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                      transition: "all 0.2s ease-in-out",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#374151"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#2e7d32";
                      e.currentTarget.style.background = "#f0fdf4";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.background = "#ffffff";
                    }}
                  >
                    <span>⏰</span>
                    {inicio ? `${formatarHora(inicio)} às ${formatarHora(fim)}` : "Horário indisponível"}
                  </button>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}