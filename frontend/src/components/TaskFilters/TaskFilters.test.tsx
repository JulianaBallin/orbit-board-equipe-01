import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { makeProject } from '../../test/fixtures';
import { renderWithTheme } from '../../test/renderWithTheme';
import TaskFilters from './TaskFilters';

describe('TaskFilters', () => {
  it('reports filter changes and clears all filters', async () => {
    const onChange = vi.fn();
    const onClear = vi.fn();
    renderWithTheme(
      <TaskFilters
        filters={{ search: '', projectId: '', status: '', priority: '' }}
        projects={[makeProject()]}
        statuses={['Backlog', 'InProgress', 'Review', 'Done']}
        priorities={['Low', 'Medium', 'High', 'Critical']}
        onChange={onChange}
        onClear={onClear}
      />,
    );

    await userEvent.type(screen.getByPlaceholderText('Buscar por título ou descrição'), 'login');
    expect(onChange).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
