import { useState } from "react";
import { Button, TextField, Typography, Box, Link } from "@mui/material";
import { Shield, LockKeyhole, BarChart3, Users, Megaphone } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AdminLoginScreen({ onIrLogin, onIrLanding }) {
  const { login, logout } = useAuth();

  const [adminData, setAdminData] = useState({
    email: "",
    senha: "",
  });

  const [erro, setErro] = useState("");

  const handleChange = (e) => {
    setAdminData({
      ...adminData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    try {
      // Login real no backend; a role vem no campo `tipo` da resposta.
      const usuario = await login(adminData.email.trim(), adminData.senha);

      if (usuario.tipo !== "ADMIN") {
        // Conta válida, mas não é admin: derruba a sessão e barra o acesso.
        logout();
        setErro("Esta conta não tem permissão de administrador.");
        return;
      }
      // Sucesso: o App detecta usuario.tipo === "ADMIN" e renderiza o painel.
    } catch (error) {
      setErro(error.message || "Credenciais de administrador inválidas.");
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <Box
        className="w-[28%] text-white p-8 flex flex-col justify-center"
        sx={{
          background: "linear-gradient(160deg, #1B5E20 0%, #2E7D32 100%)",
        }}
      >
        <Box
          sx={{
            width: 58,
            height: 58,
            borderRadius: "18px",
            background: "rgba(255,255,255,0.14)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "22px",
          }}
        >
          <Shield size={32} color="#C8E6C9" />
        </Box>

        <Typography variant="h3" sx={{ fontWeight: 800, fontSize: "1.9rem", marginBottom: "8px" }}>
          Área Admin
        </Typography>

        <Typography sx={{ fontSize: "0.95rem", opacity: 0.85, marginBottom: "44px" }}>
          Gestão do E-Waster
        </Typography>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            fontSize: "1.35rem",
            lineHeight: 1.35,
            marginBottom: "18px",
          }}
        >
          Controle campanhas,
          <br />
          relatórios e usuários.
        </Typography>

        <Typography sx={{ fontSize: "0.88rem", opacity: 0.82, lineHeight: 1.7, marginBottom: "36px" }}>
          Acesse o painel administrativo para acompanhar engajamento, campanhas ambientais e dados consolidados de descarte eletrônico.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Users size={18} color="#A5D6A7" />
            <Typography sx={{ fontSize: "0.85rem" }}>Gerenciamento de usuários</Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Megaphone size={18} color="#A5D6A7" />
            <Typography sx={{ fontSize: "0.85rem" }}>Configuração de campanhas</Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <BarChart3 size={18} color="#A5D6A7" />
            <Typography sx={{ fontSize: "0.85rem" }}>Relatórios administrativos</Typography>
          </Box>
        </Box>
      </Box>

      <Box
        className="w-[72%] flex items-center justify-center px-16"
        sx={{
          backgroundColor: "#f7faf7",
          position: "relative",
          overflow: "hidden",

          '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,

      backgroundImage: 'url("/brick-wall.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',

      opacity: 0.22,

      filter: 'grayscale(100%) contrast(85%) brightness(108%)',

      pointerEvents: 'none',
    },
        }}
      >
        <Box
          className="w-full max-w-md"
          sx={{
            position: "relative",
            zIndex: 1,
            background: "rgba(255,255,255,0.88)",
            border: "1px solid rgba(46,125,50,0.14)",
            borderRadius: "22px",
            padding: "42px",
            boxShadow: "0 20px 70px rgba(0,0,0,0.08)",
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: "16px",
              background: "#E8F5E9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "22px",
            }}
          >
            <LockKeyhole size={28} color="#2E7D32" />
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 800, marginBottom: "8px", color: "#1f2937", fontSize: "1.8rem" }}>
            Login do administrador
          </Typography>

          <Typography sx={{ color: "#6b7280", marginBottom: "34px", fontSize: "0.95rem" }}>
            Acesse o painel de gestão do sistema.
          </Typography>

          <form onSubmit={handleSubmit}>
            <Box className="mb-5">
              <Typography sx={{ marginBottom: "8px", color: "#374151", fontSize: "0.875rem", fontWeight: 600 }}>
                E-mail administrativo
              </Typography>
              <TextField
                fullWidth
                name="email"
                type="email"
                value={adminData.email}
                onChange={handleChange}
                placeholder="admin@ewaster.com"
                required
                variant="outlined"
              />
            </Box>

            <Box className="mb-6">
              <Typography sx={{ marginBottom: "8px", color: "#374151", fontSize: "0.875rem", fontWeight: 600 }}>
                Senha
              </Typography>
              <TextField
                fullWidth
                name="senha"
                type="password"
                value={adminData.senha}
                onChange={handleChange}
                placeholder="Senha de administrador"
                required
                variant="outlined"
              />
            </Box>

            {erro && (
              <Box
                sx={{
                  background: "#FFEBEE",
                  color: "#B71C1C",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontSize: "0.85rem",
                  marginBottom: "18px",
                }}
              >
                {erro}
              </Box>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              sx={{
                background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #164b1a 0%, #27632A 100%)",
                },
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 700,
                paddingY: "12px",
                marginBottom: "18px",
                borderRadius: "12px",
              }}
            >
              Entrar como administrador
            </Button>

            <Box sx={{ textAlign: "center", fontSize: "0.875rem", color: "#6b7280" }}>
              <Link
                component="button"
                type="button"
                onClick={onIrLogin}
                sx={{ color: "#2E7D32", fontWeight: 700, textDecoration: "none", marginRight: "12px" }}
              >
                Login de usuário
              </Link>

              <Link
                component="button"
                type="button"
                onClick={onIrLanding}
                sx={{ color: "#2E7D32", fontWeight: 700, textDecoration: "none" }}
              >
                Voltar ao início
              </Link>
            </Box>

            <Box
              sx={{
                marginTop: "24px",
                padding: "12px 16px",
                backgroundColor: "#f0fdf4",
                borderRadius: "12px",
                border: "1px solid #bbf7d0",
              }}
            >
              <Typography sx={{ fontSize: "0.75rem", color: "#166534" }}>
                Conta admin teste: <span style={{ fontFamily: "monospace" }}>admin@ewaster.com / admin123</span>
              </Typography>
            </Box>
          </form>
        </Box>
      </Box>
    </div>
  );
}