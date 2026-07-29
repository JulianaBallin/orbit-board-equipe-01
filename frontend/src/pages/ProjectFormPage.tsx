import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, ApiError, getErrorMessage } from '../api/client';
import type { Project, ProjectMutation, TeamMember } from '../types/api';
import { Page } from './ProjectFormPage.styles';
import ProjectForm from '../components/ProjectForm';
import { ErrorState, LoadingState, NotFoundState } from '../components/Common';

export default function ProjectFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [project, setProject] = useState<Project | null>(null);
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
    setProject(null);

    try {
      const [memberData, projectData] = await Promise.all([
        api.team.list(),
        isEditing && id ? api.projects.get(id) : Promise.resolve(null)
      ]);
      setMembers(memberData);
      setProject(projectData);
    } catch (err) {
      if (isEditing && err instanceof ApiError && err.status === 404) {
        setNotFound(true);
      } else {
        setLoadError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }, [id, isEditing]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (data: ProjectMutation) => {
    setBusy(true);
    setSaveError('');

    try {
      if (isEditing) {
        await api.projects.update(id ?? '', data);
      } else {
        await api.projects.create(data);
      }
      navigate('/projects', { replace: true });
    } catch (err) {
      setSaveError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingState />;
  if (notFound) {
    return (
      <NotFoundState
        title="Projeto não encontrado."
        message="O projeto pode ter sido removido ou o endereço está incorreto."
        onBack={() => navigate('/projects', { replace: true })}
        backLabel="Voltar para projetos"
      />
    );
  }
  if (loadError) return <ErrorState message={loadError} onRetry={load} />;

  return (
    <Page className="page-stack">
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

      {saveError && (
        <ErrorState
          title="Não foi possível salvar o projeto."
          message={saveError}
        />
      )}

      <ProjectForm
        members={members}
        editing={project}
        onSubmit={save}
        onCancel={() => navigate('/projects')}
        busy={busy}
      />
    </Page>
  );
}
