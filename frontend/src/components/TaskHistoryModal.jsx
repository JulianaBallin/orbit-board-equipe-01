import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../api/client';
import { Badge, EmptyState, ErrorState, LoadingState } from './Common';
import { statusLabel, statusTone } from '../utils/labels';

export default function TaskHistoryModal({ task, onClose }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.tasks.history(task.id);
      setEntries([...data].reverse());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={`Histórico de ${task.title}`} onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="eyebrow">Histórico de status</span>
            <h3>{task.title}</h3>
          </div>
          <button type="button" className="modal-close" aria-label="Fechar" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {loading && <LoadingState message="Carregando histórico..." />}
          {!loading && error && <ErrorState message={error} onRetry={load} />}
          {!loading && !error && entries.length === 0 && (
            <EmptyState title="Sem alterações registradas" description="Esta tarefa ainda não teve mudanças de status." />
          )}
          {!loading && !error && entries.length > 0 && (
            <div className="compact-list">
              {entries.map((entry) => (
                <div className="compact-item" key={entry.id}>
                  <div className="history-transition">
                    {entry.fromStatus ? (
                      <Badge tone={statusTone(entry.fromStatus)}>{statusLabel(entry.fromStatus)}</Badge>
                    ) : (
                      <span className="history-created">Criada</span>
                    )}
                    <span className="history-arrow" aria-hidden="true">→</span>
                    <Badge tone={statusTone(entry.toStatus)}>{statusLabel(entry.toStatus)}</Badge>
                  </div>
                  <span>{formatDateTime(entry.changedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}
