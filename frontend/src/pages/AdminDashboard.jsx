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
  Home,
} from "lucide-react";

const API = "http://localhost:8081/api/v1";

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
  const desativarSlot = async (id) => {
  const confirmar = window.confirm("Tem certeza que deseja remover este horário da lista?");

  if (!confirmar) return;

  try {
    const res = await fetch(`${API}/slots/${id}/desativar`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    setSlotMsg({ tipo: "ok", texto: "Horário removido da lista com sucesso." });
    await carregarSlots();
  } catch (err) {
    setSlotMsg({
      tipo: "erro",
      texto: err.message || "Erro ao remover horário.",
    });
  }
};

  const [campanhas, setCampanhas] = useState([]);
  const [campanhaEditandoId, setCampanhaEditandoId] = useState(null);

const [novaCampanha, setNovaCampanha] = useState({
  nome: "",
  dataInicio: "",
  dataFim: "",
  multiplicador: 1.0,
  tipoResiduoId: "",
});

const [tiposResiduo, setTiposResiduo] = useState([]);

const [campanhaMsg, setCampanhaMsg] = useState(null);

const [salvandoCampanha, setSalvandoCampanha] = useState(false);

const [relatorioEngajamento, setRelatorioEngajamento] = useState(null);
const [relatorioResiduos, setRelatorioResiduos] = useState(null);

// RF15/RF16 — relatório de descartes/pontos por período.
const [periodo, setPeriodo] = useState({ inicio: "", fim: "" });
const [relatorioDescartes, setRelatorioDescartes] = useState(null);
const [carregandoDescartes, setCarregandoDescartes] = useState(false);
const [descartesMsg, setDescartesMsg] = useState(null);

const carregarCampanhas = useCallback(async () => {
  if (!token) return;

  try {
    const res = await fetch(`${API}/campanhas`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      setCampanhas(await res.json());
    }
  } catch {
    // silencioso
  }
}, [token]);

const carregarRelatorios = useCallback(async () => {
  if (!token) return;

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const [engajamentoRes, residuosRes] = await Promise.all([
      fetch(`${API}/relatorios/engajamento`, { headers }),
      fetch(`${API}/relatorios/residuos`, { headers }),
    ]);

    if (engajamentoRes.ok) {
      setRelatorioEngajamento(await engajamentoRes.json());
    }

    if (residuosRes.ok) {
      setRelatorioResiduos(await residuosRes.json());
    }
  } catch {
    // silencioso
  }
}, [token]);

