import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import { listarSlots } from "../api/slotApi";
import { COLORS } from "../styles/colors";
function AgendamentoList({ onSelect, agendamentos }) {
  const [slots, setSlots] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    listarSlots()
      .then((lista) => { if (ativo) setSlots(lista); })
      .catch((e) => { if (ativo) setErro(e.message || "Falha ao carregar os horarios."); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);

  const slotsOcupados = (agendamentos || []).filter((a) => a.status !== "Cancelado").map((a) => a.slot.id);
  return (
  <div
    style={{
      minHeight: "calc(100vh - 72px)",
      padding: "32px",
      borderRadius: 24,

      backgroundImage:
        'linear-gradient(rgba(255,255,255,0.72), rgba(255,255,255,0.80)), url("/image4.png")',

      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}
  >
      <PageHeader title="Agendar Coleta" subtitle="Selecione um horario disponivel para entrega dos seus residuos." />
      {carregando && (
        <div style={{ fontSize: 13, color: COLORS.textSec, padding: "16px 0" }}>Carregando horarios...</div>
      )}
      {erro && (
        <div style={{ fontSize: 13, color: "#c0392b", padding: "16px 0" }}>{erro}</div>
      )}
      {!carregando && !erro && slots.length === 0 && (
        <div style={{ fontSize: 13, color: COLORS.textSec, padding: "16px 0" }}>Nenhum horario disponivel no momento.</div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {slots.map((slot) => {
          const esgotado = slot.vagas === 0;
          const jaAgendado = slotsOcupados.includes(slot.id);
          const desabilitado = esgotado || jaAgendado;
          const ocupacao = ((slot.max - slot.vagas) / slot.max) * 100;
          return (
            <button
              key={slot.id}
              disabled={desabilitado}
              onClick={() => !desabilitado && onSelect(slot)}
              style={{
                textAlign: "left", cursor: desabilitado ? "default" : "pointer",
                border: `1px solid ${jaAgendado ? COLORS.greenMuted : desabilitado ? COLORS.grayBorder : COLORS.greenMuted}`,
                borderRadius: 10, padding: "18px 20px",
                background: jaAgendado ? COLORS.greenBg : desabilitado ? COLORS.grayLight : COLORS.white,
                opacity: esgotado ? 0.55 : 1,
              }}
              onMouseEnter={(e) => { if (!desabilitado) e.currentTarget.style.boxShadow = "0 2px 12px rgba(46,125,50,0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ fontSize: 12, color: COLORS.textSec, marginBottom: 4 }}>{slot.dia}, {slot.data}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>{slot.turno}</div>
              <div style={{ fontSize: 13, color: COLORS.textSec, marginTop: 2, marginBottom: 14 }}>{slot.horario}</div>
              <div style={{ height: 4, background: COLORS.grayBorder, borderRadius: 4, marginBottom: 8 }}>
                <div style={{ height: "100%", width: `${ocupacao}%`, background: desabilitado ? COLORS.gray : COLORS.greenLight, borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: jaAgendado ? COLORS.green : esgotado ? COLORS.gray : COLORS.green }}>
                {jaAgendado ? "Ja agendado por voce" : esgotado ? "Esgotado" : `${slot.vagas} de ${slot.max} vagas disponiveis`}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
export default AgendamentoList;
