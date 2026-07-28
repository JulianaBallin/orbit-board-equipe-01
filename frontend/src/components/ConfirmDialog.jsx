import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function ConfirmDialog({
  title,
  message,
  detail,
  confirmLabel = 'Excluir',
  cancelLabel = 'Cancelar',
  tone = 'danger',
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onCancel();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return createPortal(
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal confirm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">Confirmação</span>
            <h3>{title}</h3>
          </div>
          <button type="button" className="modal-close" onClick={onCancel} aria-label="Fechar">
            ×
          </button>
        </div>
        <div className="modal-body">
          <p className="confirm-message">{message}</p>
          {detail && <p className="confirm-detail">{detail}</p>}
          <div className="form-actions">
            <button type="button" className="button secondary" onClick={onCancel} ref={cancelRef}>
              {cancelLabel}
            </button>
            <button type="button" className={`button ${tone}`} onClick={onConfirm}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
