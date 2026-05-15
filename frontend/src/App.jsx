import { useState } from "react";
import logoImg from "./assets/Ewaister.png";

const COLORS = {
  green: "#2E7D32",
  greenLight: "#4CAF50",
  greenBg: "#E8F5E9",
  greenMuted: "#A5D6A7",
  orange: "#F57C00",
  orangeLight: "#FFE0B2",
  gray: "#616161",
  grayLight: "#F5F5F5",
  grayBorder: "#E0E0E0",
  white: "#FFFFFF",
  text: "#212121",
  textSec: "#757575",
  sidebarBg: "#1B5E20",
};

const slotsData = [
  { id: 1, data: "12/05/2026", dia: "Terca", turno: "Manha", horario: "08:00 - 12:00", vagas: 3, max: 5 },
  { id: 2, data: "12/05/2026", dia: "Terca", turno: "Tarde", horario: "13:00 - 17:00", vagas: 0, max: 5 },
  { id: 3, data: "13/05/2026", dia: "Quarta", turno: "Manha", horario: "08:00 - 12:00", vagas: 5, max: 5 },
  { id: 4, data: "13/05/2026", dia: "Quarta", turno: "Tarde", horario: "13:00 - 17:00", vagas: 2, max: 5 },
  { id: 5, data: "14/05/2026", dia: "Quinta", turno: "Manha", horario: "08:00 - 12:00", vagas: 4, max: 5 },
  { id: 6, data: "14/05/2026", dia: "Quinta", turno: "Tarde", horario: "13:00 - 17:00", vagas: 1, max: 5 },
];

const tiposResiduo = [
  { id: 1, nome: "Celular/Smartphone", pontos: 15, sigla: "CEL" },
  { id: 2, nome: "Notebook/Laptop", pontos: 25, sigla: "NB" },
  { id: 3, nome: "Pilhas e Baterias", pontos: 5, sigla: "PIL" },
  { id: 4, nome: "Cabos e Carregadores", pontos: 3, sigla: "CAB" },
  { id: 5, nome: "Monitor/Tela", pontos: 20, sigla: "MON" },
  { id: 6, nome: "Teclado/Mouse", pontos: 5, sigla: "TEC" },
  { id: 7, nome: "Memoria RAM", pontos: 8, sigla: "RAM" },
  { id: 8, nome: "Placa-mae", pontos: 12, sigla: "MB" },
  { id: 9, nome: "HD/SSD", pontos: 10, sigla: "HD" },
];

const usuariosMock = [
  { nome: "Eito", email: "eito@email.com", senha: "123456" },
];

// ---------------------------------------------------------------------------
// Componentes reutilizaveis
// ---------------------------------------------------------------------------

function InputField({ label, type = "text", value, onChange, placeholder, erro }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", padding: "11px 14px", boxSizing: "border-box",
          border: `1px solid ${erro ? "#D32F2F" : focused ? COLORS.green : COLORS.grayBorder}`,
          borderRadius: 8, fontSize: 14, outline: "none",
          fontFamily: "inherit", color: COLORS.text, background: COLORS.white,
          transition: "border-color 0.15s",
        }}
      />
      {erro && <div style={{ fontSize: 12, color: "#D32F2F", marginTop: 4 }}>{erro}</div>}
    </div>
  );
}

