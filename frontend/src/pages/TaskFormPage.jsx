import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import TaskForm from '../components/TaskForm';
import { ErrorState, LoadingState, NotFoundState } from '../components/Common';

export default function TaskFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    setSaveError('');
    setNotFound(false);
    setTask(null);

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
      if (isEditing && err.status === 404) {
        setNotFound(true);
      } else {
        setLoadError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [id, isEditing]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (data) => {
    setBusy(true);
    setSaveError('');

    try {
      if (isEditing) {
        await api.tasks.update(id, data);
      } else {
        await api.tasks.create(data);
      }
      navigate('/tasks', { replace: true });
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingState />;
  if (notFound) {
    return (
      <NotFoundState
        title="Tarefa não encontrada."
        message="A tarefa pode ter sido removida ou o endereço está incorreto."
        onBack={() => navigate('/tasks', { replace: true })}
        backLabel="Voltar para tarefas"
      />
    );
  }
  if (loadError) return <ErrorState message={loadError} onRetry={load} />;

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

      {saveError && (
        <ErrorState
          title="Não foi possível salvar a tarefa."
          message={saveError}
        />
      )}

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
