import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, getErrorMessage } from '../api/client';
import type { TeamMember, TeamMemberMutation } from '../types/api';
import TeamMemberForm from '../components/TeamMemberForm';
import { ErrorState, LoadingState, NotFoundState } from '../components/Common';

export default function TeamMemberFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [member, setMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(isEditing);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    if (!isEditing) return;

    setLoading(true);
    setLoadError('');
    setSaveError('');
    setNotFound(false);
    setMember(null);
    try {
      const members = await api.team.list();
      const selected = members.find((item) => item.id === id);
      if (!selected) {
        setNotFound(true);
        return;
      }
      setMember(selected);
    } catch (err) {
      setLoadError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id, isEditing]);

  useEffect(() => { load(); }, [load]);

  const save = async (data: TeamMemberMutation) => {
    setBusy(true);
    setSaveError('');

    try {
      if (isEditing) {
        await api.team.update(id ?? '', data);
      } else {
        await api.team.create(data);
      }
      navigate('/team', { replace: true });
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
        title="Integrante não encontrado."
        message="O integrante pode ter sido removido ou o endereço está incorreto."
        onBack={() => navigate('/team', { replace: true })}
        backLabel="Voltar para equipe"
      />
    );
  }
  if (loadError) return <ErrorState message={loadError} onRetry={load} />;

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

      {saveError && (
        <div className="state-box error" role="alert">
          <div>
            <strong>
              {isEditing
                ? 'Não foi possível salvar as alterações.'
                : 'Não foi possível cadastrar o colaborador.'}
            </strong>
            <p>{saveError}</p>
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
