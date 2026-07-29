import styled from "styled-components";

export const Backdrop = styled.div`
  position: fixed;
  z-index: 1100;
  inset: 0;
  display: grid;
  padding: 20px;
  place-items: center;
  background: ${({ theme }) => theme.colors.overlay};
`;

export const Modal = styled.div`
  display: flex;
  width: 100%;
  max-width: 480px;
  max-height: 20rem;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.large};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ theme }) => theme.shadow.overlay};
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 16px;
  padding: 20px 22px 0;

  h3 {
    margin: 4px 0 0;
    font-size: 1.15rem;
  }
`;

export const ModalClose = styled.button`
  padding: 4px;
  border: 0;
  color: ${({ theme }) => theme.colors.textMuted};
  background: transparent;
  font-size: 1.3rem;
  line-height: 1;
`;

export const ModalBody = styled.div`
  padding: 16px 22px 22px;
  overflow-y: auto;
`;
