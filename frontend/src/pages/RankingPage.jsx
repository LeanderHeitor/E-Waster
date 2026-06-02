import PageHeader from "../components/PageHeader";
import { COLORS } from "../styles/colors";

function RankingPage({ usuario }) {
  const nomeUsuario =
    typeof usuario === "string"
      ? usuario
      : usuario?.nome || "Usuário";

  const ranking = [
    {
      nome: nomeUsuario,
      pontos: 0,
      atual: true,
    },
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

      <div
        style={{
          background: COLORS.white,
          border: `1px solid ${COLORS.grayBorder}`,
          borderRadius: 14,
          padding: "16px 20px",
          maxWidth: 720,
          marginBottom: 16,
          color: COLORS.textSec,
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        O ranking considera apenas pontuações confirmadas após validação dos
        agendamentos. Usuários novos começam com 0 pontos.
      </div>

      <div style={{ display: "grid", gap: 12, maxWidth: 720 }}>
        {ranking.map((item, index) => (
          <div
            key={item.nome}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: item.atual ? COLORS.greenBg : COLORS.white,
              border: `1px solid ${
                item.atual ? COLORS.green : COLORS.grayBorder
              }`,
              borderRadius: 14,
              padding: "18px 22px",
            }}
          >
            <div>
              <div style={{ fontSize: 14, color: COLORS.textSec }}>
                #{index + 1}
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: COLORS.text,
                }}
              >
                {item.nome}
              </div>
              {item.atual && (
                <div
                  style={{
                    fontSize: 12,
                    color: COLORS.green,
                    fontWeight: 600,
                    marginTop: 4,
                  }}
                >
                  Você
                </div>
              )}
            </div>

            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: COLORS.green,
              }}
            >
              {item.pontos} pts
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RankingPage;
