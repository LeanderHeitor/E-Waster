import { useState, useEffect, useCallback } from "react";
import { COLORS } from "./styles/colors";
import LoginScreen from "./pages/LoginScreen";
import CadastroScreen from "./pages/CadastroScreen";
import Sidebar from "./components/Sidebar";
import HomeScreen from "./pages/HomeScreen";
import MeusAgendamentos from "./pages/MeusAgendamentos";
import AgendamentoList from "./pages/AgendamentoList";
import AgendamentoConfirm from "./pages/AgendamentoConfirm";
import AgendamentoSucesso from "./pages/AgendamentoSucesso";
import LandingPage from "./pages/LandingPage";
import AdminLoginScreen from "./pages/AdminLoginScreen";
import AdminDashboard from "./pages/AdminDashboard";
import RankingPage from "./pages/RankingPage";

import { useAuth } from "./context/AuthContext";

export default function App() {
  // Pegando o token direto do estado global do Contexto
  const { usuario, autenticado, token, logout } = useAuth();

  const [authScreen, setAuthScreen] = useState("landing");
  const [screen, setScreen] = useState("home");
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [agendamentos, setAgendamentos] = useState([]);
  const [slotsData, setSlotsData] = useState([]);
  const [ultimoAgendamento, setUltimoAgendamento] = useState(null);

  // Admin é derivado da role persistida (token + usuario no localStorage),
  // então sobrevive a um refresh da página.
  const isAdmin = autenticado && usuario?.tipo === "ADMIN";

  // ==============================
  // FUNÇÃO DE CARREGAMENTO (CORRIGIDA)
  // ==============================
  const carregarDadosDoServidor = useCallback(async () => {
    try {
      // Se não há token carregado no contexto de autenticação, aborta para evitar 403
      if (!token) {
        console.warn("Aguardando token de autenticação...");
        return;
      }

      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      };

      // AGENDAMENTOS
      const resAgendamentos = await fetch(
        "http://localhost:8080/api/v1/agendamentos/me",
        { method: "GET", headers }
      );

      if (resAgendamentos.ok) {
        setAgendamentos(await resAgendamentos.json());
      } else {
        console.error("Erro agendamentos:", await resAgendamentos.text());
      }

      // SLOTS
      const resSlots = await fetch(
        "http://localhost:8080/api/v1/slots",
        { method: "GET", headers }
      );

      if (resSlots.ok) {
        setSlotsData(await resSlots.json());
      } else {
        console.error("ERRO SLOTS:", await resSlots.text());
      }
    } catch (error) {
      console.error("Erro geral ao carregar dados:", error);
    }
  }, [token]); // token adicionado como dependência crucial aqui

  // ==============================
  // EFECT DE CARREGAMENTO BACKEND
  // ==============================
  useEffect(() => {
    if (autenticado) {
      carregarDadosDoServidor();
    }
  }, [autenticado, carregarDadosDoServidor]);

  // ==============================
  // ROTAS DE ADMIN COMPARTILHADAS/PRIVADAS
  // ==============================
  if (isAdmin) {
    return (
      <AdminDashboard
        token={token}
        onLogout={() => {
          logout();
          setAuthScreen("landing");
        }}
      />
    );
  }

  // ==============================
  // USUÁRIO COMUM AUTENTICADO
  // ==============================
  if (autenticado) {
    const agendamentosAtivos = agendamentos.filter(
      (a) => a.status !== "Cancelado" && a.status !== "CANCELADO"
    );

    const totalPontos = agendamentosAtivos.reduce(
      (sum, a) => sum + (a.totalPts || a.totalPontos || 0),
      0
    );

    // ALTERADO: Agora a função recebe corretamente os itens selecionados e o totalPts do frontend
    const handleConfirmarAgendamento = async (itens, totalPts) => {
      try {
        if (!token) throw new Error("Token de autenticação ausente.");

        const payload = {
          slotId: selectedSlot.id,
          itens: itens.map((item) => ({
            tipoResiduoId: item.id || item.tipoResiduoId,
            quantidade: item.quantidade,
          })),
        };

        const response = await fetch(
          "http://localhost:8080/api/v1/agendamentos",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const novo = await response.json();

        // 🌟 CORREÇÃO INTERCEPTADORA:
        // Une os dados criados no banco de dados com a pontuação e itens calculados no frontend.
        // Isso impede que a tela de sucesso renderize "+0 pts" caso o banco de dados omita o campo de soma.
        const agendamentoComPontos = {
          ...novo,
          totalPontos: totalPts,
          pontuacaoTotal: totalPts,
          itens: itens
        };

        setUltimoAgendamento(agendamentoComPontos);
        setScreen("agendamento-sucesso");

        carregarDadosDoServidor();
      } catch (error) {
        alert("Erro: " + error.message);
      }
    };

    const handleCancelarAgendamento = async (id) => {
      try {
        if (!token) throw new Error("Token de autenticação ausente.");

        const response = await fetch(
          `http://localhost:8080/api/v1/agendamentos/${id}`,
          {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`
            },
          }
        );

        if (!response.ok) throw new Error(await response.text());

        setAgendamentos((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, status: "CANCELADO" } : a
          )
        );
      } catch (error) {
        alert(error.message);
      }
    };

    const handleLogout = () => {
      logout();
      setAuthScreen("landing");
      setScreen("home");
      setAgendamentos([]);
      setSlotsData([]);
      setSelectedSlot(null);
      setUltimoAgendamento(null);
    };

    return (
      <div style={{ display: "flex", minHeight: "100vh", background: COLORS.grayLight }}>
        <Sidebar screen={screen} onNavigate={setScreen} usuario={usuario} onLogout={handleLogout} />

        <main style={{ flex: 1, padding: 36 }}>
          {screen === "home" && (
            <HomeScreen
              onNavigate={setScreen}
              usuario={usuario}
              totalPontos={totalPontos}
              totalAgendamentos={agendamentosAtivos.length}
              totalHistorico={agendamentos.length}
            />
          )}

          {screen === "agendamento" && (
            <AgendamentoList
              agendamentos={agendamentos}
              slotsData={slotsData}
              onSelect={(slot) => {
                setSelectedSlot(slot);
                setScreen("agendamento-confirm");
              }}
            />
          )}

          {screen === "agendamento-confirm" && selectedSlot && (
            <AgendamentoConfirm
              slot={selectedSlot}
              onBack={() => setScreen("agendamento")}
              onConfirm={handleConfirmarAgendamento}
            />
          )}

          {screen === "agendamento-sucesso" && ultimoAgendamento && (
            <AgendamentoSucesso
              agendamento={ultimoAgendamento}
              onHome={() => setScreen("home")}
              onVerAgendamentos={() => setScreen("meus-agendamentos")}
            />
          )}

          {screen === "meus-agendamentos" && (
            <MeusAgendamentos
              agendamentos={agendamentos}
              onAgendar={() => setScreen("agendamento")}
              onCancelar={handleCancelarAgendamento}
            />
          )}

          {screen === "ranking" && (
            <RankingPage usuario={usuario} token={token} />
          )}
        </main>
      </div>
    );
  }

  // ==============================
  // FLUXO PÚBLICO (NÃO AUTENTICADO)
  // ==============================
  if (authScreen === "login") {
    return (
      <LoginScreen
        onIrCadastro={() => setAuthScreen("cadastro")}
        onIrLanding={() => setAuthScreen("landing")}
      />
    );
  }

  if (authScreen === "cadastro") {
    return (
      <CadastroScreen
        onCadastro={() => setAuthScreen("login")}
        onIrLogin={() => setAuthScreen("login")}
        onIrLanding={() => setAuthScreen("landing")}
      />
    );
  }

  if (authScreen === "admin-login") {
    return (
      <AdminLoginScreen
        onIrLogin={() => setAuthScreen("login")}
        onIrLanding={() => setAuthScreen("landing")}
      />
    );
  }

  return (
    <LandingPage
      onLogin={() => setAuthScreen("login")}
      onCadastro={() => setAuthScreen("cadastro")}
      onAdmin={() => setAuthScreen("admin-login")}
    />
  );
}