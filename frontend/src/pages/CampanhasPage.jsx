import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { COLORS } from "../styles/colors";

function CampanhasPage({ token }) {
  const [campanhas, setCampanhas] = useState([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarCampanhas() {
      try {
        const res = await fetch("http://localhost:8081/api/v1/campanhas", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Não foi possível carregar as campanhas.");

        const data = await res.json();
        setCampanhas(data);
      } catch (e) {
        setErro(e.message || "Erro ao carregar campanhas.");
      } finally {
        setCarregando(false);
      }
    }

    if (token) carregarCampanhas();
  }, [token]);

  const campanhasAtivas = campanhas.filter((c) => c.ativa);
  const campanhasInativas = campanhas.filter((c) => !c.ativa);

  const formatarData = (data) => {
    if (!data) return "Data indisponível";
    return data.split("-").reverse().join("/");
  };

  const renderCampanha = (campanha) => (
    <div
      key={campanha.id}
      style={{
        background: COLORS.white,
        border: `1px solid ${COLORS.grayBorder}`,
        borderRadius: 14,
        padding: "18px 22px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>
          {campanha.nome}
        </div>
        <div style={{ fontSize: 13, color: COLORS.textSec, marginTop: 4 }}>
          {formatarData(campanha.dataInicio)} até {formatarData(campanha.dataFim)}
        </div>
      </div>

      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: campanha.ativa ? COLORS.green : COLORS.orange,
          background: campanha.ativa ? COLORS.greenBg : COLORS.orangeLight,
          padding: "6px 12px",
          borderRadius: 20,
          whiteSpace: "nowrap",
        }}
      >
        {campanha.ativa ? "ATIVA" : "INATIVA"}
      </div>
    </div>
  );

  return (
    <div
      style={{
        minHeight: "calc(100vh - 72px)",
        padding: "32px",
        borderRadius: 24,
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.65), rgba(255,255,255,0.82)), url("/image7.webp")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <PageHeader
        title="Campanhas Ambientais"
        subtitle="Acompanhe as campanhas de descarte eletrônico disponíveis no sistema."
        subtitleColor="#1f2937"
      />

      {carregando && (
        <div style={{ color: COLORS.textSec, fontSize: 14 }}>
          Carregando campanhas...
        </div>
      )}

      {erro && (
        <div style={{ color: "#D32F2F", fontSize: 14, marginBottom: 16 }}>
          {erro}
        </div>
      )}

      {!carregando && !erro && (
        <div style={{ display: "grid", gap: 24, maxWidth: 780 }}>
          <section>
            <h2 style={{ fontSize: 18, color: COLORS.text, marginBottom: 12 }}>
              Campanhas ativas
            </h2>

            <div style={{ display: "grid", gap: 12 }}>
              {campanhasAtivas.length === 0 ? (
                <div
                  style={{
                    background: COLORS.white,
                    border: `1px solid ${COLORS.grayBorder}`,
                    borderRadius: 14,
                    padding: "18px 22px",
                    color: COLORS.textSec,
                    fontSize: 14,
                  }}
                >
                  Nenhuma campanha ativa no momento.
                </div>
              ) : (
                campanhasAtivas.map(renderCampanha)
              )}
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 18, color: COLORS.text, marginBottom: 12 }}>
              Outras campanhas
            </h2>

            <div style={{ display: "grid", gap: 12 }}>
              {campanhasInativas.length === 0 ? (
                <div
                  style={{
                    background: COLORS.white,
                    border: `1px solid ${COLORS.grayBorder}`,
                    borderRadius: 14,
                    padding: "18px 22px",
                    color: COLORS.textSec,
                    fontSize: 14,
                  }}
                >
                  Nenhuma campanha futura ou encerrada cadastrada.
                </div>
              ) : (
                campanhasInativas.map(renderCampanha)
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default CampanhasPage;