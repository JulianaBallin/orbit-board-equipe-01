import styled from 'styled-components';

export const Container = styled.div`
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.large};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadow.surface};
`;

export const Table = styled.table`
  width: 100%;
  min-width: 1050px;
  border-collapse: collapse;

  th,
  td {
    padding: 14px 16px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    text-align: left;
    vertical-align: middle;
  }

  th {
    color: ${({ theme }) => theme.colors.textMuted};
    background: ${({ theme }) => theme.colors.surfaceMuted};
    font-size: .7rem;
    font-weight: 800;
    letter-spacing: .06em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }

  tbody tr:hover {
    background: ${({ theme }) => theme.colors.surfaceMuted};
  }

  .task-table-title,
  .task-table-description {
    display: block;
  }

  .task-table-title {
    margin-bottom: 4px;
    color: ${({ theme }) => theme.colors.text};
    font-size: .88rem;
  }

  .task-table-description {
    max-width: 300px;
    overflow: hidden;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: .76rem;
    line-height: 1.4;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .task-table-status {
    min-width: 138px;
    padding: 8px 10px;
    font-size: .78rem;
  }

  .task-table-actions-heading,
  .task-table-actions-cell {
    text-align: right;
  }
`;

export const Actions = styled.div`
  position: relative;
  display: inline-flex;
  justify-content: flex-end;
`;

export const ActionsTrigger = styled.button`
  display: inline-grid;
  width: 34px;
  height: 34px;
  padding: 0;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.small};
  color: ${({ theme }) => theme.colors.textMuted};
  background: ${({ theme }) => theme.colors.surface};
  font: inherit;
  font-weight: 800;
  letter-spacing: 1px;

  &:hover,
  &[aria-expanded="true"] {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.surfaceMuted};
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.focus};
    outline-offset: 2px;
  }
`;

export const ActionsMenu = styled.div`
  display: grid;
  min-width: 140px;
  padding: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ theme }) => theme.shadow.overlay};

  button {
    width: 100%;
    padding: 9px 10px;
    border: 0;
    border-radius: 7px;
    color: ${({ theme }) => theme.colors.text};
    background: transparent;
    font: inherit;
    font-size: .8rem;
    font-weight: 700;
    text-align: left;
  }

  button:hover,
  button:focus-visible {
    outline: none;
    background: ${({ theme }) => theme.colors.surfaceMuted};
  }

  button.danger {
    color: ${({ theme }) => theme.colors.status.danger.text};
  }
`;
