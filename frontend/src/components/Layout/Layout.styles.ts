import styled from "styled-components";
import { NavLink } from "react-router-dom";

export const Shell = styled.div`
  display: grid;
  min-height: 100vh;
  grid-template-columns: 250px minmax(0, 1fr);

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const Sidebar = styled.aside`
  position: relative;
  z-index: 1;
  display: flex;
  padding: 28px 20px;
  flex-direction: column;
  gap: 32px;
  color: ${({ theme }) => theme.colors.textInverse};
  background: ${({ theme }) => theme.colors.sidebar};

  @media (max-width: 760px) {
    padding: 18px;
    gap: 18px;
  }
`;

export const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  img {
    width: 3rem;
    height: 3rem;
    border-radius: 14px;
    background: ${({ theme }) => theme.colors.surface};
  }

  strong,
  span {
    display: block;
  }

  span {
    margin-top: 2px;
    color: ${({ theme }) => theme.colors.sidebarText};
    font-size: 0.8rem;
  }
`;

export const Navigation = styled.nav`
  display: grid;
  gap: 8px;

  @media (max-width: 760px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

export const NavigationLink = styled(NavLink)`
  display: flex;
  padding: 12px 14px;
  align-items: center;
  gap: 12px;
  border-radius: ${({ theme }) => theme.radius.medium};
  color: ${({ theme }) => theme.colors.sidebarText};
  text-decoration: none;

  &:hover,
  &.active {
    color: ${({ theme }) => theme.colors.textInverse};
    background: ${({ theme }) => theme.colors.sidebarSurface};
  }

  @media (max-width: 760px) {
    justify-content: center;
    padding: 9px 5px;
    font-size: 0.72rem;
  }
`;

export const NavIcon = styled.span`
  width: 24px;
  text-align: center;

  @media (max-width: 760px) {
    display: none;
  }
`;

export const SidebarNote = styled.div`
  margin-top: auto;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.sidebarSurface};

  p {
    margin-bottom: 0;
    color: ${({ theme }) => theme.colors.sidebarText};
    font-size: 0.82rem;
    line-height: 1.5;
  }

  @media (max-width: 760px) {
    display: none;
  }
`;

export const Main = styled.main`
  min-width: 0;
  padding: 30px 38px 60px;
  overflow: hidden;

  @media (max-width: 760px) {
    padding: 22px 16px 40px;
  }
`;

export const Topbar = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;

  h1 {
    margin: 3px 0 0;
    font-size: 1.8rem;
  }

  @media (max-width: 760px) {
    align-items: start;
  }
`;

export const TopbarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const Environment = styled.div`
  padding: 9px 14px;
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ theme }) => theme.colors.status.success.text};
  background: ${({ theme }) => theme.colors.status.success.background};
  font-size: 0.8rem;
  font-weight: 700;

  @media (max-width: 760px) {
    display: none;
  }
`;

export const ThemeToggle = styled.button`
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadow.surface};
  font-size: 1.25rem;
  transition: transform ${({ theme }) => theme.motion.fast};

  &:hover {
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.focus};
    outline-offset: 3px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;
