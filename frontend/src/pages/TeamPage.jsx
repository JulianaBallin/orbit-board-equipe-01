import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { EmptyState, ErrorState, LoadingState, Notice } from '../components/Common';
import ConfirmDialog from '../components/ConfirmDialog';

export default function TeamPage() {
  const navigate = useNavigate();
  const [members, setMembers] = useState(null);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');
  const [confirmTarget, setConfirmTarget] = useState(null);

  const load = useCallback(async () => {
    setError('');
    try {
      setMembers(await api.team.list());
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const confirmRemove = async () => {
    const member = confirmTarget;
    setConfirmTarget(null);
    setActionError('');

    try {
      await api.team.remove(member.id);
      setNotice('Colaborador excluído.');
      await load();
    } catch (err) {
      setActionError(err.message);
    }
  };

  if (!members && !error) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Colaboração</span>
          <h2>Equipe</h2>
          <p>Profissionais disponíveis para assumir projetos e tarefas.</p>
        </div>
        <button type="button" className="button primary" onClick={() => navigate('/team/new')}>
          Novo colaborador
        </button>
      </div>

      {notice && <Notice onClose={() => setNotice('')}>{notice}</Notice>}

      {actionError && (
        <div className="state-box error" role="alert">
          <div>
            <strong>Não foi possível excluir o colaborador.</strong>
            <p>{actionError}</p>
          </div>
        </div>
      )}

      {members.length === 0 && (
        <EmptyState title="Nenhum colaborador" description="Cadastre o primeiro integrante da equipe." />
      )}

      <div className="team-grid">
        {members.map((member) => (
          <article className="member-card" key={member.id}>
            <div className="avatar">{member.initials}</div>
            <div className="member-body">
              <h3>{member.name}</h3>
              <strong>{member.role}</strong>
              <a href={`mailto:${member.email}`}>{member.email}</a>
              <div className="card-actions">
                <button
                  className="button secondary small"
                  onClick={() => navigate(`/team/${member.id}/edit`)}
                >
                  Editar
                </button>
                <button className="button danger small" onClick={() => setConfirmTarget(member)}>
                  Excluir
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {confirmTarget && (
        <ConfirmDialog
          title="Excluir colaborador"
          message={`Tem certeza que deseja excluir ${confirmTarget.name}?`}
          detail="Integrantes responsáveis por projetos ou atribuídos a tarefas não podem ser excluídos."
          confirmLabel="Excluir colaborador"
          onConfirm={confirmRemove}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </section>
  );
}
