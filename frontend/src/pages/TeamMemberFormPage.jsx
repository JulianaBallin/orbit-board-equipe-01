import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import TeamMemberForm from '../components/TeamMemberForm';

export default function TeamMemberFormPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = async (data) => {
    setBusy(true);
    setError('');

    try {
      await api.team.create(data);
      navigate('/team', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Colaboração</span>
          <h2>Novo colaborador</h2>
          <p>Cadastre um integrante para assumir projetos e tarefas.</p>
        </div>
      </div>

      {error && (
        <div className="state-box error" role="alert">
          <div>
            <strong>Não foi possível cadastrar o colaborador.</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      <TeamMemberForm onSubmit={save} onCancel={() => navigate('/team')} busy={busy} />
    </section>
  );
}
