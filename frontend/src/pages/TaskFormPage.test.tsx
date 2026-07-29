import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '../test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import TaskFormPage from './TaskFormPage';
import { api } from '../api/client';
import { ApiError } from '../api/client';
import { makeMember, makeProject, makeWorkItem } from '../test/fixtures';

const project = makeProject({ id: 'project-1', name: 'OrbitBoard' });
const member = makeMember({ id: 'member-1', name: 'Pedro Henrique' });
const task = makeWorkItem({
  id: 'task-1',
  projectId: project.id,
  title: 'Tarefa existente',
  description: 'Descrição válida da tarefa existente.',
  status: 'Review',
  priority: 'High',
  assigneeId: member.id,
  dueDate: '2026-08-10',
  estimatedHours: 5
});

function prepareReferences() {
  vi.spyOn(api.projects, 'list').mockResolvedValue([project]);
  vi.spyOn(api.team, 'list').mockResolvedValue([member]);
}

function renderPage(path: string) {
  return renderWithTheme(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/tasks" element={<h1>Tasks destination</h1>} />
        <Route path="/tasks/new" element={<TaskFormPage />} />
        <Route path="/tasks/:id/edit" element={<TaskFormPage />} />
      </Routes>
    </MemoryRouter>
  );
}

async function fillNewTask() {
  await userEvent.type(await screen.findByLabelText('Título'), 'Tarefa de teste');
  await userEvent.type(
    screen.getByLabelText('Descrição'),
    'Descrição válida enviada pelo formulário.'
  );
}

describe('TaskFormPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a task and returns to the listing', async () => {
    prepareReferences();
    const create = vi.spyOn(api.tasks, 'create').mockResolvedValue(makeWorkItem({ id: 'task-2' }));

    renderPage('/tasks/new');
    await fillNewTask();
    await userEvent.click(screen.getByRole('button', { name: 'Salvar tarefa' }));

    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      projectId: project.id,
      title: 'Tarefa de teste',
      assigneeId: member.id,
      status: 'Backlog',
      priority: 'Medium',
      dueDate: null,
      estimatedHours: 4
    }));
    expect(await screen.findByRole('heading', { name: 'Tasks destination' })).toBeInTheDocument();
  });

  it('loads, updates and persists the selected task', async () => {
    prepareReferences();
    vi.spyOn(api.tasks, 'get').mockResolvedValue(task);
    const update = vi.spyOn(api.tasks, 'update').mockResolvedValue(task);

    renderPage('/tasks/task-1/edit');

    const title = await screen.findByDisplayValue('Tarefa existente');
    await userEvent.clear(title);
    await userEvent.type(title, 'Tarefa revisada');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar tarefa' }));

    expect(update).toHaveBeenCalledWith('task-1', expect.objectContaining({
      title: 'Tarefa revisada',
      projectId: project.id,
      assigneeId: member.id,
      status: 'Review',
      priority: 'High'
    }));
    expect(await screen.findByRole('heading', { name: 'Tasks destination' })).toBeInTheDocument();
  });

  it('returns to tasks instead of retrying when the task does not exist', async () => {
    prepareReferences();
    vi.spyOn(api.tasks, 'get').mockRejectedValue(
      new ApiError('Tarefa não encontrada.', 404, {})
    );

    renderPage('/tasks/missing/edit');

    expect(await screen.findByText('Tarefa não encontrada.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Salvar tarefa' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Voltar para tarefas' }));
    expect(await screen.findByRole('heading', { name: 'Tasks destination' })).toBeInTheDocument();
  });

  it('retries a temporary loading failure and restores the edit form', async () => {
    prepareReferences();
    vi.spyOn(api.tasks, 'get')
      .mockRejectedValueOnce(new Error('Backend indisponível.'))
      .mockResolvedValueOnce(task);

    renderPage('/tasks/task-1/edit');

    expect(await screen.findByText('Backend indisponível.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByDisplayValue('Tarefa existente')).toBeInTheDocument();
    expect(api.tasks.get).toHaveBeenCalledTimes(2);
  });

  it('keeps the form visible when the API rejects the save', async () => {
    prepareReferences();
    vi.spyOn(api.tasks, 'create').mockRejectedValue(
      new Error('O prazo da tarefa é inválido.')
    );

    renderPage('/tasks/new');
    await fillNewTask();
    await userEvent.click(screen.getByRole('button', { name: 'Salvar tarefa' }));

    expect(await screen.findByText('O prazo da tarefa é inválido.')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Tarefa de teste')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeInTheDocument();
  });
});
