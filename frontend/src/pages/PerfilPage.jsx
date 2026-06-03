import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { COLORS } from "../styles/colors";

function PerfilPage({ token }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    async function carregarPerfil() {
      try {
        const res = await fetch("http://localhost:8081/api/v1/usuarios/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Não foi possível carregar o perfil.");

        const data = await res.json();
        setNome(data.nome || "");
        setEmail(data.email || "");
      } catch (e) {
        setErro(e.message);
      }
    }

    if (token) carregarPerfil();
  }, [token]);

  const salvar = async () => {
    setMensagem("");
    setErro("");
    setCarregando(true);

    try {
      const body = {
        nome,
        email,
      };

      if (senha.trim()) {
        body.senha = senha;
      }

      const res = await fetch("http://localhost:8081/api/v1/usuarios/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();

      setNome(data.nome || "");
      setEmail(data.email || "");
      setSenha("");
      setMensagem("Perfil atualizado com sucesso. Caso tenha alterado e-mail ou senha, faça login novamente depois.");
    } catch (e) {
      setErro(e.message || "Erro ao atualizar perfil.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 72px)",
        padding: "32px",
        borderRadius: 24,
        background: COLORS.white,
      }}
    >
      <PageHeader
        title="Meu Perfil"
        subtitle="Visualize e edite seus dados cadastrais."
      />

      <div style={{ maxWidth: 520, display: "grid", gap: 16 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>
            Nome
          </label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              marginTop: 6,
              borderRadius: 8,
              border: `1px solid ${COLORS.grayBorder}`,
              fontSize: 14,
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>
            E-mail
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              marginTop: 6,
              borderRadius: 8,
              border: `1px solid ${COLORS.grayBorder}`,
              fontSize: 14,
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>
            Nova senha
          </label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Deixe em branco para manter a senha atual"
            style={{
              width: "100%",
              padding: 12,
              marginTop: 6,
              borderRadius: 8,
              border: `1px solid ${COLORS.grayBorder}`,
              fontSize: 14,
            }}
          />
        </div>

        {erro && <div style={{ color: "#D32F2F", fontSize: 13 }}>{erro}</div>}
        {mensagem && <div style={{ color: COLORS.green, fontSize: 13 }}>{mensagem}</div>}

        <button
          onClick={salvar}
          disabled={carregando}
          style={{
            padding: "12px 20px",
            background: carregando ? COLORS.grayBorder : COLORS.green,
            color: COLORS.white,
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: carregando ? "default" : "pointer",
          }}
        >
          {carregando ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </div>
  );
}

export default PerfilPage;