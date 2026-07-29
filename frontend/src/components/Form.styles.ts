import styled from "styled-components";

export const FormCard = styled.form`
  position: sticky;
  top: 20px;
  display: grid;
  gap: 15px;
  padding: 22px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.large};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadow.surface};

  > label {
    display: grid;
    gap: 7px;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.82rem;
    font-weight: 750;
  }

  @media (max-width: 1100px) {
    position: static;
  }
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 13px;

  label {
    display: grid;
    gap: 7px;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.82rem;
    font-weight: 750;
  }

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const FormHint = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.78rem;
`;
