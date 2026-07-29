import styled from 'styled-components';

export const Switcher = styled.div`
  display: flex;
  gap: 4px;
  padding: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.medium};
  background: ${({ theme }) => theme.colors.surface};

  .button {
    min-width: 72px;
  }
`;
