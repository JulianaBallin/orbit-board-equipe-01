import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import orbitBoardLogo from "../assets/OrbitBoard-logo.svg";
import {
  getTheme,
  THEME_CHANGE_EVENT,
  toggleTheme,
} from "../services/themeService";

const links = [
  { to: "/dashboard", label: "Visão geral", icon: "⌂" },
  { to: "/projects", label: "Projetos", icon: "◫" },
  { to: "/tasks", label: "Tarefas", icon: "✓" },
  { to: "/team", label: "Equipe", icon: "◎" },
];

export default function Layout({ children }) {
  const [theme, setCurrentTheme] = useState(getTheme);

  useEffect(() => {
    const handleThemeChange = (event) => setCurrentTheme(event.detail.theme);

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    return () =>
      window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
  }, []);

  const isDarkTheme = theme === "dark";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <img
            src={orbitBoardLogo}
            alt=""
            className="brand-mark"
            aria-hidden="true"
          />

          <div className="brand-content">
            <strong>OrbitBoard</strong>
            <span>Workspace</span>
          </div>
        </div>

        <nav className="nav-list">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-note">
          <strong>Aplicação didática</strong>
          <p>
            Explore chamadas HTTP, estados de interface e tratamento de erros.
          </p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="eyebrow">Integração Full Stack</span>
            <h1>Central de trabalho</h1>
          </div>

          <div className="topbar-actions">
            <div className="environment-pill">API local</div>

            <button
              type="button"
              className="theme-toggle"
              aria-label={`Alterar para o tema ${isDarkTheme ? "claro" : "escuro"}`}
              title={`Alterar para o tema ${isDarkTheme ? "claro" : "escuro"}`}
              onClick={toggleTheme}
            >
              <span aria-hidden="true">{isDarkTheme ? "☀" : "☾"}</span>
            </button>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
