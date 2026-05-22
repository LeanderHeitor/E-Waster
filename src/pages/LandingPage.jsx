import { Button, Typography, Box } from "@mui/material";
import { Recycle, User, UserPlus, Shield } from "lucide-react";

export default function LandingPage({ onLogin, onCadastro, onAdmin }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      >
        <source src="/landing-video.mp4" type="video/mp4" />
      </video>

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(13, 54, 23, 0.78), rgba(0, 0, 0, 0.62))",
          zIndex: 1,
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 500,
          padding: "38px",
          borderRadius: "24px",
          background: "rgba(0, 0, 0, 0.68)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.16)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "18px",
            background: "rgba(76, 175, 80, 0.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 22px",
          }}
        >
          <Recycle size={34} color="#A5D6A7" />
        </Box>

        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            fontSize: "2.2rem",
            marginBottom: "10px",
            letterSpacing: "-0.5px",
          }}
        >
          Bem-vindo ao E-Waster
        </Typography>

        <Typography
          sx={{
            color: "rgba(255,255,255,0.78)",
            fontSize: "1rem",
            lineHeight: 1.7,
            marginBottom: "32px",
          }}
        >
          Uma plataforma para incentivar o descarte correto de lixo eletrônico,
          com agendamento de coletas, pontuação, ranking e campanhas ambientais.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Button
            onClick={onLogin}
            variant="contained"
            startIcon={<User size={18} />}
            sx={{
              background: "linear-gradient(135deg, #2E7D32, #43A047)",
              textTransform: "none",
              fontWeight: 700,
              paddingY: "12px",
              borderRadius: "12px",
              "&:hover": {
                background: "linear-gradient(135deg, #27632A, #2E7D32)",
              },
            }}
          >
            Já tenho uma conta
          </Button>

          <Button
            onClick={onCadastro}
            variant="outlined"
            startIcon={<UserPlus size={18} />}
            sx={{
              color: "#fff",
              borderColor: "rgba(255,255,255,0.35)",
              textTransform: "none",
              fontWeight: 700,
              paddingY: "12px",
              borderRadius: "12px",
              "&:hover": {
                borderColor: "#A5D6A7",
                background: "rgba(255,255,255,0.08)",
              },
            }}
          >
            Criar conta
          </Button>

          <Button
            onClick={onAdmin}
            variant="text"
            startIcon={<Shield size={18} />}
            sx={{
              color: "#A5D6A7",
              textTransform: "none",
              fontWeight: 700,
              paddingY: "10px",
              borderRadius: "12px",
              "&:hover": {
                background: "rgba(165, 214, 167, 0.10)",
              },
            }}
          >
            Área do administrador
          </Button>
        </Box>
      </Box>
    </Box>
  );
}