function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: COLORS.text }}>{title}</h1>
        {subtitle && <p style={{ margin: "4px 0 0", fontSize: 14, color: COLORS.textSec }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function BotaoVoltar({ onClick, label = "Voltar" }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none", border: "none", cursor: "pointer",
        color: COLORS.green, fontSize: 14, fontWeight: 500,
        padding: "0 0 20px", display: "flex", alignItems: "center", gap: 6,
      }}
    >
      &larr; {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

function AuthLayout({ children }) {
  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{
        width: 420, flexShrink: 0, background: COLORS.sidebarBg,
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "60px 48px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={logoImg} alt="E-Waster" style={{ width: 40, height: 40, flexShrink: 0 }} />
          <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.white, letterSpacing: "-0.5px" }}>
            E-Waster
          </div>
        </div>
        <div style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", marginTop: 6, marginBottom: 48 }}>
          Coleta Consciente
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.white, lineHeight: 1.4, marginBottom: 16 }}>
          Descarte certo.<br />Planeta melhor.
        </div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
          Agende coletas de residuos eletronicos e acumule pontos enquanto cuida do meio ambiente.
        </div>
        <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { label: "Agendamentos", desc: "Escolha data e turno" },
            { label: "Selecao de Itens", desc: "Pontuacao automatica por residuo" },
            { label: "Historico", desc: "Acompanhe suas entregas" },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.greenLight, flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.white }}>{item.label}</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginLeft: 6 }}>{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        background: COLORS.grayLight, padding: "40px",
      }}>
        <div style={{ width: "100%", maxWidth: 400 }}>{children}</div>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin, onIrCadastro }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");

  const handleSubmit = () => {
    const e = {};
    if (!email.trim()) e.email = "Informe o e-mail";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "E-mail invalido";
    if (!senha) e.senha = "Informe a senha";
    if (Object.keys(e).length > 0) { setErros(e); return; }
    setErros({});
    const usuario = usuariosMock.find((u) => u.email === email.trim() && u.senha === senha);
    if (!usuario) { setErroGeral("E-mail ou senha incorretos."); return; }
    setErroGeral("");
    onLogin(usuario.nome);
  };

  return (
    <AuthLayout>
      <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>Bem-vindo de volta</div>
      <div style={{ fontSize: 14, color: COLORS.textSec, marginBottom: 32 }}>Acesse sua conta para continuar</div>
      <InputField label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" erro={erros.email} />
      <InputField label="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Sua senha" erro={erros.senha} />
      {erroGeral && (
        <div style={{ fontSize: 13, color: "#D32F2F", background: "#FFEBEE", borderRadius: 6, padding: "10px 14px", marginBottom: 16 }}>
          {erroGeral}
        </div>
      )}
      <button onClick={handleSubmit} style={{ width: "100%", padding: "13px", background: COLORS.green, color: COLORS.white, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 20 }}>
        Entrar
      </button>
      <div style={{ fontSize: 13, color: COLORS.textSec, textAlign: "center" }}>
        Nao tem conta?{" "}
        <button onClick={onIrCadastro} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.green, fontWeight: 600, fontSize: 13, padding: 0 }}>
          Cadastre-se
        </button>
      </div>
      <div style={{ marginTop: 28, padding: "12px 14px", background: COLORS.greenBg, borderRadius: 8, fontSize: 12, color: COLORS.gray }}>
        <strong>Conta de teste:</strong> eito@email.com / 123456
      </div>
    </AuthLayout>
  );
}

function CadastroScreen({ onCadastro, onIrLogin }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erros, setErros] = useState({});
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = () => {
    const e = {};
    if (!nome.trim()) e.nome = "Informe o nome";
    if (!email.trim()) e.email = "Informe o e-mail";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "E-mail invalido";
    if (!senha) e.senha = "Informe a senha";
    else if (senha.length < 6) e.senha = "Minimo 6 caracteres";
    if (!confirmar) e.confirmar = "Confirme a senha";
    else if (confirmar !== senha) e.confirmar = "As senhas nao coincidem";
    if (Object.keys(e).length > 0) { setErros(e); return; }
    setErros({});
    usuariosMock.push({ nome: nome.trim(), email: email.trim(), senha });
    setSucesso(true);
    setTimeout(() => onCadastro(nome.trim()), 1200);
  };

  if (sucesso) {
    return (
      <AuthLayout>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: COLORS.greenBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: COLORS.green, margin: "0 auto 20px" }}>OK</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>Cadastro realizado!</div>
          <div style={{ fontSize: 14, color: COLORS.textSec }}>Entrando na sua conta...</div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>Criar conta</div>
      <div style={{ fontSize: 14, color: COLORS.textSec, marginBottom: 28 }}>Preencha os dados para se cadastrar</div>
      <InputField label="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" erro={erros.nome} />
      <InputField label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" erro={erros.email} />
      <InputField label="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Minimo 6 caracteres" erro={erros.senha} />
      <InputField label="Confirmar senha" type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} placeholder="Repita a senha" erro={erros.confirmar} />
      <button onClick={handleSubmit} style={{ width: "100%", padding: "13px", background: COLORS.green, color: COLORS.white, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 20 }}>
        Criar conta
      </button>
      <div style={{ fontSize: 13, color: COLORS.textSec, textAlign: "center" }}>
        Ja tem conta?{" "}
        <button onClick={onIrLogin} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.green, fontWeight: 600, fontSize: 13, padding: 0 }}>
          Entrar
        </button>
      </div>
    </AuthLayout>
  );
}

// ---------------------------------------------------------------------------
// App shell
// ---------------------------------------------------------------------------

