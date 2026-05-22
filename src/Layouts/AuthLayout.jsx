import logoImg from "../assets/Ewaister.png";
import { COLORS } from "../styles/colors";

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
      <div
  style={{
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: COLORS.grayLight,
    padding: "40px",
    position: "relative",
    overflow: "hidden",
  }}
>
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage: 'url("/brick-wall.jpg")',
      backgroundSize: "cover",
      backgroundPosition: "center",
      opacity: 0.18,
      filter: "grayscale(100%) contrast(95%) brightness(102%)",
      pointerEvents: "none",
    }}
  />

  <div
    style={{
      width: "100%",
      maxWidth: 400,
      position: "relative",
      zIndex: 1,
    }}
  >
    {children}
  </div>
</div>
    </div>
  );
}

export default AuthLayout;