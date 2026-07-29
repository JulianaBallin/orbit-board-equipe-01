import styled from 'styled-components';

export const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(240px, 1fr));
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 8px;
`;

export const Column = styled.section<{ $active: boolean }>`
  min-width: 245px;
  padding: 12px;
  border-radius: 15px;
  background: ${({ theme, $active }) => $active ? theme.colors.surfaceElevated : theme.colors.surfaceMuted};
  box-shadow: ${({ $active, theme }) => $active ? `inset 0 0 0 2px ${theme.colors.action}` : 'none'};
  transition: background ${({ theme }) => theme.motion.fast}, box-shadow ${({ theme }) => theme.motion.fast};
`;

export const ColumnHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 4px 12px;

  h3 {
    margin: 0;
    font-size: .95rem;
  }

  span {
    display: grid;
    min-width: 26px;
    height: 26px;
    place-items: center;
    border-radius: ${({ theme }) => theme.radius.pill};
    background: ${({ theme }) => theme.colors.surface};
    font-size: .75rem;
    font-weight: 800;
  }
`;

export const Placeholder = styled.div`
  height: 76px;
  margin-bottom: 10px;
  border: 2px dashed ${({ theme }) => theme.colors.action};
  border-radius: ${({ theme }) => theme.radius.large};
  background: ${({ theme }) => theme.colors.surfaceElevated};
`;