function Sidebar({ screen, onNavigate, usuario, onLogout }) {
  const navItems = [
    { id: "home", label: "Inicio" },
    { id: "agendamento", label: "Agendar Coleta" },
    { id: "meus-agendamentos", label: "Meus Agendamentos" },
  ];

  const activeGroup = screen.startsWith("agendamento") ? "agendamento"
    : screen.startsWith("meus-agendamentos") ? "meus-agendamentos"
    : "home";

  return (
    <div style={{ width: 240, minHeight: "100vh", background: COLORS.sidebarBg, display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "28px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <img src={logoImg} alt="E-Waster" style={{ width: 32, height: 32, flexShrink: 0 }} />
          <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.white, letterSpacing: "-0.5px" }}>E-Waster</div>
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Coleta Consciente</div>
      </div>
      <nav style={{ padding: "16px 12px", flex: 1 }}>
        {navItems.map((item) => {
          const ativo = activeGroup === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                width: "100%", textAlign: "left", border: "none", cursor: "pointer",
                padding: "10px 12px", borderRadius: 8, marginBottom: 4,
                background: ativo ? "rgba(255,255,255,0.15)" : "transparent",
                color: ativo ? COLORS.white : "rgba(255,255,255,0.65)",
                fontSize: 14, fontWeight: ativo ? 600 : 400,
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Logado como</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", marginTop: 2, marginBottom: 10 }}>{usuario}</div>
        <button
          onClick={onLogout}
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", borderRadius: 6, padding: "7px 12px", fontSize: 12, cursor: "pointer", width: "100%", textAlign: "center" }}
        >
          Sair
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------

function HomeScreen({ onNavigate, usuario, totalPontos, totalAgendamentos, totalHistorico }) {
  return (
    <div>
      <PageHeader
        title={`Bem-vindo, ${usuario}`}
        subtitle="Gerencie suas coletas de residuos eletronicos."
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 32, maxWidth: 520 }}>
        <div style={{ background: COLORS.white, border: `1px solid ${COLORS.grayBorder}`, borderRadius: 12, padding: "20px 24px" }}>
          <div style={{ fontSize: 13, color: COLORS.textSec, marginBottom: 6 }}>Seus pontos</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.text }}>{totalPontos}</div>
          <div style={{ fontSize: 12, color: COLORS.textSec, marginTop: 4 }}>
            {totalPontos === 0 ? "Faca um agendamento para ganhar" : "Acumulados via agendamentos ativos"}
          </div>
        </div>
        <div style={{ background: COLORS.white, border: `1px solid ${COLORS.grayBorder}`, borderRadius: 12, padding: "20px 24px" }}>
          <div style={{ fontSize: 13, color: COLORS.textSec, marginBottom: 6 }}>Agendamentos ativos</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.text }}>{totalAgendamentos}</div>
          <div style={{ fontSize: 12, color: COLORS.textSec, marginTop: 4 }}>
            {totalAgendamentos === 0 ? "Nenhum agendamento pendente" : `${totalAgendamentos} pendente(s)`}
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 600, color: COLORS.text, margin: "0 0 16px" }}>Acoes rapidas</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, maxWidth: 640 }}>
        <button
          onClick={() => onNavigate("agendamento")}
          style={{ border: `1px solid ${COLORS.grayBorder}`, borderRadius: 12, padding: "24px", background: COLORS.white, cursor: "pointer", textAlign: "left" }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = COLORS.green}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = COLORS.grayBorder}
        >
          <div style={{ width: 48, height: 48, borderRadius: 10, background: COLORS.greenBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: COLORS.green, marginBottom: 14 }}>AGD</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>Agendar Coleta</div>
          <div style={{ fontSize: 13, color: COLORS.textSec, marginTop: 4, lineHeight: 1.4 }}>Escolha data, turno e os itens que vai entregar</div>
        </button>
        <button
          onClick={() => onNavigate("meus-agendamentos")}
          style={{ border: `1px solid ${COLORS.grayBorder}`, borderRadius: 12, padding: "24px", background: COLORS.white, cursor: "pointer", textAlign: "left" }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = COLORS.green}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = COLORS.grayBorder}
        >
          <div style={{ width: 48, height: 48, borderRadius: 10, background: COLORS.greenBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: COLORS.green, marginBottom: 14 }}>HIST</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>Meus Agendamentos</div>
          <div style={{ fontSize: 13, color: COLORS.textSec, marginTop: 4, lineHeight: 1.4 }}>
            {totalHistorico === 0
              ? "Nenhum agendamento ainda"
              : totalAgendamentos === 0
                ? `Ver historico (${totalHistorico} cancelado(s))`
                : `${totalAgendamentos} ativo(s) — ver historico`}
          </div>
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Agendamento
// ---------------------------------------------------------------------------

