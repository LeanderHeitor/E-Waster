import { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import {
  Users,
  Megaphone,
  BarChart3,
  Recycle,
  FileText,
  LogOut,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";

export default function AdminDashboard({ onLogout }) {
  const [adminView, setAdminView] = useState("overview");
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);

  const usuariosMock = [
    {
      id: 1,
      nome: "Maria Oliveira",
      email: "maria@email.com",
      pontos: 850,
      pendentes: [
        { id: 1, item: "Notebook/Laptop", data: "24/05", pontos: 25, status: "Pendente" },
        { id: 2, item: "Pilhas e Baterias", data: "26/05", pontos: 5, status: "Pendente" },
      ],
    },
    {
      id: 2,
      nome: "João Silva",
      email: "joao@email.com",
      pontos: 720,
      pendentes: [
        { id: 3, item: "Monitor/Tela", data: "25/05", pontos: 20, status: "Pendente" },
      ],
    },
    {
      id: 3,
      nome: "Ana Costa",
      email: "ana@email.com",
      pontos: 180,
      pendentes: [],
    },
  ];

  const cards = [
    { title: "Usuários cadastrados", value: "128", icon: Users },
    { title: "Campanhas ativas", value: "3", icon: Megaphone },
    { title: "Resíduos coletados", value: "245 kg", icon: Recycle },
    { title: "Relatórios gerados", value: "12", icon: FileText },
  ];

  const cardStyle = {
    background: "rgba(0, 0, 0, 0.48)",
    border: "1px solid rgba(76,175,80,0.28)",
    borderRadius: "22px",
    padding: "28px",
    backdropFilter: "blur(12px)",
  };

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
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <Box sx={{ maxWidth: 1180, margin: "0 auto" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "36px" }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800, fontSize: "2rem", marginBottom: "6px" }}>
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
            }}
          >
            Sair
          </Button>
        </Box>

        {adminView === "overview" && (
          <>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "18px", marginBottom: "28px" }}>
              {cards.map((card) => {
                const Icon = card.icon;
                return (
                  <Box key={card.title} sx={cardStyle}>
                    <Icon size={26} color="#66BB6A" />
                    <Typography sx={{ color: "rgba(255,255,255,0.68)", fontSize: "0.86rem", marginTop: "18px" }}>
                      {card.title}
                    </Typography>
                    <Typography sx={{ fontSize: "1.9rem", fontWeight: 800 }}>
                      {card.value}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "20px" }}>
              <Box sx={cardStyle}>
                <Typography sx={{ fontWeight: 800, fontSize: "1.2rem", marginBottom: "18px" }}>
                  Ações administrativas
                </Typography>

                <Box sx={{ display: "grid", gap: "14px" }}>
                  <Button
                    onClick={() => setAdminView("usuarios")}
                    variant="outlined"
                    startIcon={<Users size={18} />}
                    sx={{
                      justifyContent: "flex-start",
                      color: "#fff",
                      borderColor: "rgba(165,214,167,0.28)",
                      borderRadius: "12px",
                      textTransform: "none",
                      padding: "12px 14px",
                    }}
                  >
                    Visualizar usuários cadastrados
                  </Button>

                  {["Gerenciar campanhas ambientais", "Consultar relatórios de participação", "Analisar resíduos coletados por tipo"].map((item) => (
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
                      }}
                    >
                      {item}
                    </Button>
                  ))}
                </Box>
              </Box>

              <Box sx={cardStyle}>
                <Typography sx={{ fontWeight: 800, fontSize: "1.2rem", marginBottom: "16px" }}>
                  Campanha ativa
                </Typography>
                <Typography sx={{ color: "#A5D6A7", fontWeight: 700, marginBottom: "8px" }}>
                  Semana do Descarte Consciente
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.7 }}>
                  Campanha destinada ao recolhimento de celulares, notebooks, pilhas,
                  cabos e outros resíduos eletrônicos.
                </Typography>
              </Box>
            </Box>
          </>
        )}

        {adminView === "usuarios" && !usuarioSelecionado && (
          <Box sx={cardStyle}>
            <Button
              onClick={() => setAdminView("overview")}
              startIcon={<ArrowLeft size={18} />}
              sx={{ color: "#A5D6A7", textTransform: "none", marginBottom: "20px" }}
            >
              Voltar ao painel
            </Button>

            <Typography sx={{ fontWeight: 800, fontSize: "1.4rem", marginBottom: "18px" }}>
              Usuários cadastrados
            </Typography>

            <Box sx={{ display: "grid", gap: "12px" }}>
              {usuariosMock.map((user) => (
                <Button
                  key={user.id}
                  onClick={() => setUsuarioSelecionado(user)}
                  sx={{
                    justifyContent: "space-between",
                    color: "#fff",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(165,214,167,0.20)",
                    borderRadius: "14px",
                    padding: "16px 18px",
                    textTransform: "none",
                  }}
                >
                  <span>{user.nome} — {user.email}</span>
                  <span>{user.pendentes.length} pendência(s)</span>
                </Button>
              ))}
            </Box>
          </Box>
        )}

        {adminView === "usuarios" && usuarioSelecionado && (
          <Box sx={cardStyle}>
            <Button
              onClick={() => setUsuarioSelecionado(null)}
              startIcon={<ArrowLeft size={18} />}
              sx={{ color: "#A5D6A7", textTransform: "none", marginBottom: "20px" }}
            >
              Voltar para usuários
            </Button>

            <Typography sx={{ fontWeight: 800, fontSize: "1.4rem" }}>
              {usuarioSelecionado.nome}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.68)", marginBottom: "8px" }}>
              {usuarioSelecionado.email}
            </Typography>
            <Typography sx={{ color: "#A5D6A7", fontWeight: 700, marginBottom: "24px" }}>
              {usuarioSelecionado.pontos} pontos confirmados
            </Typography>

            <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: "14px" }}>
              Agendamentos pendentes de validação
            </Typography>

            {usuarioSelecionado.pendentes.length === 0 ? (
              <Typography sx={{ color: "rgba(255,255,255,0.72)" }}>
                Este usuário não possui agendamentos pendentes.
              </Typography>
            ) : (
              <Box sx={{ display: "grid", gap: "12px" }}>
                {usuarioSelecionado.pendentes.map((p) => (
                  <Box
                    key={p.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(165,214,167,0.20)",
                      borderRadius: "14px",
                      padding: "16px",
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>{p.item}</Typography>
                      <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.85rem" }}>
                        Data: {p.data} • {p.pontos} pontos estimados
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: "10px" }}>
                      <Button startIcon={<CheckCircle size={16} />} sx={{ color: "#A5D6A7", textTransform: "none" }}>
                        Aprovar
                      </Button>
                      <Button startIcon={<XCircle size={16} />} sx={{ color: "#EF9A9A", textTransform: "none" }}>
                        Recusar
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}