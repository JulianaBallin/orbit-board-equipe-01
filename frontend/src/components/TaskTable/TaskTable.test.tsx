import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderWithTheme } from '../../test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import TaskTable from './TaskTable';
import { makeWorkItem } from '../../test/fixtures';
import type { WorkItemStatus } from '../../types/api';

const task = makeWorkItem({
  id: 'task-1',
  title: 'Validar fluxo de inscrição',
  description: '',
  projectName: 'Agenda de Eventos',
  assigneeName: 'Diego Lima',
  priority: 'Critical',
  status: 'Backlog',
  dueDate: null,
  estimatedHours: 12,
});

const statuses: WorkItemStatus[] = ['Backlog', 'InProgress', 'Review', 'Done'];

describe('TaskTable actions menu', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists "Histórico" between "Editar" and "Excluir", and calls onViewHistory when clicked', async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onViewHistory = vi.fn();

    renderWithTheme(
      <TaskTable
        tasks={[task]}
        statuses={statuses}
        onStatusChange={vi.fn()}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewHistory={onViewHistory}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /abrir ações de validar fluxo de inscrição/i }));

    const menu = screen.getByRole('menu');
    const items = within(menu)
      .getAllByRole('menuitem')
      .map((item) => item.textContent);
    expect(items).toEqual(['Editar', 'Histórico', 'Excluir']);

    await userEvent.click(within(menu).getByRole('menuitem', { name: 'Histórico' }));

    expect(onViewHistory).toHaveBeenCalledWith(task);
    expect(onEdit).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
