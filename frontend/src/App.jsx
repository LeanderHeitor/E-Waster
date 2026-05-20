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

export default function App() {
  const [authScreen, setAuthScreen] = useState("login");
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [screen, setScreen] = useState("home");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [agendamentos, setAgendamentos] = useState([]);
  const [ultimoAgendamento, setUltimoAgendamento] = useState(null);

  if (!usuarioLogado) {
    if (authScreen === "login") {
      return <LoginScreen onLogin={(nome) => setUsuarioLogado(nome)} onIrCadastro={() => setAuthScreen("cadastro")} />;
    }
    return <CadastroScreen onCadastro={(nome) => setUsuarioLogado(nome)} onIrLogin={() => setAuthScreen("login")} />;
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
      </main>
    </div>
  );
}
