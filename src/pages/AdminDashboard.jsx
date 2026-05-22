import { Box, Typography, Button } from "@mui/material";
import {
  Users,
  Megaphone,
  BarChart3,
  Recycle,
  FileText,
  LogOut,
} from "lucide-react";

export default function AdminDashboard({ onLogout }) {
  const cards = [
    { title: "Usuários cadastrados", value: "128", icon: Users },
    { title: "Campanhas ativas", value: "3", icon: Megaphone },
    { title: "Resíduos coletados", value: "245 kg", icon: Recycle },
    { title: "Relatórios gerados", value: "12", icon: FileText },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage:
          'linear-gradient(rgba(0, 20, 10, 0.72), rgba(0, 0, 0, 0.86)), url("/admin-home-bg.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#fff",
        padding: "36px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <Box
        sx={{
          maxWidth: 1180,
          margin: "0 auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "36px",
          }}
        >
          <Box>
            <Typography
              variant="h3"
              sx={{ fontWeight: 800, fontSize: "2rem", marginBottom: "6px" }}
            >
              Painel Administrativo
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.72)" }}>
              Gerencie campanhas, usuários e relatórios do E-Waster.
            </Typography>
          </Box>

          <Button
            onClick={onLogout}
            startIcon={<LogOut size={18} />}
            sx={{
              color: "#A5D6A7",
              border: "1px solid rgba(165,214,167,0.35)",
              borderRadius: "12px",
              padding: "10px 16px",
              textTransform: "none",
              fontWeight: 700,
              "&:hover": {
                background: "rgba(165,214,167,0.08)",
              },
            }}
          >
            Sair
          </Button>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "18px",
            marginBottom: "28px",
          }}
        >
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <Box
                key={card.title}
                sx={{
                  background: "rgba(0, 0, 0, 0.46)",
                  border: "1px solid rgba(76,175,80,0.32)",
                  borderRadius: "20px",
                  padding: "24px",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
                }}
              >
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: "14px",
                    background: "rgba(76,175,80,0.16)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "18px",
                  }}
                >
                  <Icon size={24} color="#66BB6A" />
                </Box>

                <Typography sx={{ color: "rgba(255,255,255,0.68)", fontSize: "0.86rem" }}>
                  {card.title}
                </Typography>
                <Typography sx={{ fontSize: "1.9rem", fontWeight: 800 }}>
                  {card.value}
                </Typography>
              </Box>
            );
          })}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: "20px",
          }}
        >
          <Box
            sx={{
              background: "rgba(0, 0, 0, 0.48)",
              border: "1px solid rgba(76,175,80,0.28)",
              borderRadius: "22px",
              padding: "28px",
              backdropFilter: "blur(12px)",
            }}
          >
            <Typography sx={{ fontWeight: 800, fontSize: "1.2rem", marginBottom: "18px" }}>
              Ações administrativas
            </Typography>

            <Box sx={{ display: "grid", gap: "14px" }}>
              {[
                "Gerenciar campanhas ambientais",
                "Visualizar usuários cadastrados",
                "Consultar relatórios de participação",
                "Analisar resíduos coletados por tipo",
              ].map((item) => (
                <Button
                  key={item}
                  variant="outlined"
                  startIcon={<BarChart3 size={18} />}
                  sx={{
                    justifyContent: "flex-start",
                    color: "#fff",
                    borderColor: "rgba(165,214,167,0.28)",
                    borderRadius: "12px",
                    textTransform: "none",
                    padding: "12px 14px",
                    "&:hover": {
                      borderColor: "#66BB6A",
                      background: "rgba(76,175,80,0.10)",
                    },
                  }}
                >
                  {item}
                </Button>
              ))}
            </Box>
          </Box>

          <Box
            sx={{
              background: "rgba(0, 0, 0, 0.48)",
              border: "1px solid rgba(76,175,80,0.28)",
              borderRadius: "22px",
              padding: "28px",
              backdropFilter: "blur(12px)",
            }}
          >
            <Typography sx={{ fontWeight: 800, fontSize: "1.2rem", marginBottom: "16px" }}>
              Campanha ativa
            </Typography>

            <Typography sx={{ color: "#A5D6A7", fontWeight: 700, marginBottom: "8px" }}>
              Semana do Descarte Consciente
            </Typography>

            <Typography sx={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.7, marginBottom: "20px" }}>
              Campanha destinada ao recolhimento de celulares, notebooks, pilhas,
              cabos e outros resíduos eletrônicos.
            </Typography>

            <Box
              sx={{
                height: 10,
                background: "rgba(255,255,255,0.14)",
                borderRadius: 20,
                overflow: "hidden",
                marginBottom: "8px",
              }}
            >
              <Box sx={{ width: "68%", height: "100%", background: "#66BB6A" }} />
            </Box>

            <Typography sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
              68% da meta de coleta atingida
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}