import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { Tone } from "../../utils/labels";
import {
  Actions,
  Backdrop,
  ConfirmDetail,
  ConfirmMessage,
  ConfirmModal,
  ModalBody,
  ModalClose,
  ModalHeader,
} from "./ConfirmDialog.styles";

interface ConfirmDialogProps {
  title: string;
  message: string;
  detail?: string | null;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: Tone;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  detail,
  confirmLabel = "Excluir",
  cancelLabel = "Cancelar",
  tone = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return createPortal(
    <Backdrop className="modal-backdrop" onClick={onCancel}>
      <ConfirmModal
        className="modal confirm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event: React.MouseEvent<HTMLDivElement>): void => {
          event.stopPropagation();
        }}
      >
        <ModalHeader>
          <div>
            <span className="eyebrow">Confirmação</span>
            <h3>{title}</h3>
          </div>
          <ModalClose type="button" onClick={onCancel} aria-label="Fechar">
            ×
          </ModalClose>
        </ModalHeader>
        <ModalBody>
          <ConfirmMessage>{message}</ConfirmMessage>
          {detail && <ConfirmDetail>{detail}</ConfirmDetail>}
          <Actions>
            <button
              type="button"
              className="button secondary"
              onClick={onCancel}
              ref={cancelRef}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`button ${tone}`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </Actions>
        </ModalBody>
      </ConfirmModal>
    </Backdrop>,
    document.body,
  );
}
