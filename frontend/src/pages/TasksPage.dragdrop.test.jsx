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

function renderPage() {
  return render(
    <MemoryRouter>
      <TasksPage />
    </MemoryRouter>,
  );
}

const column = (status) => screen.getByLabelText(`Coluna ${statusLabel(status)}`);

function pointAt(status) {
  document.elementFromPoint = () => column(status);
}

async function dragCardTo(status, { drop = true } = {}) {
  const card = await screen.findByTitle('Arraste para mover a tarefa de estágio');
  pointAt(status);

  fireEvent.pointerDown(card, { button: 0, clientX: 10, clientY: 10 });
  fireEvent.pointerMove(window, { clientX: 300, clientY: 300 });
  if (drop) fireEvent.pointerUp(window, { clientX: 300, clientY: 300 });

  return card;
}

describe('TasksPage pointer dragging', () => {
  beforeEach(() => {
    vi.spyOn(api.projects, 'list').mockResolvedValue(projects);
    vi.spyOn(api.tasks, 'list').mockResolvedValue([backlogTask]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete document.elementFromPoint;
    document.body.classList.remove('is-dragging-task');
  });

  it('moves the task to the column where the pointer was released', async () => {
    const changeStatus = vi.spyOn(api.tasks, 'changeStatus').mockResolvedValue({});

    renderPage();
    await dragCardTo('Done');

    await waitFor(() => expect(changeStatus).toHaveBeenCalledWith('task-1', 'Done'));
  });

  it('does not call the API when released over its own column', async () => {
    const changeStatus = vi.spyOn(api.tasks, 'changeStatus').mockResolvedValue({});

    renderPage();
    await dragCardTo('Backlog');

    await waitFor(() => expect(api.tasks.list).toHaveBeenCalled());
    expect(changeStatus).not.toHaveBeenCalled();
  });

  it('shows a floating copy of the card while dragging', async () => {
    renderPage();
    await dragCardTo('Done', { drop: false });

    const layer = document.querySelector('.drag-layer');
    expect(layer).not.toBeNull();
    expect(layer.textContent).toContain('Validar fluxo de inscrição');
    expect(document.body).toHaveClass('is-dragging-task');

    fireEvent.pointerUp(window, { clientX: 300, clientY: 300 });
    await waitFor(() => expect(document.querySelector('.drag-layer')).toBeNull());
    expect(document.body).not.toHaveClass('is-dragging-task');
  });

  it('marks where the card will land', async () => {
    renderPage();
    await dragCardTo('Done', { drop: false });

    expect(document.querySelector('.drop-placeholder')).not.toBeNull();
    expect(column('Done')).toHaveClass('drop-target');

    fireEvent.pointerUp(window, { clientX: 300, clientY: 300 });
  });

  it('ignores a press that starts on the controls inside the card', async () => {
    const changeStatus = vi.spyOn(api.tasks, 'changeStatus').mockResolvedValue({});

    renderPage();
    await screen.findByTitle('Arraste para mover a tarefa de estágio');
    pointAt('Done');
    const select = screen.getByDisplayValue(statusLabel('Backlog'));

    fireEvent.pointerDown(select, { button: 0, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(window, { clientX: 300, clientY: 300 });
    fireEvent.pointerUp(window, { clientX: 300, clientY: 300 });

    expect(document.querySelector('.drag-layer')).toBeNull();
    expect(changeStatus).not.toHaveBeenCalled();
  });

  it('does not drag on a plain click without movement', async () => {
    const changeStatus = vi.spyOn(api.tasks, 'changeStatus').mockResolvedValue({});

    renderPage();
    const card = await screen.findByTitle('Arraste para mover a tarefa de estágio');
    pointAt('Done');

    fireEvent.pointerDown(card, { button: 0, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(window, { clientX: 12, clientY: 11 });
    fireEvent.pointerUp(window, { clientX: 12, clientY: 11 });

    expect(document.querySelector('.drag-layer')).toBeNull();
    expect(changeStatus).not.toHaveBeenCalled();
  });

  it('reloads the board and reports the error when the move fails', async () => {
    vi.spyOn(api.tasks, 'changeStatus').mockRejectedValue(new Error('Falha ao mover a tarefa.'));

    renderPage();
    await dragCardTo('Done');

    expect(await screen.findByText('Falha ao mover a tarefa.')).toBeInTheDocument();
    await waitFor(() => expect(api.tasks.list.mock.calls.length).toBeGreaterThan(1));
  });
});