function AgendamentoList({ onSelect, agendamentos }) {
  const slotsOcupados = agendamentos.filter((a) => a.status !== "Cancelado").map((a) => a.slot.id);
  return (
    <div>
      <PageHeader title="Agendar Coleta" subtitle="Selecione um horario disponivel para entrega dos seus residuos." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {slotsData.map((slot) => {
          const esgotado = slot.vagas === 0;
          const jaAgendado = slotsOcupados.includes(slot.id);
          const desabilitado = esgotado || jaAgendado;
          const ocupacao = ((slot.max - slot.vagas) / slot.max) * 100;
          return (
            <button
              key={slot.id}
              disabled={desabilitado}
              onClick={() => !desabilitado && onSelect(slot)}
              style={{
                textAlign: "left", cursor: desabilitado ? "default" : "pointer",
                border: `1px solid ${jaAgendado ? COLORS.greenMuted : desabilitado ? COLORS.grayBorder : COLORS.greenMuted}`,
                borderRadius: 10, padding: "18px 20px",
                background: jaAgendado ? COLORS.greenBg : desabilitado ? COLORS.grayLight : COLORS.white,
                opacity: esgotado ? 0.55 : 1,
              }}
              onMouseEnter={(e) => { if (!desabilitado) e.currentTarget.style.boxShadow = "0 2px 12px rgba(46,125,50,0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ fontSize: 12, color: COLORS.textSec, marginBottom: 4 }}>{slot.dia}, {slot.data}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>{slot.turno}</div>
              <div style={{ fontSize: 13, color: COLORS.textSec, marginTop: 2, marginBottom: 14 }}>{slot.horario}</div>
              <div style={{ height: 4, background: COLORS.grayBorder, borderRadius: 4, marginBottom: 8 }}>
                <div style={{ height: "100%", width: `${ocupacao}%`, background: desabilitado ? COLORS.gray : COLORS.greenLight, borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: jaAgendado ? COLORS.green : esgotado ? COLORS.gray : COLORS.green }}>
                {jaAgendado ? "Ja agendado por voce" : esgotado ? "Esgotado" : `${slot.vagas} de ${slot.max} vagas disponiveis`}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AgendamentoConfirm({ slot, onBack, onConfirm }) {
  const [selecionados, setSelecionados] = useState([]);

  const toggle = (id) => {
    setSelecionados((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const totalPontos = selecionados.reduce((sum, id) => {
    const item = tiposResiduo.find((t) => t.id === id);
    return sum + (item?.pontos || 0);
  }, 0);

  const itensSelecionados = tiposResiduo.filter((t) => selecionados.includes(t.id));

  return (
    <div>
      <BotaoVoltar onClick={onBack} label="Voltar aos horarios" />
      <PageHeader title="Confirmar Agendamento" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>
        <div>
          <div style={{ background: COLORS.greenBg, borderRadius: 10, padding: "20px 24px", marginBottom: 24, display: "flex", gap: 32 }}>
            <div>
              <div style={{ fontSize: 12, color: COLORS.green, fontWeight: 600, marginBottom: 4 }}>Data</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>{slot.dia}, {slot.data}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: COLORS.green, fontWeight: 600, marginBottom: 4 }}>Turno</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>{slot.turno}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: COLORS.green, fontWeight: 600, marginBottom: 4 }}>Horario</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>{slot.horario}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: COLORS.green, fontWeight: 600, marginBottom: 4 }}>Vagas</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>{slot.vagas} restantes</div>
            </div>
          </div>

          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 12 }}>
            Quais itens voce vai entregar?
          </div>
          <div style={{ fontSize: 13, color: COLORS.textSec, marginBottom: 16 }}>
            Selecione ao menos um item. Os pontos sao calculados automaticamente.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {tiposResiduo.map((tipo) => {
              const ativo = selecionados.includes(tipo.id);
              return (
                <button
                  key={tipo.id}
                  onClick={() => toggle(tipo.id)}
                  style={{
                    textAlign: "left", cursor: "pointer",
                    border: `2px solid ${ativo ? COLORS.green : COLORS.grayBorder}`,
                    borderRadius: 10, padding: "12px 14px",
                    background: ativo ? COLORS.greenBg : COLORS.white,
                    display: "flex", alignItems: "center", gap: 10,
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 6, background: ativo ? COLORS.green : COLORS.grayLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: ativo ? COLORS.white : COLORS.gray, flexShrink: 0 }}>
                    {tipo.sigla}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: COLORS.text }}>{tipo.nome}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.orange, marginTop: 2 }}>+{tipo.pontos} pts</div>
                  </div>
                  {ativo && (
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: COLORS.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: COLORS.white, fontWeight: 700, flexShrink: 0 }}>v</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ background: COLORS.white, border: `1px solid ${COLORS.grayBorder}`, borderRadius: 12, padding: "24px", position: "sticky", top: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 16 }}>Resumo</div>

          {selecionados.length === 0 ? (
            <div style={{ fontSize: 13, color: COLORS.textSec, padding: "12px 0", textAlign: "center" }}>
              Selecione ao menos um item
            </div>
          ) : (
            <>
              {itensSelecionados.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, marginBottom: 8, borderBottom: `1px solid ${COLORS.grayBorder}` }}>
                  <span style={{ fontSize: 13, color: COLORS.text }}>{item.nome}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.orange }}>+{item.pontos}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>Total</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: COLORS.green }}>+{totalPontos} pts</span>
              </div>
            </>
          )}

          <button
            onClick={() => selecionados.length > 0 && onConfirm(itensSelecionados, totalPontos)}
            disabled={selecionados.length === 0}
            style={{
              width: "100%", marginTop: 20, padding: "12px",
              background: selecionados.length > 0 ? COLORS.green : COLORS.grayBorder,
              color: COLORS.white, border: "none", borderRadius: 8,
              fontSize: 14, fontWeight: 600,
              cursor: selecionados.length > 0 ? "pointer" : "default",
            }}
          >
            Confirmar Agendamento
          </button>
        </div>
      </div>
    </div>
  );
}

