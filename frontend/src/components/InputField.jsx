import { useState } from "react";
import { COLORS } from "../styles/colors";
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
export default InputField;
