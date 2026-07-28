import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import TeamMemberFormPage from './TeamMemberFormPage';
import TeamPage from './TeamPage';
import { api } from '../api/client';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/team/new']}>
      <Routes>
        <Route path="/team" element={<TeamPage />} />
        <Route path="/team/new" element={<TeamMemberFormPage />} />
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
    const create = vi.spyOn(api.team, 'create').mockResolvedValue({ id: 'member-1' });
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
  });

  it('does not call the API when a required field is empty', async () => {
    const create = vi.spyOn(api.team, 'create').mockResolvedValue({});

    renderPage();
    await userEvent.type(screen.getByLabelText('Nome'), 'Renata Vasconcelos');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar colaborador' }));

    expect(create).not.toHaveBeenCalled();
  });

  it('goes back to the team list when cancelled', async () => {
    const create = vi.spyOn(api.team, 'create').mockResolvedValue({});
    vi.spyOn(api.team, 'list').mockResolvedValue([]);

    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(await screen.findByRole('heading', { name: 'Equipe' })).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();
  });
});
