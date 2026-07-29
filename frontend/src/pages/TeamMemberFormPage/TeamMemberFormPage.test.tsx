import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '../../test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import TeamMemberFormPage from './TeamMemberFormPage';
import TeamPage from '../TeamPage/TeamPage';
import { api } from '../../api/client';
import { makeMember } from '../../test/fixtures';

function renderPage() {
  return renderWithTheme(
    <MemoryRouter initialEntries={['/team/new']}>
      <Routes>
        <Route path="/team" element={<TeamPage />} />
        <Route path="/team/new" element={<TeamMemberFormPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function renderEditPage(id: string) {
  return renderWithTheme(
    <MemoryRouter initialEntries={[`/team/${id}/edit`]}>
      <Routes>
        <Route path="/team" element={<h1>Team destination</h1>} />
        <Route path="/team/:id/edit" element={<TeamMemberFormPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

async function fillForm() {
  await userEvent.type(screen.getByLabelText('Nome'), 'Renata Vasconcelos');
  await userEvent.selectOptions(screen.getByLabelText('Cargo'), 'Backend Developer');
  await userEvent.type(screen.getByLabelText('Email'), 'renata.vasconcelos@example.com');
}

describe('TeamMemberFormPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends the trimmed data and goes back to the team list', async () => {
    const create = vi.spyOn(api.team, 'create').mockResolvedValue(makeMember({ id: 'member-1' }));
    vi.spyOn(api.team, 'list').mockResolvedValue([]);

    renderPage();
    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar colaborador' }));

    expect(create).toHaveBeenCalledWith({
      name: 'Renata Vasconcelos',
      role: 'Backend Developer',
      email: 'renata.vasconcelos@example.com',
    });
    expect(await screen.findByRole('heading', { name: 'Equipe' })).toBeInTheDocument();
  });

  it('offers the role as a preset list already filled in', async () => {
    renderPage();

    const role = screen.getByLabelText('Cargo');

    expect(role.tagName).toBe('SELECT');
    expect(role).toHaveValue('Backend Developer');
    expect(screen.getByRole('option', { name: 'Frontend Developer' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Tech Lead' })).toBeInTheDocument();
  });

  it('keeps the form and shows the reason when the API rejects the email', async () => {
    vi.spyOn(api.team, 'create').mockRejectedValue(new Error('Já existe um integrante com esse email.'));

    renderPage();
    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar colaborador' }));

    expect(await screen.findByText('Já existe um integrante com esse email.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cadastrar colaborador' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeInTheDocument();
  });

  it('does not call the API when a required field is empty', async () => {
    const create = vi.spyOn(api.team, 'create').mockResolvedValue(makeMember());

    renderPage();
    await userEvent.type(screen.getByLabelText('Nome'), 'Renata Vasconcelos');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar colaborador' }));

    expect(create).not.toHaveBeenCalled();
  });

  it('goes back to the team list when cancelled', async () => {
    const create = vi.spyOn(api.team, 'create').mockResolvedValue(makeMember());
    vi.spyOn(api.team, 'list').mockResolvedValue([]);

    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(await screen.findByRole('heading', { name: 'Equipe' })).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();
  });

  it('returns to the team instead of retrying when the member does not exist', async () => {
    vi.spyOn(api.team, 'list').mockResolvedValue([]);

    renderEditPage('missing');

    expect(await screen.findByText('Integrante não encontrado.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Salvar alterações' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Voltar para equipe' }));
    expect(await screen.findByRole('heading', { name: 'Team destination' })).toBeInTheDocument();
  });

  it('retries a temporary list failure and restores the edit form', async () => {
    vi.spyOn(api.team, 'list')
      .mockRejectedValueOnce(new Error('Backend indisponível.'))
      .mockResolvedValueOnce([{
        id: 'member-1',
        name: 'Renata Vasconcelos',
        role: 'Backend Developer',
        email: 'renata.vasconcelos@example.com',
        initials: 'RV',
      }]);

    renderEditPage('member-1');

    expect(await screen.findByText('Backend indisponível.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByDisplayValue('Renata Vasconcelos')).toBeInTheDocument();
    expect(api.team.list).toHaveBeenCalledTimes(2);
  });
});
