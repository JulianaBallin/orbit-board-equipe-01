import { NavLink } from "react-router-dom";
import orbitBoardLogo from "../assets/OrbitBoard-logo.svg";

const links = [
  { to: "/dashboard", label: "Visão geral", icon: "⌂" },
  { to: "/projects", label: "Projetos", icon: "◫" },
  { to: "/tasks", label: "Tarefas", icon: "✓" },
  { to: "/team", label: "Equipe", icon: "◎" },
];

export default function Layout({ children }) {
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

          <div className="environment-pill">API local</div>
        </header>

        {children}
      </main>
    </div>
  );
}
