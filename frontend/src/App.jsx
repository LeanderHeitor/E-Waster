import { useState } from "react";
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

export default function App() {
  const [authScreen, setAuthScreen] = useState("landing");
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [screen, setScreen] = useState("home");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [agendamentos, setAgendamentos] = useState([]);
  const [ultimoAgendamento, setUltimoAgendamento] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  if (!usuarioLogado) {
  if (authScreen === "landing") {
    return (
      <LandingPage
        onLogin={() => setAuthScreen("login")}
        onCadastro={() => setAuthScreen("cadastro")}
        onAdmin={() => setAuthScreen("admin-login")}
      />
    );
  }

  if (authScreen === "login") {
    return (
      <LoginScreen
  onLogin={(nome) => setUsuarioLogado(nome)}
  onIrCadastro={() => setAuthScreen("cadastro")}
  onIrLanding={() => setAuthScreen("landing")}
/>
    );
  }

  if (authScreen === "cadastro") {
    return (
      <CadastroScreen
  onCadastro={(nome) => setUsuarioLogado(nome)}
  onIrLogin={() => setAuthScreen("login")}
  onIrLanding={() => setAuthScreen("landing")}
/>
    );
  }
if (authScreen === "admin-login") {
  return (
    <AdminLoginScreen
      onAdminLogin={(nome) => {
  setUsuarioLogado(nome);
  setIsAdmin(true);
}}
      onIrLogin={() => setAuthScreen("login")}
      onIrLanding={() => setAuthScreen("landing")}
    />
  );
}
  return <LandingPage onLogin={() => setAuthScreen("login")} onCadastro={() => setAuthScreen("cadastro")} onAdmin={() => setAuthScreen("admin-login")} />;
}
if (usuarioLogado && isAdmin) {
  return (
    <AdminDashboard
      onLogout={() => {
        setUsuarioLogado(null);
        setIsAdmin(false);
        setAuthScreen("landing");
      }}
    />
  );
}
  const agendamentosAtivos = agendamentos.filter((a) => a.status !== "Cancelado");
  const totalPontos = agendamentosAtivos.reduce((sum, a) => sum + a.totalPontos, 0);
  const totalAgendamentosAtivos = agendamentosAtivos.length;

  const handleConfirmarAgendamento = (itens, totalPts) => {
    const novoAgendamento = {
      id: agendamentos.length + 1,
      slot: selectedSlot,
      itens,
      totalPontos: totalPts,
      status: "Pendente",
    };
    setAgendamentos((prev) => [...prev, novoAgendamento]);
    setUltimoAgendamento(novoAgendamento);
    setScreen("agendamento-sucesso");
  };

  const handleCancelarAgendamento = (id) => {
    setAgendamentos((prev) =>
      prev.map((a) => a.id === id ? { ...a, status: "Cancelado" } : a)
    );
  };

  const handleLogout = () => {
    setUsuarioLogado(null);
    setAuthScreen("login");
    setScreen("home");
    setAgendamentos([]);
    setSelectedSlot(null);
    setUltimoAgendamento(null);
    setIsAdmin(false);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', background: COLORS.grayLight }}>
      <Sidebar screen={screen} onNavigate={setScreen} usuario={usuarioLogado} onLogout={handleLogout} />

      <main style={{ flex: 1, padding: "36px 40px", overflowY: "auto" }}>
        {screen === "home" && (
          <HomeScreen
            onNavigate={setScreen}
            usuario={usuarioLogado}
            totalPontos={totalPontos}
            totalAgendamentos={totalAgendamentosAtivos}
            totalHistorico={agendamentos.length}
          />
        )}

        {screen === "agendamento" && (
          <AgendamentoList
            agendamentos={agendamentos}
            onSelect={(slot) => { setSelectedSlot(slot); setScreen("agendamento-confirm"); }}
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
  <RankingPage usuario={usuarioLogado} />
)}
      </main>
    </div>
  );
}
