import { useState, useEffect, useCallback } from "react";
import { Box, Typography, Button } from "@mui/material";
import {
  Users,
  Megaphone,
  Recycle,
  LogOut,
  CheckCircle,
  XCircle,
  ArrowLeft,
  CalendarPlus,
} from "lucide-react";

const API = "http://localhost:8080/api/v1";

export default function AdminDashboard({ token, onLogout }) {
  const [adminView, setAdminView] = useState("overview");
  const [usuarioSelecionadoId, setUsuarioSelecionadoId] = useState(null);

  const [usuarios, setUsuarios] = useState([]);
  const [pendentes, setPendentes] = useState([]); // agendamentos PENDENTE (todos os usuários)
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // Estado da tela de criação de horários (vagas de coleta).
  const [slots, setSlots] = useState([]);
  const [novoSlot, setNovoSlot] = useState({
    data: "",
    horarioInicio: "",
    horarioFim: "",
    capacidadeMaxima: 5,
  });
  const [slotMsg, setSlotMsg] = useState(null); // { tipo: "ok" | "erro", texto }
  const [salvandoSlot, setSalvandoSlot] = useState(false);

  // Busca usuários + agendamentos pendentes reais do backend (rotas ADMIN).
  const carregar = useCallback(async () => {
    if (!token) return;
    setCarregando(true);
    setErro("");
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    try {
      const [resUsuarios, resPendentes] = await Promise.all([
        fetch(`${API}/usuarios`, { headers }),
        fetch(`${API}/agendamentos/pendentes`, { headers }),
      ]);

      if (!resUsuarios.ok) throw new Error("Falha ao carregar usuários (" + resUsuarios.status + ").");
      if (!resPendentes.ok) throw new Error("Falha ao carregar pendentes (" + resPendentes.status + ").");

      setUsuarios(await resUsuarios.json());
      setPendentes(await resPendentes.json());
    } catch (e) {
      setErro(e.message || "Erro ao falar com o servidor.");
    } finally {
      setCarregando(false);
    }
  }, [token]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Lista os horários existentes (mesmo endpoint que o usuário comum consome).
  const carregarSlots = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/slots`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setSlots(await res.json());
    } catch {
      // a tela de criação continua utilizável mesmo sem a lista
    }
  }, [token]);

  // Carrega os horários ao abrir a tela de criação.
  useEffect(() => {
    if (adminView === "horarios") carregarSlots();
  }, [adminView, carregarSlots]);

  // Lista de usuários comuns (não mostra a conta admin).
  const usuariosComuns = usuarios.filter((u) => u.tipo !== "ADMIN");
  const pendentesDoUsuario = (id) => pendentes.filter((p) => p.usuario?.id === id);
  const usuarioSelecionado = usuarios.find((u) => u.id === usuarioSelecionadoId) || null;
  const totalPontosDistribuidos = usuarios.reduce((s, u) => s + (u.pontuacaoTotal || 0), 0);

  const aprovar = async (agendamentoId) => {
    try {
      const res = await fetch(`${API}/descartes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ agendamentoId }),
      });
      if (!res.ok) throw new Error(await res.text());
      await carregar();
    } catch (e) {
      alert("Erro ao aprovar: " + e.message);
    }
  };

  const recusar = async (agendamentoId) => {
    try {
      const res = await fetch(`${API}/agendamentos/${agendamentoId}/recusar`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      await carregar();
    } catch (e) {
      alert("Erro ao recusar: " + e.message);
    }
  };

  // Cria um novo horário de coleta. As validações pesadas (conflito, data passada)
  // são feitas no backend; aqui só evitamos requisições obviamente inválidas.
  const criarSlot = async (e) => {
    e.preventDefault();
    setSlotMsg(null);

    if (!novoSlot.data || !novoSlot.horarioInicio || !novoSlot.horarioFim) {
      setSlotMsg({ tipo: "erro", texto: "Preencha data, início e fim." });
      return;
    }
    if (novoSlot.horarioFim <= novoSlot.horarioInicio) {
      setSlotMsg({ tipo: "erro", texto: "O horário de fim deve ser maior que o de início." });
      return;
    }

    setSalvandoSlot(true);
    try {
      const res = await fetch(`${API}/slots`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          data: novoSlot.data,
          horarioInicio: novoSlot.horarioInicio,
          horarioFim: novoSlot.horarioFim,
          capacidadeMaxima: Number(novoSlot.capacidadeMaxima),
        }),
      });
      if (!res.ok) throw new Error(await res.text());

      setSlotMsg({ tipo: "ok", texto: "Horário criado com sucesso." });
      setNovoSlot({ data: "", horarioInicio: "", horarioFim: "", capacidadeMaxima: 5 });
      await carregarSlots();
    } catch (err) {
      setSlotMsg({ tipo: "erro", texto: err.message || "Erro ao criar horário." });
    } finally {
      setSalvandoSlot(false);
    }
  };

  // Corta os segundos de "08:00:00" -> "08:00".
  const formatarHora = (h) => (h ? String(h).substring(0, 5) : "");

  const cards = [
    { title: "Usuários cadastrados", value: usuariosComuns.length, icon: Users },
    { title: "Agendamentos pendentes", value: pendentes.length, icon: Megaphone },
    { title: "Pontos distribuídos", value: totalPontosDistribuidos, icon: Recycle },
  ];

  const cardStyle = {
    background: "rgba(0, 0, 0, 0.48)",
    border: "1px solid rgba(76,175,80,0.28)",
    borderRadius: "22px",
    padding: "28px",
    backdropFilter: "blur(12px)",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid rgba(165,214,167,0.35)",
    background: "rgba(255,255,255,0.92)",
    color: "#14241a",
    fontSize: "0.95rem",
    boxSizing: "border-box",
  };

  const labelStyle = {
    color: "rgba(255,255,255,0.7)",
    fontSize: "0.8rem",
    marginBottom: "6px",
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
              Valide os agendamentos e acompanhe a pontuação dos usuários do E-Waster.
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

        {erro && (
          <Box sx={{ ...cardStyle, borderColor: "rgba(239,154,154,0.5)", marginBottom: "20px" }}>
            <Typography sx={{ color: "#EF9A9A", fontWeight: 600 }}>⚠️ {erro}</Typography>
          </Box>
        )}

        {carregando && (
          <Typography sx={{ color: "rgba(255,255,255,0.72)", marginBottom: "20px" }}>
            Carregando dados do servidor...
          </Typography>
        )}

        {adminView === "overview" && (
          <>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px", marginBottom: "28px" }}>
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

            <Box sx={cardStyle}>
              <Typography sx={{ fontWeight: 800, fontSize: "1.2rem", marginBottom: "18px" }}>
                Ações administrativas
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
                  Visualizar usuários e validar agendamentos
                </Button>

                <Button
                  onClick={() => setAdminView("horarios")}
                  variant="outlined"
                  startIcon={<CalendarPlus size={18} />}
                  sx={{
                    justifyContent: "flex-start",
                    color: "#fff",
                    borderColor: "rgba(165,214,167,0.28)",
                    borderRadius: "12px",
                    textTransform: "none",
                    padding: "12px 14px",
                  }}
                >
                  Criar horário de coleta (vagas)
                </Button>
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

            {usuariosComuns.length === 0 && !carregando ? (
              <Typography sx={{ color: "rgba(255,255,255,0.72)" }}>
                Nenhum usuário cadastrado ainda.
              </Typography>
            ) : (
              <Box sx={{ display: "grid", gap: "12px" }}>
                {usuariosComuns.map((user) => (
                  <Button
                    key={user.id}
                    onClick={() => setUsuarioSelecionadoId(user.id)}
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
                    <span>{pendentesDoUsuario(user.id).length} pendência(s)</span>
                  </Button>
                ))}
              </Box>
            )}
          </Box>
        )}

        {adminView === "usuarios" && usuarioSelecionado && (
          <Box sx={cardStyle}>
            <Button
              onClick={() => setUsuarioSelecionadoId(null)}
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
              {usuarioSelecionado.pontuacaoTotal || 0} pontos confirmados
            </Typography>

            <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: "14px" }}>
              Agendamentos pendentes de validação
            </Typography>

            {pendentesDoUsuario(usuarioSelecionado.id).length === 0 ? (
              <Typography sx={{ color: "rgba(255,255,255,0.72)" }}>
                Este usuário não possui agendamentos pendentes.
              </Typography>
            ) : (
              <Box sx={{ display: "grid", gap: "12px" }}>
                {pendentesDoUsuario(usuarioSelecionado.id).map((p) => (
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
                      <Typography sx={{ fontWeight: 700 }}>
                        {p.itens.map((i) => `${i.tipoResiduo} (x${i.quantidade})`).join(", ") || "Sem itens"}
                      </Typography>
                      <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.85rem" }}>
                        Data: {p.data} • {p.totalPts} pontos estimados
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: "10px" }}>
                      <Button
                        onClick={() => aprovar(p.id)}
                        startIcon={<CheckCircle size={16} />}
                        sx={{ color: "#A5D6A7", textTransform: "none" }}
                      >
                        Aprovar
                      </Button>
                      <Button
                        onClick={() => recusar(p.id)}
                        startIcon={<XCircle size={16} />}
                        sx={{ color: "#EF9A9A", textTransform: "none" }}
                      >
                        Recusar
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}

        {adminView === "horarios" && (
          <Box sx={cardStyle}>
            <Button
              onClick={() => {
                setAdminView("overview");
                setSlotMsg(null);
              }}
              startIcon={<ArrowLeft size={18} />}
              sx={{ color: "#A5D6A7", textTransform: "none", marginBottom: "20px" }}
            >
              Voltar ao painel
            </Button>

            <Typography sx={{ fontWeight: 800, fontSize: "1.4rem", marginBottom: "6px" }}>
              Criar horário de coleta
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.68)", marginBottom: "22px" }}>
              Defina uma nova janela de coleta. O sistema bloqueia datas passadas e horários
              que se sobreponham a um já existente na mesma data.
            </Typography>

            <Box
              component="form"
              onSubmit={criarSlot}
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "14px",
                alignItems: "end",
                marginBottom: "16px",
              }}
            >
              <Box>
                <Typography sx={labelStyle}>Data</Typography>
                <input
                  type="date"
                  value={novoSlot.data}
                  onChange={(e) => setNovoSlot({ ...novoSlot, data: e.target.value })}
                  style={inputStyle}
                />
              </Box>
              <Box>
                <Typography sx={labelStyle}>Início</Typography>
                <input
                  type="time"
                  value={novoSlot.horarioInicio}
                  onChange={(e) => setNovoSlot({ ...novoSlot, horarioInicio: e.target.value })}
                  style={inputStyle}
                />
              </Box>
              <Box>
                <Typography sx={labelStyle}>Fim</Typography>
                <input
                  type="time"
                  value={novoSlot.horarioFim}
                  onChange={(e) => setNovoSlot({ ...novoSlot, horarioFim: e.target.value })}
                  style={inputStyle}
                />
              </Box>
              <Box>
                <Typography sx={labelStyle}>Capacidade</Typography>
                <input
                  type="number"
                  min={1}
                  value={novoSlot.capacidadeMaxima}
                  onChange={(e) => setNovoSlot({ ...novoSlot, capacidadeMaxima: e.target.value })}
                  style={inputStyle}
                />
              </Box>
              <Button
                type="submit"
                disabled={salvandoSlot}
                startIcon={<CalendarPlus size={18} />}
                sx={{
                  background: "#2e7d32",
                  color: "#fff",
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 700,
                  padding: "10px 16px",
                  height: "44px",
                  "&:hover": { background: "#1b5e20" },
                  "&.Mui-disabled": { background: "rgba(46,125,50,0.5)", color: "rgba(255,255,255,0.6)" },
                }}
              >
                {salvandoSlot ? "Criando..." : "Criar"}
              </Button>
            </Box>

            {slotMsg && (
              <Typography
                sx={{
                  color: slotMsg.tipo === "ok" ? "#A5D6A7" : "#EF9A9A",
                  fontWeight: 600,
                  marginBottom: "20px",
                }}
              >
                {slotMsg.tipo === "ok" ? "✅ " : "⚠️ "}
                {slotMsg.texto}
              </Typography>
            )}

            <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", marginTop: "10px", marginBottom: "14px" }}>
              Horários cadastrados
            </Typography>

            {slots.length === 0 ? (
              <Typography sx={{ color: "rgba(255,255,255,0.72)" }}>
                Nenhum horário cadastrado ainda.
              </Typography>
            ) : (
              <Box sx={{ display: "grid", gap: "10px" }}>
                {slots.map((s) => (
                  <Box
                    key={s.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(165,214,167,0.20)",
                      borderRadius: "12px",
                      padding: "12px 16px",
                    }}
                  >
                    <Typography sx={{ fontWeight: 700 }}>
                      📅 {s.data} • {formatarHora(s.horarioInicio)} às {formatarHora(s.horarioFim)}
                    </Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.88rem" }}>
                      {s.vagasDisponiveis}/{s.capacidadeMaxima} vagas
                    </Typography>
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
