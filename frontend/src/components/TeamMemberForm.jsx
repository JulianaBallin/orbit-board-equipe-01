import { useState } from 'react';

const emptyForm = { name: '', role: '', email: '' };

export default function TeamMemberForm({ onSubmit, onCancel, busy }) {
  const [form, setForm] = useState(emptyForm);

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
          <span className="eyebrow">Novo registro</span>
          <h2>Cadastrar colaborador</h2>
        </div>
      </div>

      <label>
        Nome
        <input name="name" value={form.name} onChange={change} minLength="3" maxLength="80" required />
      </label>

      <label>
        Cargo
        <input name="role" value={form.role} onChange={change} minLength="3" maxLength="60" required />
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
          {busy ? 'Salvando...' : 'Cadastrar colaborador'}
        </button>
      </div>
    </form>
  );
}
