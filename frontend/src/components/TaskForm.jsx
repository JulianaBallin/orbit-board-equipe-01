import { useEffect, useState } from 'react';

const emptyForm = {
  projectId: '',
  title: '',
  description: '',
  status: 'Backlog',
  priority: 'Medium',
  assigneeId: '',
  dueDate: '',
  estimatedHours: 4
};

export default function TaskForm({ projects, members, editing, onSubmit, onCancel, busy }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editing) {
      setForm({
        projectId: editing.projectId,
        title: editing.title,
        description: editing.description,
        status: editing.status,
        priority: editing.priority,
        assigneeId: editing.assigneeId || '',
        dueDate: editing.dueDate || '',
        estimatedHours: editing.estimatedHours
      });
    } else {
      setForm({
        ...emptyForm,
        projectId: projects[0]?.id || '',
        assigneeId: members[0]?.id || ''
      });
    }
  }, [editing, projects, members]);

  const change = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === 'estimatedHours' ? Number(value) : value
    }));
  };

  const submit = (event) => {
    event.preventDefault();
    onSubmit({
      ...form,
      assigneeId: form.assigneeId || null,
      dueDate: form.dueDate || null
    });
  };

  return (
    <form className="form-card" onSubmit={submit}>
      <div className="section-heading compact">
        <div>
          <span className="eyebrow">{editing ? 'Edição' : 'Nova demanda'}</span>
          <h2>{editing ? 'Editar tarefa' : 'Criar tarefa'}</h2>
        </div>
      </div>

      <label>
        Título
        <input name="title" value={form.title} onChange={change} minLength="3" maxLength="120" required />
      </label>

      <label>
        Descrição
        <textarea name="description" value={form.description} onChange={change} minLength="5" maxLength="800" rows="4" required />
      </label>

      <div className="form-grid">
        <label>
          Projeto
          <select name="projectId" value={form.projectId} onChange={change} required>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
        </label>

        <label>
          Responsável
          <select name="assigneeId" value={form.assigneeId} onChange={change}>
            <option value="">Sem responsável</option>
            {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
          </select>
        </label>

        <label>
          Status
          <select name="status" value={form.status} onChange={change}>
            <option value="Backlog">Backlog</option>
            <option value="InProgress">Em andamento</option>
            <option value="Review">Em revisão</option>
            <option value="Done">Concluída</option>
          </select>
        </label>

        <label>
          Prioridade
          <select name="priority" value={form.priority} onChange={change}>
            <option value="Low">Baixa</option>
            <option value="Medium">Média</option>
            <option value="High">Alta</option>
            <option value="Critical">Crítica</option>
          </select>
        </label>

        <label>
          Prazo
          <input type="date" name="dueDate" value={form.dueDate} onChange={change} />
        </label>

        <label>
          Estimativa (horas)
          <input type="number" name="estimatedHours" value={form.estimatedHours} onChange={change} min="1" max="200" required />
        </label>
      </div>

      <div className="form-actions">
        {editing && <button type="button" className="button secondary" onClick={onCancel}>Cancelar</button>}
        <button className="button primary" disabled={busy}>{busy ? 'Salvando...' : 'Salvar tarefa'}</button>
      </div>
    </form>
  );
}
