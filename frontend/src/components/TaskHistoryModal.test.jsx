import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskHistoryModal from './TaskHistoryModal';
import { api } from '../api/client';

const task = { id: 'task-1', title: 'Validar fluxo de inscrição' };

describe('TaskHistoryModal', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows a loading state before the history resolves', async () => {
    let resolveHistory;
    vi.spyOn(api.tasks, 'history').mockReturnValue(
      new Promise((resolve) => {
        resolveHistory = resolve;
      }),
    );

    render(<TaskHistoryModal task={task} onClose={vi.fn()} />);

    expect(screen.getByText('Carregando histórico...')).toBeInTheDocument();
    resolveHistory([]);
    await waitFor(() => expect(screen.queryByText('Carregando histórico...')).not.toBeInTheDocument());
  });

  it('renders entries from most recent to oldest, marking the first change as "Criada"', async () => {
    vi.spyOn(api.tasks, 'history').mockResolvedValue([
      { id: '1', fromStatus: null, toStatus: 'Backlog', changedAt: '2026-01-01T10:00:00Z' },
      { id: '2', fromStatus: 'Backlog', toStatus: 'InProgress', changedAt: '2026-01-02T10:00:00Z' },
    ]);

    render(<TaskHistoryModal task={task} onClose={vi.fn()} />);

    await waitFor(() => expect(document.querySelectorAll('.compact-item')).toHaveLength(2));
    const rows = document.querySelectorAll('.compact-item');

    expect(rows[0]).not.toHaveTextContent('Criada');
    expect(rows[0]).toHaveTextContent('Em andamento');
    expect(rows[1]).toHaveTextContent('Criada');
    expect(rows[1]).toHaveTextContent('Backlog');
  });

  it('shows the empty state when there is no history yet', async () => {
    vi.spyOn(api.tasks, 'history').mockResolvedValue([]);

    render(<TaskHistoryModal task={task} onClose={vi.fn()} />);

    expect(await screen.findByText('Sem alterações registradas')).toBeInTheDocument();
  });

  it('shows an error state and retries the request on demand', async () => {
    const historySpy = vi
      .spyOn(api.tasks, 'history')
      .mockRejectedValueOnce(new Error('Tarefa não encontrada.'))
      .mockResolvedValueOnce([]);

    render(<TaskHistoryModal task={task} onClose={vi.fn()} />);

    expect(await screen.findByText('Tarefa não encontrada.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    await waitFor(() => expect(historySpy).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('Sem alterações registradas')).toBeInTheDocument();
  });

  it('closes when Escape is pressed', async () => {
    vi.spyOn(api.tasks, 'history').mockResolvedValue([]);
    const onClose = vi.fn();

    render(<TaskHistoryModal task={task} onClose={onClose} />);
    await screen.findByText('Sem alterações registradas');

    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when clicking the backdrop, but not when clicking inside the modal card', async () => {
    vi.spyOn(api.tasks, 'history').mockResolvedValue([]);
    const onClose = vi.fn();

    render(<TaskHistoryModal task={task} onClose={onClose} />);
    await screen.findByText('Sem alterações registradas');

    await userEvent.click(screen.getByRole('dialog'));
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.click(document.querySelector('.modal-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
