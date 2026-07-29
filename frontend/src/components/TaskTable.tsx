import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Badge, EmptyState } from './Common';
import { priorityLabel, priorityTone, statusLabel } from '../utils/labels';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import type { WorkItem, WorkItemStatus } from '../types/api';

const MENU_GAP = 8;
const VIEWPORT_PADDING = 8;

interface TaskTableProps {
  tasks?: WorkItem[];
  statuses?: WorkItemStatus[];
  onStatusChange: (id: string, status: WorkItemStatus) => void;
  onEdit: (task: WorkItem) => void;
  onDelete: (task: WorkItem) => void;
  onViewHistory: (task: WorkItem) => void;
}

interface MenuPosition {
  left: number;
  maxHeight: number;
  maxWidth: number;
  minWidth: number;
  top: number;
}

export default function TaskTable({
  tasks = [],
  statuses = [],
  onStatusChange,
  onEdit,
  onDelete,
  onViewHistory,
}: TaskTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current || !menuRef.current) {
      return;
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - triggerRect.bottom - VIEWPORT_PADDING;
    const spaceAbove = triggerRect.top - VIEWPORT_PADDING;
    const openAbove = menuRect.height > spaceBelow && spaceAbove > spaceBelow;
    const availableHeight = Math.max(
      (openAbove ? spaceAbove : spaceBelow) - MENU_GAP,
      0,
    );

    const preferredTop = openAbove
      ? triggerRect.top - menuRect.height - MENU_GAP
      : triggerRect.bottom + MENU_GAP;
    const top = Math.max(
      VIEWPORT_PADDING,
      Math.min(
        preferredTop,
        window.innerHeight
          - Math.min(menuRect.height, availableHeight)
          - VIEWPORT_PADDING,
      ),
    );
    const left = Math.max(
      VIEWPORT_PADDING,
      Math.min(
        triggerRect.right - menuRect.width,
        window.innerWidth - menuRect.width - VIEWPORT_PADDING,
      ),
    );

    setMenuPosition({
      left,
      maxHeight: availableHeight,
      maxWidth: window.innerWidth - (VIEWPORT_PADDING * 2),
      minWidth: Math.max(140, triggerRect.width),
      top,
    });
  }, []);

  useLayoutEffect(() => {
    if (openMenuId !== null) {
      updateMenuPosition();
    }
  }, [openMenuId, updateMenuPosition]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target instanceof Node ? event.target : null;
      const clickedTrigger = target ? actionsRef.current?.contains(target) : false;
      const clickedMenu = target ? menuRef.current?.contains(target) : false;

      if (!clickedTrigger && !clickedMenu) {
        setOpenMenuId(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenMenuId(null);
      }
    }

    function handleViewportChange() {
      updateMenuPosition();
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [updateMenuPosition]);

  function handleAction(action: (task: WorkItem) => void, task: WorkItem) {
    setOpenMenuId(null);
    action(task);
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="Nenhuma tarefa encontrada"
        description="Ajuste os filtros ou crie uma nova tarefa."
      />
    );
  }

  const openTask = tasks.find((task) => task.id === openMenuId);

  return (
    <>
      <div className="task-table-container">
        <table className="task-table">
          <thead>
            <tr>
              <th scope="col">Tarefa</th>
              <th scope="col">Projeto</th>
              <th scope="col">Responsável</th>
              <th scope="col">Prioridade</th>
              <th scope="col">Prazo</th>
              <th scope="col">Estimativa</th>
              <th scope="col">Status</th>
              <th scope="col" className="task-table-actions-heading">Ações</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>
                  <strong className="task-table-title">{task.title}</strong>
                  {task.description && (
                    <span className="task-table-description">{task.description}</span>
                  )}
                </td>
                <td>{task.projectName || 'Sem projeto'}</td>
                <td>{task.assigneeName || 'Sem responsável'}</td>
                <td>
                  <Badge tone={priorityTone(task.priority)}>
                    {priorityLabel(task.priority)}
                  </Badge>
                </td>
                <td>{task.dueDate ? formatDate(task.dueDate) : 'Sem prazo'}</td>
                <td>{task.estimatedHours ? `${task.estimatedHours}h` : 'N/D'}</td>
                <td>
                  <select
                    className="task-table-status"
                    value={task.status}
                    onChange={(event) => onStatusChange(task.id, event.target.value as WorkItemStatus)}
                    aria-label={`Alterar status de ${task.title}`}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {statusLabel(status)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="task-table-actions-cell">
                  <div
                    className="task-table-actions"
                    ref={openMenuId === task.id ? actionsRef : null}
                  >
                    <button
                      type="button"
                      className="task-actions-trigger"
                      aria-label={`Abrir ações de ${task.title}`}
                      aria-haspopup="menu"
                      aria-expanded={openMenuId === task.id}
                      onClick={(event) => {
                        if (openMenuId === task.id) {
                          setOpenMenuId(null);
                          return;
                        }

                        triggerRef.current = event.currentTarget;
                        setMenuPosition(null);
                        setOpenMenuId(task.id);
                      }}
                    >
                      <span aria-hidden="true">•••</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openTask && createPortal(
        <div
          ref={menuRef}
          className="task-actions-menu"
          role="menu"
          style={{
            left: menuPosition?.left ?? 0,
            maxHeight: menuPosition?.maxHeight,
            maxWidth: menuPosition?.maxWidth,
            minWidth: menuPosition?.minWidth ?? 140,
            overflowY: 'auto',
            position: 'fixed',
            top: menuPosition?.top ?? 0,
            visibility: menuPosition ? 'visible' : 'hidden',
            zIndex: 1000,
          } satisfies CSSProperties}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => handleAction(onEdit, openTask)}
          >
            Editar
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => handleAction(onViewHistory, openTask)}
          >
            Histórico
          </button>
          <button
            type="button"
            role="menuitem"
            className="danger"
            onClick={() => handleAction(onDelete, openTask)}
          >
            Excluir
          </button>
        </div>,
        document.body,
      )}
    </>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T00:00:00`));
}
