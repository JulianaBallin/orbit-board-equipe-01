import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { api, getErrorMessage } from '../api/client';
import { Badge, EmptyState, ErrorState, LoadingState, Notice } from '../components/Common';
import TaskTable from '../components/TaskTable';
import TaskHistoryModal from '../components/TaskHistoryModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { priorityLabel, priorityTone, statusLabel } from '../utils/labels';
import { dropIndexFor, landingFor, reorder } from '../utils/boardDrop';
import type {
  Project,
  WorkItem,
  WorkItemFilters,
  WorkItemPriority,
  WorkItemStatus,
} from '../types/api';

const initialFilters: WorkItemFilters = {
  projectId: '',
  status: '',
  priority: '',
  assigneeId: '',
  search: '',
};
const statuses: WorkItemStatus[] = ['Backlog', 'InProgress', 'Review', 'Done'];
const DRAG_THRESHOLD = 6;

interface DragState {
  task: WorkItem;
  left: number;
  top: number;
  width: number;
  status: WorkItemStatus | null;
  index: number | null;
}

interface Landing {
  status: WorkItemStatus | null;
  index: number | null;
  position?: number | null;
}

export default function TasksPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<WorkItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filters, setFilters] = useState<WorkItemFilters>(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [historyTask, setHistoryTask] = useState<WorkItem | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<WorkItem | null>(null);
  const releaseDrag = useRef<(() => void) | null>(null);

  useEffect(() => () => releaseDrag.current?.(), []);

  const loadReferenceData = useCallback(async () => {
    setProjects(await api.projects.list());
  }, []);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setTasks(await api.tasks.list(filters));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadReferenceData().catch((err: unknown) => setError(getErrorMessage(err)));
  }, [loadReferenceData]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const changeFilter = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFilters((current) => ({
      ...current,
      [name]: name === 'status'
        ? value as WorkItemStatus | ''
        : name === 'priority'
          ? value as WorkItemPriority | ''
          : value,
    }));
  };

  const changeStatus = async (id: string, status: WorkItemStatus) => {
    try {
      await api.tasks.changeStatus(id, status);
      await loadTasks();
    } catch (err) {
      await loadTasks();
      setError(getErrorMessage(err));
    }
  };

  const locateDrop = (x: number, y: number, task: WorkItem): Landing => {
    const column = document.elementFromPoint(x, y)?.closest<HTMLElement>('.task-column');
    if (!column) return { status: null, index: null, position: null };

    if (!(column instanceof HTMLElement)) return { status: null, index: null, position: null };
    const status = column.dataset.status as WorkItemStatus | undefined;
    if (!status) return { status: null, index: null, position: null };
    const cards = Array.from(column.querySelectorAll<HTMLElement>('.task-card'))
      .filter((element) => element.dataset.taskId !== task.id);
    const dropIndex = dropIndexFor(cards.map((element) => element.getBoundingClientRect()), y);
    const columnTasks = tasks.filter((item) => item.status === status && item.id !== task.id);
    const landing = landingFor(columnTasks, dropIndex, task.priority);

    return { status, index: landing.index, position: landing.position };
  };

  const beginDrag = (event: ReactPointerEvent<HTMLElement>, task: WorkItem) => {
    if (event.button !== 0) return;
    if (event.target instanceof Element && event.target.closest('button, select, input, textarea, label, a')) return;

    const box = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - box.left;
    const offsetY = event.clientY - box.top;
    const startX = event.clientX;
    const startY = event.clientY;

    let moving = false;
    let landing: Landing = { status: task.status, index: null, position: task.position };

    const onMove = (moveEvent: PointerEvent) => {
      if (!moving) {
        const travelled = Math.abs(moveEvent.clientX - startX) + Math.abs(moveEvent.clientY - startY);
        if (travelled < DRAG_THRESHOLD) return;
        moving = true;
        document.body.classList.add('is-dragging-task');
      }

      landing = locateDrop(moveEvent.clientX, moveEvent.clientY, task);
      setDrag({
        task,
        left: moveEvent.clientX - offsetX,
        top: moveEvent.clientY - offsetY,
        width: box.width,
        status: landing.status,
        index: landing.index,
      });
    };

    const applyLanding = () => {
      if (!landing.status || landing.index === null) return;
      const columnTasks = tasks.filter((item) => item.status === landing.status);
      const from = columnTasks.findIndex((item) => item.id === task.id);
      const others = tasks.filter((item) => item.status !== landing.status);
      const moved: WorkItem = { ...task, status: landing.status };
      const target = from >= 0
        ? reorder(columnTasks, from, landing.index > from ? landing.index + 1 : landing.index)
        : [...columnTasks.slice(0, landing.index), moved, ...columnTasks.slice(landing.index)];

      setTasks([...others, ...target.map((item) => (item.id === task.id ? moved : item))]);
    };

    const detach = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      document.body.classList.remove('is-dragging-task');
      releaseDrag.current = null;
    };

    const onUp = async () => {
      detach();
      setDrag(null);

      if (!moving || !landing.status) return;
      if (landing.status === task.status && landing.position === task.position) return;
      if (landing.position === null || landing.position === undefined) return;

      applyLanding();
      try {
        await api.tasks.move(task.id, landing.status, landing.position);
        await loadTasks();
      } catch (err) {
        await loadTasks();
        setError(getErrorMessage(err));
      }
    };

    releaseDrag.current = detach;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const renderCard = (task: WorkItem) => (
    <article
      className="task-card"
      key={task.id}
      data-task-id={task.id}
      onPointerDown={(event) => beginDrag(event, task)}
      title="Arraste para mover a tarefa de estágio"
    >
      <div className="card-topline">
        <Badge tone={priorityTone(task.priority)}>{priorityLabel(task.priority)}</Badge>
        <span>{task.dueDate ? formatDate(task.dueDate) : 'Sem prazo'}</span>
      </div>
      <h4>{task.title}</h4>
      <p>{task.description}</p>
      <div className="task-details">
        <span>{task.projectName}</span>
        <span>{task.assigneeName || 'Sem responsável'}</span>
        <span>{task.estimatedHours}h estimadas</span>
      </div>
      <label className="inline-control">
        Mover para
        <select value={task.status} onChange={(event) => changeStatus(task.id, event.target.value as WorkItemStatus)}>
          {statuses.map((value) => <option key={value} value={value}>{statusLabel(value)}</option>)}
        </select>
      </label>
      <div className="card-actions">
        <button className="button secondary small" onClick={() => navigate(`/tasks/${task.id}/edit`)}>
          Editar
        </button>
        <button className="button secondary small" onClick={() => setHistoryTask(task)}>Histórico</button>
        <button className="button danger small" onClick={() => setConfirmTarget(task)}>Excluir</button>
      </div>
    </article>
  );

  const confirmRemove = async () => {
    const task = confirmTarget;
    setConfirmTarget(null);
    if (!task) return;
    try {
      await api.tasks.remove(task.id);
      setNotice('Tarefa excluída.');
      await loadTasks();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Execução</span>
          <h2>Tarefas</h2>
          <p>Filtre, crie e arraste as demandas entre os estágios do fluxo.</p>
        </div>
        <div className="card-actions">
          <div className="view-switcher" role="group" aria-label="Visualização das tarefas">
            <button
              type="button"
              className={`button small ${viewMode === 'board' ? 'primary' : 'secondary'}`}
              onClick={() => setViewMode('board')}
              aria-pressed={viewMode === 'board'}
            >
              Quadro
            </button>
            <button
              type="button"
              className={`button small ${viewMode === 'table' ? 'primary' : 'secondary'}`}
              onClick={() => setViewMode('table')}
              aria-pressed={viewMode === 'table'}
            >
              Tabela
            </button>
          </div>
          <button type="button" className="button primary" onClick={() => navigate('/tasks/new')}>
            Nova tarefa
          </button>
        </div>
      </div>

      {notice && <Notice onClose={() => setNotice('')}>{notice}</Notice>}
      {error && <ErrorState message={error} onRetry={loadTasks} />}

      <div className="filter-panel">
        <input name="search" value={filters.search} onChange={changeFilter} placeholder="Buscar por título ou descrição" />
        <select name="projectId" value={filters.projectId} onChange={changeFilter}>
          <option value="">Todos os projetos</option>
          {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
        </select>
        <select name="status" value={filters.status} onChange={changeFilter}>
          <option value="">Todos os status</option>
          {statuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
        </select>
        <select name="priority" value={filters.priority} onChange={changeFilter}>
          <option value="">Todas as prioridades</option>
          {(['Low', 'Medium', 'High', 'Critical'] satisfies WorkItemPriority[]).map((priority) => (
            <option key={priority} value={priority}>{priorityLabel(priority)}</option>
          ))}
        </select>
        <button type="button" className="button secondary" onClick={() => setFilters(initialFilters)}>Limpar filtros</button>
      </div>

      {loading ? <LoadingState /> : viewMode === 'table' ? (
        <TaskTable
          tasks={tasks}
          statuses={statuses}
          onEdit={(task) => navigate(`/tasks/${task.id}/edit`)}
          onDelete={setConfirmTarget}
          onStatusChange={changeStatus}
          onViewHistory={setHistoryTask}
        />
      ) : (
        <div className="task-board">
          {statuses.map((status) => {
            const columnTasks = tasks.filter((task) => task.status === status);
            const active = drag?.status === status;
            return (
              <section
                className={`task-column${active ? ' drop-target' : ''}`}
                key={status}
                data-status={status}
                aria-label={`Coluna ${statusLabel(status)}`}
              >
                <div className="column-header">
                  <h3>{statusLabel(status)}</h3>
                  <span>{columnTasks.length}</span>
                </div>
                {columnTasks.length === 0 && <EmptyState title="Sem tarefas" description="Nenhuma demanda neste estágio." />}
                {columnTasks
                  .filter((task) => task.id !== drag?.task.id)
                  .flatMap((task, position) => [
                    active && drag?.index === position
                      ? <div className="drop-placeholder" key={`slot-${position}`} />
                      : null,
                    renderCard(task),
                  ])
                  .filter(Boolean)}
                {active && drag?.index !== null && drag.index >= columnTasks.filter((task) => task.id !== drag.task.id).length && (
                  <div className="drop-placeholder" />
                )}
              </section>
            );
          })}
        </div>
      )}

      {drag && createPortal(
        <div
          className="task-card drag-layer"
          style={{ left: `${drag.left}px`, top: `${drag.top}px`, width: `${drag.width}px` }}
        >
          <div className="card-topline">
            <Badge tone={priorityTone(drag.task.priority)}>{priorityLabel(drag.task.priority)}</Badge>
            <span>{drag.task.dueDate ? formatDate(drag.task.dueDate) : 'Sem prazo'}</span>
          </div>
          <h4>{drag.task.title}</h4>
          <p>{drag.task.description}</p>
          <div className="task-details">
            <span>{drag.task.projectName}</span>
            <span>{drag.task.assigneeName || 'Sem responsável'}</span>
            <span>{drag.task.estimatedHours}h estimadas</span>
          </div>
        </div>,
        document.body,
      )}

      {historyTask && (
        <TaskHistoryModal task={historyTask} onClose={() => setHistoryTask(null)} />
      )}

      {confirmTarget && (
        <ConfirmDialog
          title="Excluir tarefa"
          message={`Tem certeza que deseja excluir a tarefa “${confirmTarget.title}”?`}
          detail="Esta ação não pode ser desfeita e o histórico de status da tarefa também será removido."
          confirmLabel="Excluir tarefa"
          onConfirm={confirmRemove}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </section>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T00:00:00`));
}
