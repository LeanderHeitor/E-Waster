import { useState } from "react";
import AuthLayout from "../Layouts/AuthLayout";
import InputField from "../components/InputField";
import { cadastrarUsuario } from "../api/authApi";
import { COLORS } from "../styles/colors";
function CadastroScreen({ onCadastro, onIrLogin }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erros, setErros] = useState({});
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async () => {
    const e = {};
    if (!nome.trim()) e.nome = "Informe o nome";
    if (!email.trim()) e.email = "Informe o e-mail";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "E-mail invalido";
    if (!senha) e.senha = "Informe a senha";
    else if (senha.length < 6) e.senha = "Minimo 6 caracteres";
    if (!confirmar) e.confirmar = "Confirme a senha";
    else if (confirmar !== senha) e.confirmar = "As senhas nao coincidem";
    if (Object.keys(e).length > 0) { setErros(e); return; }

    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim();

    setErros({});
    setCarregando(true);

    try {
      await cadastrarUsuario({ nome: nomeLimpo, email: emailLimpo, senha });
      setSucesso(true);
      setTimeout(() => onCadastro(nomeLimpo), 1200);
    } catch (error) {
      setErros({ geral: error.message });
    } finally {
      setCarregando(false);
    }
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
      {erros.geral && <div style={{ fontSize: 13, color: "#D32F2F", marginBottom: 12 }}>{erros.geral}</div>}
      <button disabled={carregando} onClick={handleSubmit} style={{ width: "100%", padding: "13px", background: carregando ? COLORS.grayBorder : COLORS.green, color: COLORS.white, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: carregando ? "default" : "pointer", marginBottom: 20 }}>
        {carregando ? "Criando conta..." : "Criar conta"}
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
export default CadastroScreen;
