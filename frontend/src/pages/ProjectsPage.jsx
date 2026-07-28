import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Badge, EmptyState, ErrorState, LoadingState, Notice } from '../components/Common';
import ConfirmDialog from '../components/ConfirmDialog';
import { projectStatusLabel, projectStatusTone } from '../utils/labels';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [confirmTarget, setConfirmTarget] = useState(null);

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

  const askRemove = (project) => {
    const pending = pendingTasks(project);
    if (pending > 0) {
      setError(`O projeto “${project.name}” possui ${pending} tarefa(s) não concluída(s) e não pode ser excluído.`);
      return;
    }

    setConfirmTarget(project);
  };

  const confirmRemove = async () => {
    const project = confirmTarget;
    setConfirmTarget(null);
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
                    onClick={() => askRemove(project)}
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

      {confirmTarget && (
        <ConfirmDialog
          title="Excluir projeto"
          message={`Tem certeza que deseja excluir o projeto “${confirmTarget.name}”?`}
          detail={
            confirmTarget.totalTasks
              ? `As ${confirmTarget.totalTasks} tarefa(s) concluída(s) deste projeto também serão removidas.`
              : null
          }
          confirmLabel="Excluir projeto"
          onConfirm={confirmRemove}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </section>
  );
}

function pendingTasks(project) {
  return Math.max(0, (project.totalTasks ?? 0) - (project.completedTasks ?? 0));
}

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T00:00:00`));
}
