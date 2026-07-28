import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TasksPage from './TasksPage';
import { api } from '../api/client';
import { statusLabel } from '../utils/labels';

const projects = [{ id: 'proj-1', name: 'Agenda de Eventos' }];

const backlogTask = {
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
};

/** Minimal DataTransfer stand-in, since jsdom does not implement the drag API. */
function dataTransfer() {
  const store = {};
  return {
    effectAllowed: '',
    dropEffect: '',
    setData: (type, value) => { store[type] = String(value); },
    getData: (type) => store[type] ?? '',
    setDragImage: () => {},
  };
}

function renderPage() {
  return render(
    <MemoryRouter>
      <TasksPage />
    </MemoryRouter>,
  );
}

const column = (status) => screen.getByLabelText(`Coluna ${statusLabel(status)}`);

describe('TasksPage drag and drop', () => {
  beforeEach(() => {
    vi.spyOn(api.projects, 'list').mockResolvedValue(projects);
    vi.spyOn(api.tasks, 'list').mockResolvedValue([backlogTask]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('moves a task to the status of the column it is dropped on', async () => {
    const changeStatus = vi.spyOn(api.tasks, 'changeStatus').mockResolvedValue({});

    renderPage();
    const card = await screen.findByTitle('Arraste para mover a tarefa de estágio');
    const transfer = dataTransfer();

    fireEvent.dragStart(card, { dataTransfer: transfer });
    fireEvent.drop(column('Done'), { dataTransfer: transfer });

    await waitFor(() => expect(changeStatus).toHaveBeenCalledWith('task-1', 'Done'));
  });

  it('does not call the API when the task is dropped on its own column', async () => {
    const changeStatus = vi.spyOn(api.tasks, 'changeStatus').mockResolvedValue({});

    renderPage();
    const card = await screen.findByTitle('Arraste para mover a tarefa de estágio');
    const transfer = dataTransfer();

    fireEvent.dragStart(card, { dataTransfer: transfer });
    fireEvent.drop(column('Backlog'), { dataTransfer: transfer });

    await waitFor(() => expect(api.tasks.list).toHaveBeenCalled());
    expect(changeStatus).not.toHaveBeenCalled();
  });

  it('highlights the column being hovered and clears it after the drop', async () => {
    vi.spyOn(api.tasks, 'changeStatus').mockResolvedValue({});

    renderPage();
    const card = await screen.findByTitle('Arraste para mover a tarefa de estágio');
    const transfer = dataTransfer();
    const target = column('InProgress');

    fireEvent.dragStart(card, { dataTransfer: transfer });
    fireEvent.dragOver(target, { dataTransfer: transfer });
    expect(target).toHaveClass('drop-target');

    fireEvent.drop(target, { dataTransfer: transfer });
    await waitFor(() => expect(target).not.toHaveClass('drop-target'));
  });

  it('does not start a drag from the controls inside the card', async () => {
    renderPage();
    await screen.findByTitle('Arraste para mover a tarefa de estágio');
    const transfer = dataTransfer();
    const select = screen.getByDisplayValue(statusLabel('Backlog'));

    const started = fireEvent.dragStart(select, { dataTransfer: transfer });

    expect(started).toBe(false);
    expect(transfer.getData('text/plain')).toBe('');
  });

  it('reloads the board when the status change fails', async () => {
    vi.spyOn(api.tasks, 'changeStatus').mockRejectedValue(new Error('Falha ao mover a tarefa.'));

    renderPage();
    const card = await screen.findByTitle('Arraste para mover a tarefa de estágio');
    const transfer = dataTransfer();

    fireEvent.dragStart(card, { dataTransfer: transfer });
    fireEvent.drop(column('Done'), { dataTransfer: transfer });

    expect(await screen.findByText('Falha ao mover a tarefa.')).toBeInTheDocument();
    await waitFor(() => expect(api.tasks.list).toHaveBeenCalledTimes(2));
  });
});
