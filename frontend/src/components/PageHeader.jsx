import { COLORS } from "../styles/colors";
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
export default PageHeader;
