import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { TeamMember, TeamMemberMutation } from '../types/api';

const roles = [
  'Backend Developer',
  'Frontend Developer',
  'Full Stack Developer',
  'Product Designer',
  'Quality Analyst',
  'Tech Lead',
  'Product Owner',
  'Scrum Master'
] as const;

interface TeamMemberFormState {
  name: string;
  role: string;
  email: string;
}

const emptyForm: TeamMemberFormState = { name: '', role: roles[0], email: '' };

interface TeamMemberFormProps {
  editing: TeamMember | null;
  onSubmit: (data: TeamMemberMutation) => Promise<void>;
  onCancel: () => void;
  busy: boolean;
}

export default function TeamMemberForm({ editing, onSubmit, onCancel, busy }: TeamMemberFormProps) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!editing) return;
    setForm({
      name: editing.name,
      role: editing.role,
      email: editing.email
    });
  }, [editing]);

  const roleOptions: readonly string[] = roles.some((role) => role === form.role)
    ? roles
    : [form.role, ...roles];

  const change = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      name: form.name.trim(),
      role: form.role.trim(),
      email: form.email.trim()
    });
  };

  return (
    <form className="form-card" onSubmit={submit}>
      <div className="section-heading compact">
        <div>
          <span className="eyebrow">{editing ? 'Edição' : 'Novo registro'}</span>
          <h2>{editing ? 'Editar colaborador' : 'Cadastrar colaborador'}</h2>
        </div>
      </div>

      <label>
        Nome
        <input name="name" value={form.name} onChange={change} minLength={3} maxLength={80} required />
      </label>

      <label>
        Cargo
        <select name="role" value={form.role} onChange={change} required>
          {roleOptions.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </label>

      <label>
        Email
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={change}
          maxLength={120}
          required
        />
      </label>

      <p className="form-hint">As iniciais do avatar são geradas a partir do nome informado.</p>

      <div className="form-actions">
        <button type="button" className="button secondary" onClick={onCancel} disabled={busy}>
          Cancelar
        </button>
        <button type="submit" className="button primary" disabled={busy}>
          {busy ? 'Salvando...' : editing ? 'Salvar alterações' : 'Cadastrar colaborador'}
        </button>
      </div>
    </form>
  );
}
