import { Fragment, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "../api/client";
import { Badge, EmptyState, ErrorState, LoadingState } from "./Common";
import { statusLabel, statusTone } from "../utils/labels";
import { getErrorMessage } from "../api/client";
import type { TaskHistoryEntry, WorkItem } from "../types/api";
import {
  Arrow,
  Backdrop,
  Created,
  Modal,
  ModalBody,
  ModalClose,
  ModalHeader,
  MoreButton,
  Transition,
} from "./TaskHistoryModal.styles";

const COLLAPSED_HISTORY_LIMIT = 3;

interface TaskHistoryModalProps {
  task: Pick<WorkItem, 'id' | 'title'>;
  onClose: () => void;
}

export default function TaskHistoryModal({ task, onClose }: TaskHistoryModalProps) {
  const [entries, setEntries] = useState<TaskHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api.tasks.history(task.id);
      setEntries([...data].reverse());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsExpanded(false);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const hasHiddenEntries = entries.length > COLLAPSED_HISTORY_LIMIT;

  const hiddenEntriesCount = Math.max(
    entries.length - COLLAPSED_HISTORY_LIMIT,
    0,
  );

  const visibleEntries =
    isExpanded || !hasHiddenEntries
      ? entries
      : [...entries.slice(0, COLLAPSED_HISTORY_LIMIT - 1), entries.at(-1)];

  return createPortal(
    <Backdrop className="modal-backdrop" onClick={onClose}>
      <Modal
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Histórico de ${task.title}`}
        onClick={(event) => event.stopPropagation()}
      >
        <ModalHeader>
          <div>
            <span className="eyebrow">Histórico de status</span>
            <h3>{task.title}</h3>
          </div>
          <ModalClose
            type="button"
            className="modal-close"
            aria-label="Fechar"
            onClick={onClose}
          >
            ×
          </ModalClose>
        </ModalHeader>
        <ModalBody>
          {loading && <LoadingState message="Carregando histórico..." />}
          {!loading && error && <ErrorState message={error} onRetry={load} />}
          {!loading && !error && entries.length === 0 && (
            <EmptyState
              title="Sem alterações registradas"
              description="Esta tarefa ainda não teve mudanças de status."
            />
          )}
          {!loading && !error && entries.length > 0 && (
            <>
              <div className="compact-list">
                {visibleEntries.map((entry, index) => {
                  if (!entry) return null;
                  const isCreationEntry = index === visibleEntries.length - 1;

                  return (
                    <Fragment key={entry.id}>
                      {hasHiddenEntries && !isExpanded && isCreationEntry && (
                        <MoreButton
                          type="button"
                          className="history-more-indicator"
                          onClick={() => setIsExpanded(true)}
                          aria-label={`Ver mais ${hiddenEntriesCount} alterações`}
                        >
                          <span>
                            Ver mais {hiddenEntriesCount}{" "}
                            {hiddenEntriesCount === 1
                              ? "alteração"
                              : "alterações"}
                          </span>
                          <span aria-hidden="true">•••</span>
                        </MoreButton>
                      )}

                      <div className="compact-item">
                        <Transition>
                          {entry.fromStatus ? (
                            <Badge tone={statusTone(entry.fromStatus)}>
                              {statusLabel(entry.fromStatus)}
                            </Badge>
                          ) : (
                            <Created>Criada</Created>
                          )}

                          <Arrow aria-hidden="true">
                            →
                          </Arrow>

                          <Badge tone={statusTone(entry.toStatus)}>
                            {statusLabel(entry.toStatus)}
                          </Badge>
                        </Transition>

                        <span>{formatDateTime(entry.changedAt)}</span>
                      </div>
                    </Fragment>
                  );
                })}
              </div>
            </>
          )}
        </ModalBody>
      </Modal>
    </Backdrop>,
    document.body,
  );
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
