import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  :root {
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.background};
    font-synthesis: none;
    text-rendering: optimizeLegibility;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    min-width: 320px;
    min-height: 100vh;
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.background};
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
  }

  button {
    cursor: pointer;
  }

  a {
    color: inherit;
  }

  input,
  select,
  textarea {
    width: 100%;
    padding: 10px 11px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 10px;
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.surface};
  }

  input:focus,
  select:focus,
  textarea:focus {
    border-color: ${({ theme }) => theme.colors.action};
    outline: 3px solid ${({ theme }) => theme.colors.focus};
  }

  textarea {
    resize: vertical;
  }

  .page-stack {
    display: grid;
    min-width: 0;
    gap: 22px;
  }

  .section-heading {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    align-items: end;
  }

  .section-heading.compact {
    align-items: start;
  }

  .section-heading h2 {
    margin: 4px 0;
    font-size: 1.55rem;
  }

  .section-heading p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
  }

  .eyebrow {
    color: ${({ theme }) => theme.colors.action};
    font-size: .72rem;
    font-weight: 800;
    letter-spacing: .12em;
    text-transform: uppercase;
  }

  .button {
    padding: 10px 15px;
    border: 0;
    border-radius: 10px;
    font-weight: 750;
  }

  .button.primary {
    color: ${({ theme }) => theme.colors.textInverse};
    background: ${({ theme }) => theme.colors.action};
  }

  .button.secondary {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.surfaceMuted};
  }

  .button.danger {
    color: ${({ theme }) => theme.colors.status.danger.text};
    background: ${({ theme }) => theme.colors.status.danger.background};
  }

  .button.small {
    padding: 7px 11px;
    font-size: .78rem;
  }

  .button:disabled {
    cursor: not-allowed;
    opacity: .6;
  }

  .form-actions,
  .card-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .compact-list {
    display: grid;
  }

  .compact-item {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 0;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
  }

  .compact-item:first-child {
    border-top: 0;
  }

  body.is-dragging-task {
    cursor: grabbing;
    user-select: none;
  }

  @media (max-width: 760px) {
    .section-heading {
      align-items: start;
      flex-direction: column;
    }

    .section-heading > .card-actions {
      width: 100%;
      justify-content: space-between;
    }
  }
`;
