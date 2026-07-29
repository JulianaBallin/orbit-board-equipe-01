import styled, { keyframes } from "styled-components";
import type { Tone } from "../../utils/labels";

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const StateBox = styled.div<{ $kind: "loading" | "error" | "empty" }>`
  display: flex;
  min-height: ${({ $kind }) => ($kind === "empty" ? "110px" : "auto")};
  padding: 18px;
  align-items: center;
  justify-content: ${({ $kind }) =>
    $kind === "error" ? "space-between" : "center"};
  flex-direction: ${({ $kind }) => ($kind === "empty" ? "column" : "row")};
  gap: 14px;
  border-radius: 14px;
  color: ${({ theme, $kind }) =>
    theme.colors.status[
      $kind === "loading" ? "info" : $kind === "error" ? "danger" : "neutral"
    ].text};
  background: ${({ theme, $kind }) =>
    theme.colors.status[
      $kind === "loading" ? "info" : $kind === "error" ? "danger" : "neutral"
    ].background};
  text-align: ${({ $kind }) => ($kind === "error" ? "left" : "center")};

  p {
    margin: 5px 0 0;
  }
`;

export const Spinner = styled.span`
  width: 18px;
  height: 18px;
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.action};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

export const Stat = styled.article`
  display: grid;
  gap: 7px;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.large};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadow.surface};

  span,
  small {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  strong {
    font-size: 2rem;
  }
`;

export const BadgeRoot = styled.span<{ $tone: Tone }>`
  display: inline-flex;
  padding: 5px 9px;
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ theme, $tone }) => theme.colors.status[$tone].text};
  background: ${({ theme, $tone }) => theme.colors.status[$tone].background};
  font-size: 0.72rem;
  font-weight: 800;
  white-space: nowrap;
`;

export const NoticeRoot = styled.div<{ $tone: Tone }>`
  display: flex;
  justify-content: space-between;
  padding: 13px 16px;
  border-radius: ${({ theme }) => theme.radius.medium};
  color: ${({ theme, $tone }) => theme.colors.status[$tone].text};
  background: ${({ theme, $tone }) => theme.colors.status[$tone].background};

  button {
    border: 0;
    color: inherit;
    background: transparent;
    font-size: 1.2rem;
  }
`;
