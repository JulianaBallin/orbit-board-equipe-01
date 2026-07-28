import { useEffect, useState } from 'react';

const emptyForm = {
  name: '',
  description: '',
  status: 'Planning',
  startDate: new Date().toISOString().slice(0, 10),
  dueDate: '',
  ownerId: ''
};

export default function ProjectForm({ members, editing, onSubmit, onCancel, busy }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        description: editing.description,
        status: editing.status,
        startDate: editing.startDate,
        dueDate: editing.dueDate || '',
        ownerId: editing.ownerId
      });
    } else {
      setForm({ ...emptyForm, ownerId: members[0]?.id || '' });
    }
  }, [editing, members]);

  const change = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    onSubmit({ ...form, dueDate: form.dueDate || null });
  };

  return (
    <form className="form-card" onSubmit={submit}>
      <div className="section-heading compact">
        <div>
          <span className="eyebrow">{editing ? 'Edição' : 'Novo registro'}</span>
          <h2>{editing ? 'Editar projeto' : 'Criar projeto'}</h2>
        </div>
      </div>

      <label>
        Nome
        <input name="name" value={form.name} onChange={change} minLength="3" maxLength="80" required />
      </label>

      <label>
        Descrição
        <textarea name="description" value={form.description} onChange={change} minLength="10" maxLength="500" rows="4" required />
      </label>

      <div className="form-grid">
        <label>
          Status
          <select name="status" value={form.status} onChange={change}>
            <option value="Planning">Planejamento</option>
            <option value="Active">Ativo</option>
            <option value="OnHold">Em espera</option>
            <option value="Completed">Concluído</option>
          </select>
        </label>

        <label>
          Responsável
          <select name="ownerId" value={form.ownerId} onChange={change} required>
            {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
          </select>
        </label>

        <label>
          Data inicial
          <input type="date" name="startDate" value={form.startDate} onChange={change} required />
        </label>

        <label>
          Prazo
          <input type="date" name="dueDate" value={form.dueDate} onChange={change} />
        </label>
      </div>

      <div className="form-actions">
        {editing && <button type="button" className="button secondary" onClick={onCancel}>Cancelar</button>}
        <button className="button primary" disabled={busy}>{busy ? 'Salvando...' : 'Salvar projeto'}</button>
      </div>
    </form>
  );
}