// Busca o relatório agregado de descartes/pontos para o intervalo escolhido (rota ADMIN).
const gerarRelatorioDescartes = useCallback(async () => {
  if (!token) return;

  if (!periodo.inicio || !periodo.fim) {
    setDescartesMsg({ tipo: "erro", texto: "Informe a data inicial e a final." });
    return;
  }
  if (periodo.fim < periodo.inicio) {
    setDescartesMsg({ tipo: "erro", texto: "A data final não pode ser anterior à inicial." });
    return;
  }

  setCarregandoDescartes(true);
  setDescartesMsg(null);

  try {
    const params = new URLSearchParams({ inicio: periodo.inicio, fim: periodo.fim });
    const res = await fetch(`${API}/relatorios/descartes?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(await res.text());
    setRelatorioDescartes(await res.json());
  } catch (e) {
    setRelatorioDescartes(null);
    setDescartesMsg({ tipo: "erro", texto: e.message || "Erro ao gerar relatório." });
  } finally {
    setCarregandoDescartes(false);
  }
}, [token, periodo]);

const carregarTiposResiduo = useCallback(async () => {
  if (!token) return;

  try {
    const res = await fetch(`${API}/tipos-residuo`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      setTiposResiduo(await res.json());
    }
  } catch {
    // silencioso
  }
}, [token]);

useEffect(() => {
  if (adminView === "campanhas") {
    carregarCampanhas();
    carregarTiposResiduo();
  }
}, [adminView, carregarCampanhas, carregarTiposResiduo]);

useEffect(() => {
  if (adminView === "relatorios") {
    carregarRelatorios();
  }
}, [adminView, carregarRelatorios]);

const salvarCampanha = async (e) => {
  e.preventDefault();
  setCampanhaMsg(null);

  if (!novaCampanha.nome || !novaCampanha.dataInicio || !novaCampanha.dataFim) {
    setCampanhaMsg({ tipo: "erro", texto: "Preencha nome, início e fim." });
    return;
  }

  if (novaCampanha.dataFim < novaCampanha.dataInicio) {
    setCampanhaMsg({ tipo: "erro", texto: "A data de fim não pode ser anterior à data de início." });
    return;
  }

  setSalvandoCampanha(true);

  try {
    const url = campanhaEditandoId
      ? `${API}/campanhas/${campanhaEditandoId}`
      : `${API}/campanhas`;

    const metodo = campanhaEditandoId ? "PUT" : "POST";

    const res = await fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(novaCampanha),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    setCampanhaMsg({
      tipo: "ok",
      texto: campanhaEditandoId
        ? "Campanha atualizada com sucesso."
        : "Campanha criada com sucesso.",
    });

    setNovaCampanha({
  nome: "",
  dataInicio: "",
  dataFim: "",
  multiplicador: 1.0,
  tipoResiduoId: "",
});

    setCampanhaEditandoId(null);

    await carregarCampanhas();
  } catch (err) {
    setCampanhaMsg({
      tipo: "erro",
      texto: err.message || "Erro ao salvar campanha.",
    });
  } finally {
    setSalvandoCampanha(false);
  }
};

const iniciarEdicaoCampanha = (campanha) => {
  setCampanhaEditandoId(campanha.id);

  setNovaCampanha({
  nome: campanha.nome,
  dataInicio: campanha.dataInicio,
  dataFim: campanha.dataFim,
  multiplicador: campanha.multiplicador || 1.0,
  tipoResiduoId: campanha.tipoResiduoId || "",
});

  setCampanhaMsg({
    tipo: "ok",
    texto: "Editando campanha selecionada.",
  });
};
const cancelarEdicaoCampanha = () => {
  setCampanhaEditandoId(null);

  setNovaCampanha({
  nome: "",
  dataInicio: "",
  dataFim: "",
  multiplicador: 1.0,
  tipoResiduoId: "",
});

  setCampanhaMsg(null);
};
const excluirCampanha = async (id) => {
  const confirmar = window.confirm("Tem certeza que deseja excluir esta campanha?");

  if (!confirmar) return;

  try {
    const res = await fetch(`${API}/campanhas/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    setCampanhaMsg({
      tipo: "ok",
      texto: "Campanha excluída com sucesso.",
    });

    await carregarCampanhas();
  } catch (err) {
    setCampanhaMsg({
      tipo: "erro",
      texto: err.message || "Erro ao excluir campanha.",
    });
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
                <Button
  onClick={() => setAdminView("campanhas")}
  variant="outlined"
  startIcon={<Megaphone size={18} />}
  sx={{
    justifyContent: "flex-start",
    color: "#fff",
    borderColor: "rgba(165,214,167,0.28)",
    borderRadius: "12px",
    textTransform: "none",
    padding: "12px 14px",
  }}
>
  Gerenciar campanhas
</Button>
<Button
  onClick={() => setAdminView("relatorios")}
  variant="outlined"
  startIcon={<Recycle size={18} />}
  sx={{
    justifyContent: "flex-start",
    color: "#fff",
    borderColor: "rgba(165,214,167,0.28)",
    borderRadius: "12px",
    textTransform: "none",
    padding: "12px 14px",
  }}
>
  Relatórios administrativos
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
            <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
              <Button
                onClick={() => setUsuarioSelecionadoId(null)}
                startIcon={<ArrowLeft size={18} />}
                sx={{ color: "#A5D6A7", textTransform: "none" }}
              >
                Voltar para usuários
              </Button>
              <Button
                onClick={() => {
                  setUsuarioSelecionadoId(null);
                  setAdminView("overview");
                }}
                startIcon={<Home size={18} />}
                sx={{ color: "#A5D6A7", textTransform: "none" }}
              >
                Painel principal
              </Button>
            </Box>

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
                    <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
  <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.88rem" }}>
    {s.vagasDisponiveis}/{s.capacidadeMaxima} vagas
  </Typography>

  <Button
    onClick={() => desativarSlot(s.id)}
    sx={{
      color: "#EF9A9A",
      border: "1px solid rgba(239,154,154,0.45)",
      borderRadius: "10px",
      textTransform: "none",
      fontWeight: 700,
      padding: "6px 10px",
      fontSize: "0.78rem",
    }}
  >
    Remover
  </Button>
</Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      {adminView === "campanhas" && (
  <Box sx={cardStyle}>
    <Button
      onClick={() => {
        setAdminView("overview");
        setCampanhaMsg(null);
      }}
      startIcon={<ArrowLeft size={18} />}
      sx={{ color: "#A5D6A7", textTransform: "none", marginBottom: "20px" }}
    >
      Voltar ao painel
    </Button>

    <Typography sx={{ fontWeight: 800, fontSize: "1.4rem", marginBottom: "6px" }}>
      Gerenciar campanhas
    </Typography>

    <Typography sx={{ color: "rgba(255,255,255,0.68)", marginBottom: "22px" }}>
      Cadastre campanhas ambientais com período de início e fim definidos.
    </Typography>

    <Box
      component="form"
      onSubmit={salvarCampanha}
      sx={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr auto",
        gap: "14px",
        alignItems: "end",
        marginBottom: "16px",
      }}
    >
      <Box>
        <Typography sx={labelStyle}>Nome da campanha</Typography>
        <input
          type="text"
          value={novaCampanha.nome}
          onChange={(e) => setNovaCampanha({ ...novaCampanha, nome: e.target.value })}
          placeholder=""
          style={inputStyle}
        />
      </Box>

      <Box>
        <Typography sx={labelStyle}>Início</Typography>
        <input
          type="date"
          value={novaCampanha.dataInicio}
          onChange={(e) => setNovaCampanha({ ...novaCampanha, dataInicio: e.target.value })}
          style={inputStyle}
        />
      </Box>

      <Box>
        <Typography sx={labelStyle}>Fim</Typography>
        <input
          type="date"
          value={novaCampanha.dataFim}
          onChange={(e) => setNovaCampanha({ ...novaCampanha, dataFim: e.target.value })}
          style={inputStyle}
        />
      </Box>

      <Box>
  <Typography sx={labelStyle}>Multiplicador</Typography>
  <input
    type="number"
    min="1"
    step="0.1"
    value={novaCampanha.multiplicador}
    onChange={(e) =>
      setNovaCampanha({
        ...novaCampanha,
        multiplicador: Number(e.target.value),
      })
    }
    style={inputStyle}
  />
  <Box>
  <Typography sx={labelStyle}>Tipo de resíduo</Typography>
  <select
    value={novaCampanha.tipoResiduoId}
    onChange={(e) =>
      setNovaCampanha({
        ...novaCampanha,
        tipoResiduoId: e.target.value === "" ? "" : Number(e.target.value),
      })
    }
    style={inputStyle}
  >
    <option value="">Todos os resíduos</option>
    {tiposResiduo.map((tipo) => (
      <option key={tipo.id} value={tipo.id}>
        {tipo.nome}
      </option>
    ))}
  </select>

  {Number(novaCampanha.multiplicador) > 1 && (
    <Typography
      sx={{
        marginTop: "8px",
        fontSize: "0.82rem",
        color: "#A5D6A7",
        fontWeight: 600,
        lineHeight: 1.5,
      }}
    >
      {novaCampanha.tipoResiduoId === ""
        ? `💡 Todos os descartes feitos durante esta campanha receberão bônus de ${Number(
            novaCampanha.multiplicador
          ).toLocaleString("pt-BR")}x nos pontos.`
        : `💡 Descartes de "${
            tiposResiduo.find((t) => t.id === novaCampanha.tipoResiduoId)?.nome ||
            "este resíduo"
          }" receberão bônus de ${Number(
            novaCampanha.multiplicador
          ).toLocaleString("pt-BR")}x nos pontos.`}
    </Typography>
  )}
</Box>
</Box>

      <Button
        type="submit"
        disabled={salvandoCampanha}
        startIcon={<Megaphone size={18} />}
        sx={{
          background: "#2e7d32",
          color: "#fff",
          borderRadius: "12px",
          textTransform: "none",
          fontWeight: 700,
          padding: "10px 16px",
          height: "44px",
          "&:hover": { background: "#1b5e20" },
          "&.Mui-disabled": {
            background: "rgba(46,125,50,0.5)",
            color: "rgba(255,255,255,0.6)",
          },
        }}
      >
        {salvandoCampanha
  ? "Salvando..."
  : campanhaEditandoId
    ? "Salvar alterações"
    : "Criar"}
      </Button>
      {campanhaEditandoId && (
  <Button
    onClick={cancelarEdicaoCampanha}
    sx={{
      marginLeft: "12px",
      color: "#EF9A9A",
      border: "1px solid rgba(239,154,154,0.45)",
      borderRadius: "10px",
      textTransform: "none",
      fontWeight: 700,
      padding: "10px 16px",
    }}
  >
    Cancelar edição
  </Button>
)}
    </Box>

    {campanhaMsg && (
      <Typography
        sx={{
          color: campanhaMsg.tipo === "ok" ? "#A5D6A7" : "#EF9A9A",
          fontWeight: 600,
          marginBottom: "20px",
        }}
      >
        {campanhaMsg.tipo === "ok" ? "✅ " : "⚠️ "}
        {campanhaMsg.texto}
      </Typography>
    )}

    <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", marginTop: "10px", marginBottom: "14px" }}>
      Campanhas cadastradas
    </Typography>

    {campanhas.length === 0 ? (
      <Typography sx={{ color: "rgba(255,255,255,0.72)" }}>
        Nenhuma campanha cadastrada ainda.
      </Typography>
    ) : (
      <Box sx={{ display: "grid", gap: "10px" }}>
        {campanhas.map((c) => (
          <Box
  key={c.id}
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
  <Box>
    <Typography sx={{ fontWeight: 700 }}>{c.nome}</Typography>

    <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.85rem" }}>
      {c.dataInicio} até {c.dataFim}
    </Typography>

    <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.85rem" }}>
      Multiplicador: {c.multiplicador || 1}x
    </Typography>

    <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.85rem" }}>
      Tipo: {c.tipoResiduoNome || "Todos os resíduos"}
    </Typography>
  </Box>

  <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
    <Typography
      sx={{
        color: c.ativa ? "#A5D6A7" : "#EF9A9A",
        fontSize: "0.8rem",
        fontWeight: 800,
      }}
    >
      {c.ativa ? "ATIVA" : "INATIVA"}
    </Typography>

    <Button
      onClick={() => iniciarEdicaoCampanha(c)}
      sx={{
        color: "#A5D6A7",
        border: "1px solid rgba(165,214,167,0.45)",
        borderRadius: "10px",
        textTransform: "none",
        fontWeight: 700,
        padding: "6px 10px",
        fontSize: "0.78rem",
      }}
    >
      Editar
    </Button>

    <Button
      onClick={() => excluirCampanha(c.id)}
      sx={{
        color: "#EF9A9A",
        border: "1px solid rgba(239,154,154,0.45)",
        borderRadius: "10px",
        textTransform: "none",
        fontWeight: 700,
        padding: "6px 10px",
        fontSize: "0.78rem",
      }}
    >
      Excluir
    </Button>
  </Box>
</Box>
))}
      </Box>
    )}
  </Box>
)}
{adminView === "relatorios" && (
  <Box sx={cardStyle}>
    <Button
      onClick={() => setAdminView("overview")}
      startIcon={<ArrowLeft size={18} />}
      sx={{ color: "#A5D6A7", textTransform: "none", marginBottom: "20px" }}
    >
      Voltar ao painel
    </Button>

    <Typography sx={{ fontWeight: 800, fontSize: "1.4rem", marginBottom: "6px" }}>
      Relatórios administrativos
    </Typography>

    <Typography sx={{ color: "rgba(255,255,255,0.68)", marginBottom: "22px" }}>
      Acompanhe os indicadores consolidados de participação, engajamento e resíduos coletados.
    </Typography>

    {/* RF15/RF16 — Descartes e pontos por período */}
    <Box
      sx={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(165,214,167,0.20)",
        borderRadius: "16px",
        padding: "20px",
        marginBottom: "28px",
      }}
    >
      <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: "6px" }}>
        Descartes e pontos por período
      </Typography>
      <Typography sx={{ color: "rgba(255,255,255,0.68)", marginBottom: "16px", fontSize: "0.9rem" }}>
        Selecione um intervalo de datas para agregar os descartes validados e os pontos gerados.
      </Typography>

      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          gerarRelatorioDescartes();
        }}
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "14px",
          alignItems: "end",
          marginBottom: "16px",
        }}
      >
        <Box>
          <Typography sx={labelStyle}>Data inicial</Typography>
          <input
            type="date"
            value={periodo.inicio}
            onChange={(e) => setPeriodo({ ...periodo, inicio: e.target.value })}
            style={inputStyle}
          />
        </Box>
        <Box>
          <Typography sx={labelStyle}>Data final</Typography>
          <input
            type="date"
            value={periodo.fim}
            onChange={(e) => setPeriodo({ ...periodo, fim: e.target.value })}
            style={inputStyle}
          />
        </Box>
        <Button
          type="submit"
          disabled={carregandoDescartes}
          startIcon={<Recycle size={18} />}
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
          {carregandoDescartes ? "Gerando..." : "Gerar"}
        </Button>
      </Box>

      {descartesMsg && (
        <Typography
          sx={{
            color: descartesMsg.tipo === "ok" ? "#A5D6A7" : "#EF9A9A",
            fontWeight: 600,
            marginBottom: "16px",
          }}
        >
          ⚠️ {descartesMsg.texto}
        </Typography>
      )}

      {relatorioDescartes && (
        <>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px" }}>
            {[
              ["Descartes", relatorioDescartes.totalDescartes],
              ["Unidades", relatorioDescartes.quantidadeTotal],
              ["Pontos gerados", relatorioDescartes.pontosGerados],
            ].map(([label, value]) => (
              <Box
                key={label}
                sx={{
                  background: "rgba(0,0,0,0.28)",
                  border: "1px solid rgba(165,214,167,0.20)",
                  borderRadius: "12px",
                  padding: "14px",
                }}
              >
                <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.82rem" }}>
                  {label}
                </Typography>
                <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, marginTop: "4px" }}>
                  {value ?? 0}
                </Typography>
              </Box>
            ))}
          </Box>

          <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", marginBottom: "10px" }}>
            Período: <strong>{relatorioDescartes.inicio}</strong> até <strong>{relatorioDescartes.fim}</strong>
          </Typography>

          {(relatorioDescartes.residuos || []).length === 0 ? (
            <Typography sx={{ color: "rgba(255,255,255,0.72)" }}>
              Nenhum descarte validado nesse período.
            </Typography>
          ) : (
            <Box sx={{ display: "grid", gap: "10px" }}>
              {relatorioDescartes.residuos.map((r) => (
                <Box
                  key={r.tipoResiduo}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "rgba(0,0,0,0.28)",
                    border: "1px solid rgba(165,214,167,0.20)",
                    borderRadius: "12px",
                    padding: "12px 16px",
                  }}
                >
                  <Typography sx={{ fontWeight: 700 }}>{r.tipoResiduo}</Typography>
                  <Typography sx={{ color: "#A5D6A7", fontWeight: 800 }}>
                    {r.quantidadeTotal || 0} unidade(s) • {r.pontosGerados || 0} pts
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </>
      )}
    </Box>

    {!relatorioEngajamento || !relatorioResiduos ? (
      <Typography sx={{ color: "rgba(255,255,255,0.72)" }}>
        Carregando relatórios...
      </Typography>
    ) : (
      <>
        <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: "14px" }}>
          Participação e engajamento
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
            marginBottom: "28px",
          }}
        >
          {[
            ["Usuários", relatorioEngajamento.totalUsuarios],
            ["Agendamentos", relatorioEngajamento.totalAgendamentos],
            ["Pendentes", relatorioEngajamento.pendentes],
            ["Realizados", relatorioEngajamento.realizados],
            ["Cancelados", relatorioEngajamento.cancelados],
            ["Não compareceu", relatorioEngajamento.naoCompareceu],
            ["Pontos distribuídos", relatorioEngajamento.pontosDistribuidos],
          ].map(([label, value]) => (
            <Box
              key={label}
              sx={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(165,214,167,0.20)",
                borderRadius: "14px",
                padding: "16px",
              }}
            >
              <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.85rem" }}>
                {label}
              </Typography>
              <Typography sx={{ fontSize: "1.6rem", fontWeight: 800, marginTop: "6px" }}>
                {value ?? 0}
              </Typography>
            </Box>
          ))}
        </Box>

        <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: "14px" }}>
          Usuários e engajamento
        </Typography>

        <Box sx={{ display: "grid", gap: "10px", marginBottom: "28px" }}>
          {(relatorioEngajamento.usuarios || []).map((u) => (
            <Box
              key={u.id}
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
              <Box>
                <Typography sx={{ fontWeight: 700 }}>{u.nome}</Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.85rem" }}>
                  {u.email}
                </Typography>
              </Box>

              <Typography sx={{ color: "#A5D6A7", fontWeight: 800 }}>
                {u.pontuacaoTotal || 0} pts • {u.totalAgendamentos || 0} agendamento(s)
              </Typography>
            </Box>
          ))}
        </Box>

        <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: "14px" }}>
          Volumetria de resíduos por tipo
        </Typography>

        <Box
          sx={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(165,214,167,0.20)",
            borderRadius: "14px",
            padding: "16px",
            marginBottom: "14px",
          }}
        >
          <Typography sx={{ color: "rgba(255,255,255,0.72)" }}>
            Quantidade total: <strong>{relatorioResiduos.quantidadeTotal || 0}</strong>
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.72)" }}>
            Pontos gerados: <strong>{relatorioResiduos.pontosGerados || 0}</strong>
          </Typography>
        </Box>

        <Box sx={{ display: "grid", gap: "10px" }}>
          {(relatorioResiduos.residuos || []).map((r) => (
            <Box
              key={r.tipoResiduo}
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
                {r.tipoResiduo}
              </Typography>

              <Typography sx={{ color: "#A5D6A7", fontWeight: 800 }}>
                {r.quantidadeTotal || 0} unidade(s) • {r.pontosGerados || 0} pts
              </Typography>
            </Box>
          ))}
        </Box>
      </>
    )}
  </Box>
)}
      </Box>
    </Box>
  );
}
