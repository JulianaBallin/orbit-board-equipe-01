import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/renderWithTheme';
import TaskViewSwitcher from './TaskViewSwitcher';

describe('TaskViewSwitcher', () => {
  it('exposes the current view and requests a view change', async () => {
    const onChange = vi.fn();
    renderWithTheme(<TaskViewSwitcher value="board" onChange={onChange} />);
    expect(screen.getByRole('button', { name: 'Quadro' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Tabela' }));
    expect(onChange).toHaveBeenCalledWith('table');
  });
});
