import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import ProjectForm from '../components/ProjectForm';
import { Badge, EmptyState, ErrorState, LoadingState, Notice } from '../components/Common';
import { projectStatusLabel, projectStatusTone } from '../utils/labels';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [projectData, memberData] = await Promise.all([api.projects.list(), api.team()]);
      setProjects(projectData);
      setMembers(memberData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (data) => {
    setBusy(true);
    setError('');
    try {
      if (editing) {
        await api.projects.update(editing.id, data);
        setNotice('Projeto atualizado com sucesso.');
      } else {
        await api.projects.create(data);
        setNotice('Projeto criado com sucesso.');
      }
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (project) => {
    if (!window.confirm(`Excluir o projeto “${project.name}”?`)) return;
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
          <p>Cadastre iniciativas e acompanhe seu progresso.</p>
        </div>
      </div>

      {notice && <Notice onClose={() => setNotice('')}>{notice}</Notice>}
      {error && <ErrorState message={error} onRetry={load} />}

      <div className="two-column-layout">
        <ProjectForm
          members={members}
          editing={editing}
          onSubmit={save}
          onCancel={() => setEditing(null)}
          busy={busy}
        />

        <div className="cards-list">
          {projects.length === 0 && <EmptyState title="Nenhum projeto" description="Crie o primeiro projeto pelo formulário." />}
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
                  <button className="button secondary small" onClick={() => setEditing(project)}>Editar</button>
                  <button className="button danger small" onClick={() => remove(project)}>Excluir</button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T00:00:00`));
}
