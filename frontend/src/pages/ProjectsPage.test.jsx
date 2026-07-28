import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ProjectsPage from './ProjectsPage';
import { api } from '../api/client';

const projectWithPending = {
  id: 'proj-1',
  name: 'Project With Pending Tasks',
  description: 'Project that still has open tasks.',
  status: 'Active',
  ownerName: 'Diego Lima',
  dueDate: null,
  totalTasks: 4,
  completedTasks: 2,
};

const projectAllDone = {
  id: 'proj-2',
  name: 'Fully Concluded Project',
  description: 'Project whose tasks are all done.',
  status: 'Completed',
  ownerName: 'Ana Souza',
  dueDate: null,
  totalTasks: 3,
  completedTasks: 3,
};

function renderPage() {
  return render(
    <MemoryRouter>
      <ProjectsPage />
    </MemoryRouter>,
  );
}

describe('ProjectsPage delete guard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('disables deletion while the project still has unfinished tasks', async () => {
    vi.spyOn(api.projects, 'list').mockResolvedValue([projectWithPending]);
    const remove = vi.spyOn(api.projects, 'remove').mockResolvedValue(null);

    renderPage();

    const button = await screen.findByRole('button', { name: 'Excluir' });
    expect(button).toBeDisabled();
    expect(remove).not.toHaveBeenCalled();
  });

  it('allows deletion once every task is concluded', async () => {
    vi.spyOn(api.projects, 'list').mockResolvedValue([projectAllDone]);
    const remove = vi.spyOn(api.projects, 'remove').mockResolvedValue(null);
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderPage();

    const button = await screen.findByRole('button', { name: 'Excluir' });
    expect(button).toBeEnabled();

    await userEvent.click(button);

    expect(remove).toHaveBeenCalledWith('proj-2');
    expect(await screen.findByText('Projeto excluído.')).toBeInTheDocument();
  });

  it('warns that concluded tasks are removed together with the project', async () => {
    vi.spyOn(api.projects, 'list').mockResolvedValue([projectAllDone]);
    vi.spyOn(api.projects, 'remove').mockResolvedValue(null);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);

    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: 'Excluir' }));

    expect(confirm).toHaveBeenCalledWith(
      expect.stringContaining('As 3 tarefa(s) concluída(s) também serão removidas.'),
    );
  });
});
