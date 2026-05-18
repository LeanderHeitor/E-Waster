import { useState } from "react";
import PageHeader from "../components/PageHeader";
import InputField from "../components/InputField";
import { tiposResiduo } from "../data/mockData";
import { COLORS } from "../styles/colors";
import BotaoVoltar from "../components/BotaoVoltar";
function AgendamentoConfirm({ slot, onBack, onConfirm }) {
  const [selecionados, setSelecionados] = useState([]);

  const toggle = (id) => {
    setSelecionados((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const totalPontos = selecionados.reduce((sum, id) => {
    const item = tiposResiduo.find((t) => t.id === id);
    return sum + (item?.pontos || 0);
  }, 0);

  const itensSelecionados = tiposResiduo.filter((t) => selecionados.includes(t.id));

  return (
    <div>
      <BotaoVoltar onClick={onBack} label="Voltar aos horarios" />
      <PageHeader title="Confirmar Agendamento" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>
        <div>
          <div style={{ background: COLORS.greenBg, borderRadius: 10, padding: "20px 24px", marginBottom: 24, display: "flex", gap: 32 }}>
            <div>
              <div style={{ fontSize: 12, color: COLORS.green, fontWeight: 600, marginBottom: 4 }}>Data</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>{slot.dia}, {slot.data}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: COLORS.green, fontWeight: 600, marginBottom: 4 }}>Turno</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>{slot.turno}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: COLORS.green, fontWeight: 600, marginBottom: 4 }}>Horario</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>{slot.horario}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: COLORS.green, fontWeight: 600, marginBottom: 4 }}>Vagas</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>{slot.vagas} restantes</div>
            </div>
          </div>

          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 12 }}>
            Quais itens voce vai entregar?
          </div>
          <div style={{ fontSize: 13, color: COLORS.textSec, marginBottom: 16 }}>
            Selecione ao menos um item. Os pontos sao calculados automaticamente.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {tiposResiduo.map((tipo) => {
              const ativo = selecionados.includes(tipo.id);
              return (
                <button
                  key={tipo.id}
                  onClick={() => toggle(tipo.id)}
                  style={{
                    textAlign: "left", cursor: "pointer",
                    border: `2px solid ${ativo ? COLORS.green : COLORS.grayBorder}`,
                    borderRadius: 10, padding: "12px 14px",
                    background: ativo ? COLORS.greenBg : COLORS.white,
                    display: "flex", alignItems: "center", gap: 10,
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 6, background: ativo ? COLORS.green : COLORS.grayLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: ativo ? COLORS.white : COLORS.gray, flexShrink: 0 }}>
                    {tipo.sigla}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: COLORS.text }}>{tipo.nome}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.orange, marginTop: 2 }}>+{tipo.pontos} pts</div>
                  </div>
                  {ativo && (
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: COLORS.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: COLORS.white, fontWeight: 700, flexShrink: 0 }}>v</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ background: COLORS.white, border: `1px solid ${COLORS.grayBorder}`, borderRadius: 12, padding: "24px", position: "sticky", top: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 16 }}>Resumo</div>

          {selecionados.length === 0 ? (
            <div style={{ fontSize: 13, color: COLORS.textSec, padding: "12px 0", textAlign: "center" }}>
              Selecione ao menos um item
            </div>
          ) : (
            <>
              {itensSelecionados.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, marginBottom: 8, borderBottom: `1px solid ${COLORS.grayBorder}` }}>
                  <span style={{ fontSize: 13, color: COLORS.text }}>{item.nome}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.orange }}>+{item.pontos}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>Total</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: COLORS.green }}>+{totalPontos} pts</span>
              </div>
            </>
          )}

          <button
            onClick={() => selecionados.length > 0 && onConfirm(itensSelecionados, totalPontos)}
            disabled={selecionados.length === 0}
            style={{
              width: "100%", marginTop: 20, padding: "12px",
              background: selecionados.length > 0 ? COLORS.green : COLORS.grayBorder,
              color: COLORS.white, border: "none", borderRadius: 8,
              fontSize: 14, fontWeight: 600,
              cursor: selecionados.length > 0 ? "pointer" : "default",
            }}
          >
            Confirmar Agendamento
          </button>
        </div>
      </div>
    </div>
  );
}
export default AgendamentoConfirm;
