import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import ProjectForm from '../components/ProjectForm';
import { ErrorState, LoadingState } from '../components/Common';

export default function ProjectFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [members, setMembers] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [memberData, projectData] = await Promise.all([
        api.team(),
        isEditing ? api.projects.get(id) : Promise.resolve(null)
      ]);
      setMembers(memberData);
      setProject(projectData);
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
        await api.projects.update(id, data);
      } else {
        await api.projects.create(data);
      }
      navigate('/projects', { replace: true });
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
          <span className="eyebrow">Portfólio</span>
          <h2>{isEditing ? 'Editar projeto' : 'Novo projeto'}</h2>
          <p>
            {isEditing
              ? 'Atualize as informações da iniciativa.'
              : 'Preencha as informações para cadastrar uma iniciativa.'}
          </p>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      <ProjectForm
        members={members}
        editing={project}
        onSubmit={save}
        onCancel={() => navigate('/projects')}
        busy={busy}
      />
    </section>
  );
}
