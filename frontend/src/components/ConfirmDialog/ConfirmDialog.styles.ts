import styled from "styled-components";
export { Backdrop, ModalHeader, ModalClose, ModalBody } from "../Modal.styles";
import { Modal } from "../Modal.styles";

export const ConfirmModal = styled(Modal)`
  max-width: 430px;
`;

export const ConfirmMessage = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.55;
`;

export const ConfirmDetail = styled.p`
  margin: 10px 0 0;
  padding: 11px 13px;
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.status.warning.text};
  background: ${({ theme }) => theme.colors.status.warning.background};
  font-size: 0.82rem;
  line-height: 1.5;
`;

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
`;
