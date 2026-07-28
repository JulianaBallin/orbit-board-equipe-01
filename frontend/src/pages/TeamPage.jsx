import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { ErrorState, LoadingState } from '../components/Common';

export default function TeamPage() {
  const [members, setMembers] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setMembers(await api.team.list());
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

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
      </div>

      <div className="team-grid">
        {members.map((member) => (
          <article className="member-card" key={member.id}>
            <div className="avatar">{member.initials}</div>
            <div>
              <h3>{member.name}</h3>
              <strong>{member.role}</strong>
              <a href={`mailto:${member.email}`}>{member.email}</a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
