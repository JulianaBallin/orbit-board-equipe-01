import styled from 'styled-components';
export { Backdrop, Modal, ModalHeader, ModalClose, ModalBody } from '../Modal.styles';

export const Transition = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const Arrow = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const Created = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: .78rem;
  font-weight: 700;
`;

export const MoreButton = styled.button`
  display: flex;
  width: 100%;
  padding: .45rem;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.small};
  color: ${({ theme }) => theme.colors.textMuted};
  background: transparent;
  font: inherit;
  font-size: .875rem;

  &:hover {
    border-color: ${({ theme }) => theme.colors.action};
    color: ${({ theme }) => theme.colors.action};
  }
`;
