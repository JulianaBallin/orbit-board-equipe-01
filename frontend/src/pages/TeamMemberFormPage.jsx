import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import TeamMemberForm from '../components/TeamMemberForm';
import { LoadingState } from '../components/Common';

export default function TeamMemberFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!isEditing) return;

    setLoading(true);
    try {
      const members = await api.team.list();
      setMember(members.find((item) => item.id === id) || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, isEditing]);

  useEffect(() => { load(); }, [load]);

  const save = async (data) => {
    setBusy(true);
    setError('');

    try {
      if (isEditing) {
        await api.team.update(id, data);
      } else {
        await api.team.create(data);
      }
      navigate('/team', { replace: true });
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
          <span className="eyebrow">Colaboração</span>
          <h2>{isEditing ? 'Editar colaborador' : 'Novo colaborador'}</h2>
          <p>
            {isEditing
              ? 'Atualize os dados do integrante da equipe.'
              : 'Cadastre um integrante para assumir projetos e tarefas.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="state-box error" role="alert">
          <div>
            <strong>
              {isEditing
                ? 'Não foi possível salvar as alterações.'
                : 'Não foi possível cadastrar o colaborador.'}
            </strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      <TeamMemberForm
        editing={member}
        onSubmit={save}
        onCancel={() => navigate('/team')}
        busy={busy}
      />
    </section>
  );
}
