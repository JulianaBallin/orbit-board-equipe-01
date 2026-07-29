import type { ReactNode } from "react";
import orbitBoardLogo from "../../assets/OrbitBoard-logo.svg";
import { useAppTheme } from "../../theme/ThemeProvider";
import {
  Brand,
  Environment,
  Main,
  Navigation,
  NavigationLink,
  NavIcon,
  Shell,
  Sidebar,
  SidebarNote,
  ThemeToggle,
  Topbar,
  TopbarActions,
} from "./Layout.styles";

const links = [
  { to: "/dashboard", label: "Visão geral", icon: "⌂" },
  { to: "/projects", label: "Projetos", icon: "◫" },
  { to: "/tasks", label: "Tarefas", icon: "✓" },
  { to: "/team", label: "Equipe", icon: "◎" },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { resolvedTheme, toggleTheme } = useAppTheme();
  const isDarkTheme = resolvedTheme === "dark";

  return (
    <Shell>
      <Sidebar>
        <Brand>
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
        </Brand>

        <Navigation>
          {links.map((link) => (
            <NavigationLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <NavIcon>{link.icon}</NavIcon>
              {link.label}
            </NavigationLink>
          ))}
        </Navigation>

        <SidebarNote>
          <strong>Aplicação didática</strong>
          <p>
            Explore chamadas HTTP, estados de interface e tratamento de erros.
          </p>
        </SidebarNote>
      </Sidebar>

      <Main>
        <Topbar>
          <div>
            <span className="eyebrow">Integração Full Stack</span>
            <h1>Central de trabalho</h1>
          </div>

          <TopbarActions>
            <Environment>API local</Environment>

            <ThemeToggle
              type="button"
              className="theme-toggle"
              aria-label={`Alterar para o tema ${isDarkTheme ? "claro" : "escuro"}`}
              title={`Alterar para o tema ${isDarkTheme ? "claro" : "escuro"}`}
              onClick={toggleTheme}
            >
              <span aria-hidden="true">{isDarkTheme ? "☀" : "☾"}</span>
            </ThemeToggle>
          </TopbarActions>
        </Topbar>

        {children}
      </Main>
    </Shell>
  );
}
