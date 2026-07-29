import styled from 'styled-components';

export const Card = styled.article<{ $dragLayer?: boolean }>`
  padding: 15px;
  margin-bottom: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.large};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadow.surface};
  cursor: ${({ $dragLayer }) => $dragLayer ? 'grabbing' : 'grab'};
  user-select: none;

  ${({ $dragLayer }) => $dragLayer && `
    position: fixed;
    z-index: 1200;
    margin: 0;
    pointer-events: none;
    opacity: 1;
    transform: rotate(1.5deg);
  `}

  &:active {
    cursor: grabbing;
  }

  h4 {
    margin: 12px 0 6px;
  }

  p {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: .82rem;
    line-height: 1.45;
  }

  select,
  button,
  input {
    cursor: auto;
    user-select: auto;
  }

  button {
    cursor: pointer;
  }
`;

export const Topline = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: .76rem;
`;

export const Details = styled.div`
  display: grid;
  gap: 4px;
  margin: 13px 0;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: .72rem;
`;

export const InlineControl = styled.label`
  display: grid;
  gap: 6px;
  margin-bottom: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: .72rem;
  font-weight: 750;
`;
