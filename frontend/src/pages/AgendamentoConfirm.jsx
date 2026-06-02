import React, { useState, useEffect } from "react";
import { COLORS } from "../styles/colors";

// Mock caso seu backend ainda não tenha dados cadastrados na inicialização
const ITENS_PADRAO = [
  { id: 1, nome: "Celular/SmartPhone", sigla: "CEL", pontuacaoBase: 50 },
  { id: 2, nome: "Notebook/Laptop", sigla: "NB", pontuacaoBase: 80 },
  { id: 3, nome: "Pilhas e Baterias", sigla: "PIL", pontuacaoBase: 15 },
  { id: 4, nome: "Cabos e Carregadores", sigla: "CAB", pontuacaoBase: 10 },
  { id: 5, nome: "Monitor/Tela", sigla: "MON", pontuacaoBase: 100 },
  { id: 6, nome: "Teclado/Mouse", sigla: "TEC", pontuacaoBase: 25 },
  { id: 7, nome: "Memoria RAM", sigla: "RAM", pontuacaoBase: 30 },
  { id: 8, nome: "Placa-mãe", sigla: "MB", pontuacaoBase: 90 },
  { id: 9, nome: "HD/SSD", sigla: "HD", pontuacaoBase: 40 },
];

export default function AgendamentoConfirm({ slot, onBack, onConfirm }) {
  const [tiposResiduos, setTiposResiduos] = useState([]);
  const [quantidades, setQuantidades] = useState({});
  const [carregando, setCarregando] = useState(true);

  // 1. Carrega os tipos de resíduos do Banco de Dados
  useEffect(() => {
    const buscarTiposResiduos = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/v1/tiporesiduo");
        if (response.ok) {
          const dados = await response.json();
          setTiposResiduos(dados.length > 0 ? dados : ITENS_PADRAO);
        } else {
          setTiposResiduos(ITENS_PADRAO);
        }
      } catch (error) {
        console.error("Erro ao buscar tipos de resíduos:", error);
        setTiposResiduos(ITENS_PADRAO);
      } finally {
        setCarregando(false);
      }
    };
    buscarTiposResiduos();
  }, []);

  // 2. Funções para Alterar a Quantidade Selecionada
  const alterarQuantidade = (id, mudanca) => {
    setQuantidades((prev) => {
      const atual = prev[id] || 0;
      const nova = Math.max(0, atual + mudanca); // Impede números negativos
      return { ...prev, [id]: nova };
    });
  };

  // 3. Filtra apenas os itens que o usuário escolheu pelo menos 1 unidade
  const itensSelecionados = tiposResiduos
    .filter((item) => quantidades[item.id] > 0)
    .map((item) => ({
      ...item,
      quantidade: quantidades[item.id],
    }));

  // 4. Calcula o total geral usando o 'pontuacaoBase' do Java
  const totalPontosGeral = itensSelecionados.reduce((acc, item) => {
    const pontosUnitarios = item.pontuacaoBase || 0;
    return acc + pontosUnitarios * item.quantidade;
  }, 0);

  const handleFinalizar = () => {
    if (itensSelecionados.length === 0) {
      alert("Por favor, selecione ao menos um item para entregar.");
      return;
    }
    onConfirm(itensSelecionados, totalPontosGeral);
  };

  if (carregando) {
    return <div style={{ padding: 32, color: COLORS.textSec }}>Carregando itens de descarte...</div>;
  }

  return (
    <div style={{ display: "flex", gap: 32, maxWidth: 1100, position: "relative" }}>

      {/* SEÇÃO DA ESQUERDA: LISTA DE ITENS DISPONÍVEIS */}
      <div style={{ flex: 1 }}>
        <button
          onClick={onBack}
          style={{
            background: "none", border: "none", color: COLORS.green,
            fontWeight: 600, cursor: "pointer", marginBottom: 16, fontSize: 14
          }}
        >
          ← Voltar para horários
        </button>

        <h2 style={{ fontSize: 24, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>
          Quais itens você vai entregar?
        </h2>
        <p style={{ fontSize: 14, color: COLORS.textSec, marginBottom: 24 }}>
          Selecione ao menos um item. Os pontos são calculados automaticamente.
        </p>

        {/* GRID DOS CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {tiposResiduos.map((item) => {
            const qtd = quantidades[item.id] || 0;
            const pontosUnitarios = item.pontuacaoBase || 0;

            return (
              <div
                key={item.id}
                style={{
                  background: "#ffffff",
                  border: `1px solid ${qtd > 0 ? COLORS.green : "#e5e7eb"}`,
                  borderRadius: 16,
                  padding: "16px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: qtd > 0 ? "0 4px 12px rgba(46,125,50,0.06)" : "none",
                  transition: "all 0.2s"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontSize: 10, background: "#f3f4f6", padding: "2px 6px",
                      borderRadius: 6, fontWeight: 700, color: "#6b7280"
                    }}>
                      {item.sigla || "RES"}
                    </span>
                    <strong style={{ fontSize: 15, color: COLORS.text }}>{item.nome}</strong>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#e67e22" }}>
                    +{pontosUnitarios} pts
                  </span>
                </div>

                {/* CONTROLES ADICIONAR / REMOVER */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {qtd > 0 && (
                    <button
                      onClick={() => alterarQuantidade(item.id, -1)}
                      style={{
                        width: 28, height: 28, borderRadius: "50%", border: "1px solid #d1d5db",
                        background: "#fff", cursor: "pointer", fontWeight: "bold"
                      }}
                    >
                      -
                    </button>
                  )}
                  {qtd > 0 && <span style={{ fontWeight: 700, fontSize: 16, color: COLORS.text }}>{qtd}</span>}
                  <button
                    onClick={() => alterarQuantidade(item.id, 1)}
                    style={{
                      width: 28, height: 28, borderRadius: "50%",
                      border: `1px solid ${COLORS.green}`,
                      background: qtd > 0 ? COLORS.green : "#fff",
                      color: qtd > 0 ? "#fff" : COLORS.green,
                      cursor: "pointer", fontWeight: "bold"
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SEÇÃO DA DIREITA: BOX DE RESUMO DE PONTUAÇÃO */}
      <div style={{
        width: 320, background: "#ffffff", borderRadius: 20, padding: 24,
        border: "1px solid #e5e7eb", height: "fit-content", boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
        position: "sticky", top: 24
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, marginTop: 0, marginBottom: 16 }}>
          Resumo
        </h3>

        {itensSelecionados.length === 0 ? (
          <p style={{ color: COLORS.textSec, fontSize: 14, textAlign: "center", padding: "32px 0" }}>
            Selecione ao menos um item
          </p>
        ) : (
          <div>
            <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 16, paddingRight: 4 }}>
              {itensSelecionados.map((item) => (
                <div
                  key={item.id}
                  style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 10, color: COLORS.text }}
                >
                  <span>{item.quantidade}x {item.nome}</span>
                  <span style={{ fontWeight: 600 }}>
                    +{(item.pontuacaoBase || 0) * item.quantidade} pts
                  </span>
                </div>
              ))}
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", marginBottom: 16 }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <span style={{ fontWeight: 600, color: COLORS.text }}>Total acumulado:</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: COLORS.green }}>
                {totalPontosGeral} pts
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleFinalizar}
          disabled={itensSelecionados.length === 0}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 12,
            border: "none",
            background: itensSelecionados.length === 0 ? "#e5e7eb" : COLORS.green,
            color: itensSelecionados.length === 0 ? "#9ca3af" : "#ffffff",
            fontWeight: 700,
            fontSize: 15,
            cursor: itensSelecionados.length === 0 ? "not-allowed" : "pointer",
            transition: "background 0.2s"
          }}
        >
          Confirmar Agendamento
        </button>
      </div>

    </div>
  );
}