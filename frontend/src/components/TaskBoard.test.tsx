import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { makeWorkItem } from '../test/fixtures';
import { renderWithTheme } from '../test/renderWithTheme';
import TaskBoard from './TaskBoard';

describe('TaskBoard', () => {
  it('groups tasks by status and wires task actions', async () => {
    const task = makeWorkItem();
    const onDelete = vi.fn();
    renderWithTheme(
      <TaskBoard
        tasks={[task]}
        statuses={['Backlog', 'Done']}
        onPointerDown={vi.fn()}
        onStatusChange={vi.fn()}
        onEdit={vi.fn()}
        onViewHistory={vi.fn()}
        onDelete={onDelete}
      />,
    );

    const backlog = screen.getByRole('region', { name: 'Coluna Backlog' });
    expect(within(backlog).getByText(task.title)).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Coluna Concluída' })).toHaveTextContent('Sem tarefas');
    await userEvent.click(within(backlog).getByRole('button', { name: 'Excluir' }));
    expect(onDelete).toHaveBeenCalledWith(task);
  });
});
