import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Badge, EmptyState, ErrorState, LoadingState, Notice } from '../components/Common';
import TaskTable from '../components/TaskTable';
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
      setError(err.message);
    }
  };

  const remove = async (task) => {
    if (!window.confirm(`Excluir a tarefa “${task.title}”?`)) return;
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
          <p>Filtre, crie e mova demandas entre os estágios do fluxo.</p>
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
          onDelete={remove}
          onStatusChange={changeStatus}
        />
      ) : (
        <div className="task-board">
          {statuses.map((status) => {
            const columnTasks = tasks.filter((task) => task.status === status);
            return (
              <section className="task-column" key={status}>
                <div className="column-header">
                  <h3>{statusLabel(status)}</h3>
                  <span>{columnTasks.length}</span>
                </div>
                {columnTasks.length === 0 && <EmptyState title="Sem tarefas" description="Nenhuma demanda neste estágio." />}
                {columnTasks.map((task) => (
                  <article className="task-card" key={task.id}>
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
                      <button className="button danger small" onClick={() => remove(task)}>Excluir</button>
                    </div>
                  </article>
                ))}
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T00:00:00`));
}
