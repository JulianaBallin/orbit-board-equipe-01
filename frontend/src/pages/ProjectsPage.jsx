import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Badge, EmptyState, ErrorState, LoadingState, Notice } from '../components/Common';
import { projectStatusLabel, projectStatusTone } from '../utils/labels';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setProjects(await api.projects.list());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (project) => {
    const pending = pendingTasks(project);
    if (pending > 0) {
      setError(`O projeto “${project.name}” possui ${pending} tarefa(s) não concluída(s) e não pode ser excluído.`);
      return;
    }

    const warning = project.totalTasks
      ? `Excluir o projeto “${project.name}”? As ${project.totalTasks} tarefa(s) concluída(s) também serão removidas.`
      : `Excluir o projeto “${project.name}”?`;
    if (!window.confirm(warning)) return;

    setError('');
    try {
      await api.projects.remove(project.id);
      setNotice('Projeto excluído.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Portfólio</span>
          <h2>Projetos</h2>
          <p>Acompanhe as iniciativas e o progresso das entregas.</p>
        </div>
        <button className="button primary" onClick={() => navigate('/projects/new')}>
          Novo projeto
        </button>
      </div>

      {notice && <Notice onClose={() => setNotice('')}>{notice}</Notice>}
      {error && <ErrorState message={error} onRetry={load} />}

      <div className="cards-list">
          {projects.length === 0 && <EmptyState title="Nenhum projeto" description="Crie o primeiro projeto para começar." />}
          {projects.map((project) => {
            const percent = project.totalTasks
              ? Math.round((project.completedTasks / project.totalTasks) * 100)
              : 0;
            return (
              <article className="project-card" key={project.id}>
                <div className="card-topline">
                  <Badge tone={projectStatusTone(project.status)}>{projectStatusLabel(project.status)}</Badge>
                  <span>{project.dueDate ? `Prazo ${formatDate(project.dueDate)}` : 'Sem prazo'}</span>
                </div>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <div className="project-meta">
                  <span>Responsável: <strong>{project.ownerName}</strong></span>
                  <span>{project.completedTasks}/{project.totalTasks} tarefas concluídas</span>
                </div>
                <div className="progress-track"><span style={{ width: `${percent}%` }} /></div>
                <div className="card-actions">
                  <button
                    className="button secondary small"
                    onClick={() => navigate(`/projects/${project.id}/edit`)}
                  >
                    Editar
                  </button>
                  <button
                    className="button danger small"
                    onClick={() => remove(project)}
                    disabled={pendingTasks(project) > 0}
                    title={
                      pendingTasks(project) > 0
                        ? 'Conclua todas as tarefas do projeto para poder excluí-lo.'
                        : 'Excluir projeto'
                    }
                  >
                    Excluir
                  </button>
                </div>
              </article>
            );
          })}
      </div>
    </section>
  );
}

function pendingTasks(project) {
  return Math.max(0, (project.totalTasks ?? 0) - (project.completedTasks ?? 0));
}

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T00:00:00`));
}
