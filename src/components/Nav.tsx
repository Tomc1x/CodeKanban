import { RaysIcon, CrescentIcon } from "./icons";
import logo from "../assets/logo.png";

interface NavProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onBrandClick?: () => void;
  right?: React.ReactNode;
  children?: React.ReactNode;
}

export default function Nav({
  isDark,
  onToggleTheme,
  onBrandClick,
  right,
  children,
}: NavProps) {
  return (
    <nav className="nav">
      <span
        className="nav-brand"
        style={onBrandClick ? { cursor: "pointer" } : undefined}
        onClick={onBrandClick}
      >
        <img src={logo} alt="CodeKanban" className="nav-logo" />
      </span>
      {children}
      <span
        style={{
          marginLeft: children ? undefined : "auto",
          fontSize: 13,
          opacity: 0.6,
        }}
      >
        {right}
      </span>
      <button
        type="button"
        className="btn btn-ghost btn-icon"
        style={{ width: 32, height: 32 }}
        title="Basculer clair/sombre"
        onClick={onToggleTheme}
      >
        {isDark ? <RaysIcon /> : <CrescentIcon />}
      </button>
    </nav>
  );
}