function AgendamentoSucesso({ agendamento, onHome, onVerAgendamentos }) {
  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ background: COLORS.white, border: `1px solid ${COLORS.grayBorder}`, borderRadius: 12, padding: "40px", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: COLORS.greenBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: COLORS.green, margin: "0 auto 20px" }}>OK</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>Agendamento confirmado</div>
        <div style={{ fontSize: 14, color: COLORS.textSec, lineHeight: 1.6 }}>
          {agendamento.slot.dia}, {agendamento.slot.data} &mdash; {agendamento.slot.turno} &bull; {agendamento.slot.horario}
        </div>

        <div style={{ marginTop: 20, background: COLORS.orangeLight, borderRadius: 10, padding: "14px 24px", display: "inline-block" }}>
          <div style={{ fontSize: 12, color: COLORS.orange, fontWeight: 500 }}>Pontos ganhos</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: COLORS.orange }}>+{agendamento.totalPontos}</div>
        </div>

        <div style={{ background: COLORS.grayLight, borderRadius: 8, padding: "14px 20px", marginTop: 20, fontSize: 13, color: COLORS.textSec, lineHeight: 1.6, textAlign: "left" }}>
          Compareça no horario agendado com os residuos selecionados. Voce receberá um lembrete antes da data.
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
          <button onClick={onVerAgendamentos} style={{ padding: "11px 24px", background: COLORS.white, color: COLORS.green, border: `1px solid ${COLORS.green}`, borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Ver meus agendamentos
          </button>
          <button onClick={onHome} style={{ padding: "11px 24px", background: COLORS.green, color: COLORS.white, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Voltar ao inicio
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meus Agendamentos
// ---------------------------------------------------------------------------

const STATUS_CONFIG = {
  Pendente:        { cor: "#1565C0", bg: "#E3F2FD", label: "Pendente" },
  Realizado:       { cor: COLORS.green, bg: COLORS.greenBg, label: "Realizado" },
  Cancelado:       { cor: "#B71C1C", bg: "#FFEBEE", label: "Cancelado" },
  "Nao compareceu": { cor: COLORS.orange, bg: COLORS.orangeLight, label: "Nao compareceu" },
};

function BadgeStatus({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Pendente"];
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
      color: cfg.cor, background: cfg.bg, letterSpacing: "0.3px",
    }}>
      {cfg.label.toUpperCase()}
    </span>
  );
}

function MeusAgendamentos({ agendamentos, onAgendar, onCancelar }) {
  const [confirmandoCancelar, setConfirmandoCancelar] = useState(null);

  if (agendamentos.length === 0) {
    return (
      <div>
        <PageHeader title="Meus Agendamentos" subtitle="Historico de coletas agendadas." />
        <div style={{ background: COLORS.white, border: `1px solid ${COLORS.grayBorder}`, borderRadius: 12, padding: "60px 40px", textAlign: "center", maxWidth: 480 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: COLORS.grayLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: COLORS.gray, margin: "0 auto 20px" }}>VAZIO</div>
          <div style={{ fontSize: 17, fontWeight: 600, color: COLORS.text, marginBottom: 8 }}>Nenhum agendamento ainda</div>
          <div style={{ fontSize: 14, color: COLORS.textSec, lineHeight: 1.6, marginBottom: 24 }}>
            Quando voce agendar uma coleta, ela aparecera aqui com todos os detalhes e pontos estimados.
          </div>
          <button onClick={onAgendar} style={{ padding: "11px 28px", background: COLORS.green, color: COLORS.white, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Agendar minha primeira coleta
          </button>
        </div>
      </div>
    );
  }

  const totalPontos = agendamentos
    .filter((a) => a.status !== "Cancelado")
    .reduce((sum, a) => sum + a.totalPontos, 0);

  const ordenados = agendamentos.slice().reverse();

  return (
    <div>
      <PageHeader
        title="Meus Agendamentos"
        subtitle={`${agendamentos.length} agendamento(s) — ${totalPontos} pontos estimados`}
        action={
          <button onClick={onAgendar} style={{ padding: "10px 20px", background: COLORS.green, color: COLORS.white, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Novo agendamento
          </button>
        }
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {ordenados.map((agd) => {
          const cancelando = confirmandoCancelar === agd.id;
          const podeCancelar = agd.status === "Pendente";
          return (
            <div
              key={agd.id}
              style={{
                background: COLORS.white,
                border: `1px solid ${agd.status === "Cancelado" ? COLORS.grayBorder : COLORS.grayBorder}`,
                borderRadius: 12, padding: "20px 24px",
                opacity: agd.status === "Cancelado" ? 0.6 : 1,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>
                      {agd.slot.dia}, {agd.slot.data} &mdash; {agd.slot.turno}
                    </div>
                    <BadgeStatus status={agd.status} />
                  </div>
                  <div style={{ fontSize: 13, color: COLORS.textSec }}>{agd.slot.horario}</div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0, marginLeft: 16 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: COLORS.orange, fontWeight: 600 }}>PONTOS ESTIMADOS</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: agd.status === "Cancelado" ? COLORS.gray : COLORS.orange }}>
                      {agd.status === "Cancelado" ? <s>+{agd.totalPontos}</s> : `+${agd.totalPontos}`}
                    </div>
                  </div>

                  {podeCancelar && !cancelando && (
                    <button
                      onClick={() => setConfirmandoCancelar(agd.id)}
                      style={{ padding: "9px 18px", background: "none", border: "1px solid #D32F2F", color: "#D32F2F", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
                    >
                      Cancelar agendamento
                    </button>
                  )}

                  {podeCancelar && cancelando && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, color: COLORS.text, whiteSpace: "nowrap" }}>Tem certeza?</span>
                      <button
                        onClick={() => { onCancelar(agd.id); setConfirmandoCancelar(null); }}
                        style={{ padding: "9px 16px", background: "#D32F2F", border: "none", color: COLORS.white, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
                      >
                        Sim
                      </button>
                      <button
                        onClick={() => setConfirmandoCancelar(null)}
                        style={{ padding: "9px 16px", background: COLORS.grayLight, border: `1px solid ${COLORS.grayBorder}`, color: COLORS.text, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                      >
                        Nao
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ borderTop: `1px solid ${COLORS.grayBorder}`, paddingTop: 12 }}>
                <div style={{ fontSize: 12, color: COLORS.textSec, marginBottom: 8, fontWeight: 500 }}>Itens selecionados:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {agd.itens.map((item) => (
                    <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 6, background: agd.status === "Cancelado" ? COLORS.grayLight : COLORS.greenBg, borderRadius: 20, padding: "4px 12px" }}>
                      <span style={{ fontSize: 12, color: agd.status === "Cancelado" ? COLORS.gray : COLORS.green, fontWeight: 500 }}>{item.nome}</span>
                      <span style={{ fontSize: 11, color: agd.status === "Cancelado" ? COLORS.gray : COLORS.orange, fontWeight: 600 }}>+{item.pontos}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

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
