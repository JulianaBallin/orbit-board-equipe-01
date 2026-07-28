import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import TaskForm from '../components/TaskForm';
import { Badge, EmptyState, ErrorState, LoadingState, Notice } from '../components/Common';
import { priorityLabel, priorityTone, statusLabel, statusTone } from '../utils/labels';

const initialFilters = { projectId: '', status: '', priority: '', assigneeId: '', search: '' };
const statuses = ['Backlog', 'InProgress', 'Review', 'Done'];

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState(null);

  const loadReferenceData = useCallback(async () => {
    const [projectData, memberData] = await Promise.all([api.projects.list(), api.team()]);
    setProjects(projectData);
    setMembers(memberData);
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

  const save = async (data) => {
    setBusy(true);
    setError('');
    try {
      if (editing) {
        await api.tasks.update(editing.id, data);
        setNotice('Tarefa atualizada com sucesso.');
      } else {
        await api.tasks.create(data);
        setNotice('Tarefa criada com sucesso.');
      }
      setEditing(null);
      await loadTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
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
        <button className="button secondary" onClick={() => setFilters(initialFilters)}>Limpar filtros</button>
      </div>

      <TaskForm
        projects={projects}
        members={members}
        editing={editing}
        onSubmit={save}
        onCancel={() => setEditing(null)}
        busy={busy}
      />

      {loading ? <LoadingState /> : (
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
                      <button className="button secondary small" onClick={() => setEditing(task)}>Editar</button>
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
