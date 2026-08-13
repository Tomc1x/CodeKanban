import { RaysIcon, CrescentIcon } from "./icons";

interface NavProps {
  isDark: boolean;
  onToggleTheme: () => void;
  right?: React.ReactNode;
  children?: React.ReactNode;
}

export default function Nav({
  isDark,
  onToggleTheme,
  right,
  children,
}: NavProps) {
  return (
    <nav className="nav">
      {children}
      <span style={{ marginLeft: "auto", fontSize: 13 }}>{right}</span>
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
