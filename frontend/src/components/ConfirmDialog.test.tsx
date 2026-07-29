import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmDialog from './ConfirmDialog';

function renderDialog(props = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <ConfirmDialog
      title="Excluir tarefa"
      message="Tem certeza que deseja excluir a tarefa?"
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...props}
    />,
  );
  return { onConfirm, onCancel };
}

describe('ConfirmDialog', () => {
  it('exposes itself as an alert dialog named after the title', () => {
    renderDialog();

    expect(screen.getByRole('alertdialog', { name: 'Excluir tarefa' })).toBeInTheDocument();
    expect(screen.getByText('Tem certeza que deseja excluir a tarefa?')).toBeInTheDocument();
  });

  it('calls onConfirm only when the confirm button is pressed', async () => {
    const { onConfirm, onCancel } = renderDialog({ confirmLabel: 'Excluir tarefa' });

    await userEvent.click(screen.getByRole('button', { name: 'Excluir tarefa' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('cancels on the cancel button, on the backdrop and on Escape', async () => {
    const { onCancel } = renderDialog();

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    const backdrop = document.querySelector('.modal-backdrop');
    if (!backdrop) throw new Error('Backdrop não encontrado.');
    await userEvent.click(backdrop);
    await userEvent.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledTimes(3);
  });

  it('shows the optional detail and focuses the safe action', () => {
    renderDialog({ detail: 'As 3 tarefa(s) concluída(s) também serão removidas.' });

    expect(screen.getByText('As 3 tarefa(s) concluída(s) também serão removidas.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus();
  });
});
