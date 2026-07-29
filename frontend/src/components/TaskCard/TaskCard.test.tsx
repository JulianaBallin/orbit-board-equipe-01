import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { makeWorkItem } from '../../test/fixtures';
import { renderWithTheme } from '../../test/renderWithTheme';
import TaskCard from './TaskCard';

describe('TaskCard', () => {
  it('reports status and action interactions for its task', async () => {
    const task = makeWorkItem();
    const onStatusChange = vi.fn();
    const onEdit = vi.fn();
    renderWithTheme(
      <TaskCard
        task={task}
        statuses={['Backlog', 'Done']}
        onStatusChange={onStatusChange}
        onEdit={onEdit}
      />,
    );

    await userEvent.selectOptions(screen.getByLabelText('Mover para'), 'Done');
    expect(onStatusChange).toHaveBeenCalledWith(task.id, 'Done');
    await userEvent.click(screen.getByRole('button', { name: 'Editar' }));
    expect(onEdit).toHaveBeenCalledWith(task);
  });
});
