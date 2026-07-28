import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Badge, EmptyState, ErrorState, LoadingState, Notice } from '../components/Common';
import TaskTable from '../components/TaskTable';
import TaskHistoryModal from '../components/TaskHistoryModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { priorityLabel, priorityTone, statusLabel } from '../utils/labels';

const initialFilters = { projectId: '', status: '', priority: '', assigneeId: '', search: '' };
const statuses = ['Backlog', 'InProgress', 'Review', 'Done'];

export default function TasksPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [viewMode, setViewMode] = useState('board');
  const [historyTask, setHistoryTask] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [dropTarget, setDropTarget] = useState('');
  const [confirmTarget, setConfirmTarget] = useState(null);

  const loadReferenceData = useCallback(async () => {
    setProjects(await api.projects.list());
  }, []);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setTasks(await api.tasks.list(filters));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadReferenceData().catch((err) => setError(err.message));
  }, [loadReferenceData]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const changeFilter = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const changeStatus = async (id, status) => {
    try {
      await api.tasks.changeStatus(id, status);
      await loadTasks();
    } catch (err) {
      await loadTasks();
      setError(err.message);
    }
  };

  const startDrag = (event, task) => {
    if (event.target.closest('button, select, input, textarea, label')) {
      event.preventDefault();
      return;
    }

    setDraggingId(task.id);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', task.id);
    event.dataTransfer.setDragImage(event.currentTarget, 24, 24);
  };

  const endDrag = () => {
    setDraggingId(null);
    setDropTarget('');
  };

  const allowDrop = (event, status) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDropTarget(status);
  };

  const leaveColumn = (event, status) => {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    setDropTarget((current) => (current === status ? '' : current));
  };

  const dropOnColumn = async (event, status) => {
    event.preventDefault();
    const id = event.dataTransfer.getData('text/plain') || draggingId;
    endDrag();

    const task = tasks.find((item) => item.id === id);
    if (!task || task.status === status) return;

    setTasks((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
    await changeStatus(id, status);
  };

  const confirmRemove = async () => {
    const task = confirmTarget;
    setConfirmTarget(null);
    try {
      await api.tasks.remove(task.id);
      setNotice('Tarefa excluída.');
      await loadTasks();
    } catch (err) {
      setError(err.message);
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
          {['Low', 'Medium', 'High', 'Critical'].map((priority) => (
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
            return (
              <section
                className={`task-column${dropTarget === status ? ' drop-target' : ''}`}
                key={status}
                onDragOver={(event) => allowDrop(event, status)}
                onDragLeave={(event) => leaveColumn(event, status)}
                onDrop={(event) => dropOnColumn(event, status)}
                aria-label={`Coluna ${statusLabel(status)}`}
              >
                <div className="column-header">
                  <h3>{statusLabel(status)}</h3>
                  <span>{columnTasks.length}</span>
                </div>
                {columnTasks.length === 0 && <EmptyState title="Sem tarefas" description="Nenhuma demanda neste estágio." />}
                {columnTasks.map((task) => (
                  <article
                    className={`task-card${draggingId === task.id ? ' dragging' : ''}`}
                    key={task.id}
                    draggable
                    onDragStart={(event) => startDrag(event, task)}
                    onDragEnd={endDrag}
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
                      <select value={task.status} onChange={(event) => changeStatus(task.id, event.target.value)}>
                        {statuses.map((value) => <option key={value} value={value}>{statusLabel(value)}</option>)}
                      </select>
                    </label>
                    <div className="card-actions">
                      <button
                        className="button secondary small"
                        onClick={() => navigate(`/tasks/${task.id}/edit`)}
                      >
                        Editar
                      </button>
                      <button className="button secondary small" onClick={() => setHistoryTask(task)}>Histórico</button>
                      <button className="button danger small" onClick={() => setConfirmTarget(task)}>Excluir</button>
                    </div>
                  </article>
                ))}
              </section>
            );
          })}
        </div>
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

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T00:00:00`));
}
