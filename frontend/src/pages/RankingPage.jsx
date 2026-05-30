import PageHeader from "../components/PageHeader";
import { COLORS } from "../styles/colors";

function RankingPage({ usuario }) {
  const ranking = [
    { nome: "Maria Oliveira", pontos: 850 },
    { nome: "João Silva", pontos: 720 },
    { nome: "Carlos Souza", pontos: 610 },
    { nome: usuario, pontos: 250 },
    { nome: "Ana Costa", pontos: 180 },
  ].sort((a, b) => b.pontos - a.pontos);

  return (
    <div
      style={{
        minHeight: "calc(100vh - 72px)",
        padding: "32px",
        borderRadius: 24,
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.70), rgba(255,255,255,0.82)), url("/image1.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <PageHeader
        title="Ranking de Pontuação"
        subtitle="Acompanhe os usuários com maior pontuação confirmada."
        subtitleColor="#1f2937"
      />

      <div style={{ display: "grid", gap: 12, maxWidth: 720 }}>
        {ranking.map((item, index) => (
          <div
            key={item.nome}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: item.nome === usuario ? COLORS.greenBg : COLORS.white,
              border: `1px solid ${item.nome === usuario ? COLORS.green : COLORS.grayBorder}`,
              borderRadius: 14,
              padding: "18px 22px",
            }}
          >
            <div>
              <div style={{ fontSize: 14, color: COLORS.textSec }}>
                #{index + 1}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>
                {item.nome}
              </div>
            </div>

            <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.green }}>
              {item.pontos} pts
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RankingPage;
