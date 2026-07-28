import { useEffect, useState } from 'react';

const roles = [
  'Backend Developer',
  'Frontend Developer',
  'Full Stack Developer',
  'Product Designer',
  'Quality Analyst',
  'Tech Lead',
  'Product Owner',
  'Scrum Master'
];

const emptyForm = { name: '', role: roles[0], email: '' };

export default function TeamMemberForm({ editing, onSubmit, onCancel, busy }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!editing) return;
    setForm({
      name: editing.name,
      role: roles.includes(editing.role) ? editing.role : roles[0],
      email: editing.email
    });
  }, [editing]);

  const change = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = (event) => {
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
        <input name="name" value={form.name} onChange={change} minLength="3" maxLength="80" required />
      </label>

      <label>
        Cargo
        <select name="role" value={form.role} onChange={change} required>
          {roles.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </label>

      <label>
        Email
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={change}
          maxLength="120"
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
