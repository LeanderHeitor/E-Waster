import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import { COLORS } from "../styles/colors";

// Recebe o token e o usuário diretamente via props do App.jsx
function RankingPage({ usuario, token }) {
  const [ranking, setRanking] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // Extrai o nome do usuário logado de forma segura para fazer o destaque visual
  const nomeUsuarioLogado = typeof usuario === "object" ? (usuario?.nome || usuario?.username) : usuario;

  useEffect(() => {
    const carregarRanking = async () => {
      try {
        // Se por algum motivo o token não estiver pronto, aborta para evitar 403 temporário
        if (!token) {
          console.warn("Aguardando token para carregar o ranking...");
          return;
        }

        const response = await fetch("http://localhost:8081/api/v1/usuarios/ranking", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Injetando o token centralizado correto
          }
        });

        if (response.ok) {
          const dados = await response.json();

          // CORREÇÃO: Ordenação baseada no campo real do Java (pontuacaoTotal)
          const ordenados = dados.sort((a, b) => {
            const ptsA = a.pontuacaoTotal || 0;
            const ptsB = b.pontuacaoTotal || 0;
            return ptsB - ptsA;
          });

          setRanking(ordenados);
        } else {
          throw new Error("Não foi possível carregar o ranking global.");
        }
      } catch (err) {
        setErro(err.message || "Erro de conexão com o servidor.");
      } finally {
        setCarregando(false);
      }
    };

    carregarRanking();
  }, [token]); // Monitora o token para disparar o fetch assim que ele estiver disponível

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

      {carregando && (
        <div style={{ fontSize: 14, color: COLORS.textSec, padding: "16px 0" }}>
          Carregando posições do pódio...
        </div>
      )}

      {erro && (
        <div style={{ fontSize: 14, color: "#c0392b", padding: "16px 0", fontWeight: 500 }}>
          ⚠️ {erro}
        </div>
      )}

      {!carregando && !erro && (
        <div style={{ display: "grid", gap: 12, maxWidth: 720 }}>
          {ranking.map((item, index) => {
            const nomeItem = item.nome || item.username || "Usuário Anônimo";

            // CORREÇÃO: Lendo o atributo mapeado na sua Entity do Spring Boot
            const pontosItem = item.pontuacaoTotal || 0;

            // Verifica se a linha atual pertence ao usuário que está navegando no app
            const ehUsuarioLogado = nomeItem === nomeUsuarioLogado;

            return (
              <div
                key={nomeItem + index} // Evita colisão de chaves caso haja nomes iguais
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: ehUsuarioLogado ? COLORS.greenBg : COLORS.white,
                  border: `1px solid ${ehUsuarioLogado ? COLORS.green : COLORS.grayBorder}`,
                  borderRadius: 14,
                  padding: "18px 22px",
                  boxShadow: ehUsuarioLogado ? "0 4px 12px rgba(46,125,50,0.1)" : "none",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: ehUsuarioLogado ? COLORS.green : COLORS.textSec, marginBottom: 2 }}>
                    {index + 1 === 1 ? "🥇 1º Lugar" : index + 1 === 2 ? "🥈 2º Lugar" : index + 1 === 3 ? "🥉 3º Lugar" : `#${index + 1}`}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>
                    {nomeItem} {ehUsuarioLogado && " (Você)"}
                  </div>
                </div>

                <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.green }}>
                  {pontosItem} pts
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RankingPage;