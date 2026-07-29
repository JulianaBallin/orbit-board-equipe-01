import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '../../test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import TeamPage from './TeamPage';
import { api } from '../../api/client';

const member = {
  id: 'member-1',
  name: 'Renata Vasconcelos',
  role: 'Backend Developer',
  email: 'renata.vasconcelos@example.com',
  initials: 'RV',
};

function renderPage() {
  return renderWithTheme(
    <MemoryRouter initialEntries={['/team']}>
      <Routes>
        <Route path="/team" element={<TeamPage />} />
        <Route path="/team/:id/edit" element={<h2>Editar colaborador</h2>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('TeamPage actions', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('opens the edit page for the chosen collaborator', async () => {
    vi.spyOn(api.team, 'list').mockResolvedValue([member]);

    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: 'Editar' }));

    expect(await screen.findByRole('heading', { name: 'Editar colaborador' })).toBeInTheDocument();
  });

  it('asks for confirmation before removing and reloads the list', async () => {
    const list = vi.spyOn(api.team, 'list').mockResolvedValue([member]);
    const remove = vi.spyOn(api.team, 'remove').mockResolvedValue(undefined);

    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: 'Excluir' }));

    expect(await screen.findByRole('alertdialog', { name: 'Excluir colaborador' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Excluir colaborador' }));

    expect(remove).toHaveBeenCalledWith('member-1');
    expect(await screen.findByText('Colaborador excluído.')).toBeInTheDocument();
    expect(list).toHaveBeenCalledTimes(2);
  });

  it('keeps the collaborator when the confirmation is dismissed', async () => {
    vi.spyOn(api.team, 'list').mockResolvedValue([member]);
    const remove = vi.spyOn(api.team, 'remove').mockResolvedValue(undefined);

    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: 'Excluir' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(remove).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('reports the reason when the collaborator still has links', async () => {
    vi.spyOn(api.team, 'list').mockResolvedValue([member]);
    vi.spyOn(api.team, 'remove').mockRejectedValue(
      new Error('O integrante responde por 1 projeto(s) e 2 tarefa(s) e não pode ser excluído.'),
    );

    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: 'Excluir' }));
    await userEvent.click(screen.getByRole('button', { name: 'Excluir colaborador' }));

    expect(
      await screen.findByText('O integrante responde por 1 projeto(s) e 2 tarefa(s) e não pode ser excluído.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Renata Vasconcelos')).toBeInTheDocument();
  });
});
