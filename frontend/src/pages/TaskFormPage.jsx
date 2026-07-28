import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import TaskForm from '../components/TaskForm';
import { ErrorState, LoadingState } from '../components/Common';

export default function TaskFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [projectData, memberData, taskData] = await Promise.all([
        api.projects.list(),
        api.team.list(),
        isEditing ? api.tasks.get(id) : Promise.resolve(null)
      ]);
      setProjects(projectData);
      setMembers(memberData);
      setTask(taskData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, isEditing]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (data) => {
    setBusy(true);
    setError('');

    try {
      if (isEditing) {
        await api.tasks.update(id, data);
      } else {
        await api.tasks.create(data);
      }
      navigate('/tasks', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Execução</span>
          <h2>{isEditing ? 'Editar tarefa' : 'Nova tarefa'}</h2>
          <p>
            {isEditing
              ? 'Atualize as informações da demanda.'
              : 'Preencha as informações para cadastrar uma demanda.'}
          </p>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      <TaskForm
        projects={projects}
        members={members}
        editing={task}
        onSubmit={save}
        onCancel={() => navigate('/tasks')}
        busy={busy}
      />
    </section>
  );
}
