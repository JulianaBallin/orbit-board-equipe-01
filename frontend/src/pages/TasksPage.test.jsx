import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import TasksPage from './TasksPage';
import { api } from '../api/client';

const projects = [{ id: 'proj-1', name: 'Agenda de Eventos' }];
const tasks = [
  {
    id: 'task-1',
    title: 'Validar fluxo de inscrição',
    description: 'Testar cenários de sucesso.',
    projectId: 'proj-1',
    projectName: 'Agenda de Eventos',
    assigneeName: 'Diego Lima',
    priority: 'Critical',
    status: 'Backlog',
    dueDate: null,
    estimatedHours: 12,
  },
];

describe('TasksPage history modal integration', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('opens the history modal for a task card in the kanban board', async () => {
    vi.spyOn(api.projects, 'list').mockResolvedValue(projects);
    vi.spyOn(api.tasks, 'list').mockResolvedValue(tasks);
    vi.spyOn(api.tasks, 'history').mockResolvedValue([]);

    render(
      <MemoryRouter>
        <TasksPage />
      </MemoryRouter>,
    );

    const historyButton = await screen.findByRole('button', { name: 'Histórico' });
    await userEvent.click(historyButton);

    expect(
      await screen.findByRole('dialog', { name: /Validar fluxo de inscrição/ }),
    ).toBeInTheDocument();
    expect(api.tasks.history).toHaveBeenCalledWith('task-1');
  });
});
