import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '../test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProjectFormPage from './ProjectFormPage';
import { api } from '../api/client';
import { ApiError } from '../api/client';
import { makeMember, makeProject } from '../test/fixtures';

const member = makeMember({ id: 'member-1', name: 'Camila Félix' });
const project = makeProject({
  id: 'project-1',
  name: 'Projeto existente',
  description: 'Descrição válida do projeto existente.',
  status: 'Active',
  startDate: '2026-07-20',
  dueDate: '2026-08-20',
  ownerId: member.id
});

function renderPage(path: string) {
  return renderWithTheme(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/projects" element={<h1>Projects destination</h1>} />
        <Route path="/projects/new" element={<ProjectFormPage />} />
        <Route path="/projects/:id/edit" element={<ProjectFormPage />} />
      </Routes>
    </MemoryRouter>
  );
}

async function fillNewProject() {
  await userEvent.type(await screen.findByLabelText('Nome'), 'Projeto de teste');
  await userEvent.type(
    screen.getByLabelText('Descrição'),
    'Descrição válida enviada pelo formulário.'
  );
}

describe('ProjectFormPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a project and returns to the listing', async () => {
    vi.spyOn(api.team, 'list').mockResolvedValue([member]);
    const create = vi.spyOn(api.projects, 'create').mockResolvedValue(makeProject({ id: 'project-2' }));

    renderPage('/projects/new');
    await fillNewProject();
    await userEvent.click(screen.getByRole('button', { name: 'Salvar projeto' }));

    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Projeto de teste',
      description: 'Descrição válida enviada pelo formulário.',
      ownerId: member.id,
      status: 'Planning',
      dueDate: null
    }));
    expect(await screen.findByRole('heading', { name: 'Projects destination' })).toBeInTheDocument();
  });

  it('loads, updates and persists the selected project', async () => {
    vi.spyOn(api.team, 'list').mockResolvedValue([member]);
    vi.spyOn(api.projects, 'get').mockResolvedValue(project);
    const update = vi.spyOn(api.projects, 'update').mockResolvedValue(project);

    renderPage('/projects/project-1/edit');

    const name = await screen.findByDisplayValue('Projeto existente');
    await userEvent.clear(name);
    await userEvent.type(name, 'Projeto revisado');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar projeto' }));

    expect(update).toHaveBeenCalledWith('project-1', expect.objectContaining({
      name: 'Projeto revisado',
      ownerId: member.id,
      status: 'Active'
    }));
    expect(await screen.findByRole('heading', { name: 'Projects destination' })).toBeInTheDocument();
  });

  it('returns to projects instead of retrying when the project does not exist', async () => {
    vi.spyOn(api.team, 'list').mockResolvedValue([member]);
    vi.spyOn(api.projects, 'get').mockRejectedValue(
      new ApiError('Projeto não encontrado.', 404, {})
    );

    renderPage('/projects/missing/edit');

    expect(await screen.findByText('Projeto não encontrado.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Salvar projeto' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Voltar para projetos' }));
    expect(await screen.findByRole('heading', { name: 'Projects destination' })).toBeInTheDocument();
  });

  it('retries a temporary loading failure and restores the edit form', async () => {
    vi.spyOn(api.team, 'list').mockResolvedValue([member]);
    vi.spyOn(api.projects, 'get')
      .mockRejectedValueOnce(new Error('Backend indisponível.'))
      .mockResolvedValueOnce(project);

    renderPage('/projects/project-1/edit');

    expect(await screen.findByText('Backend indisponível.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByDisplayValue('Projeto existente')).toBeInTheDocument();
    expect(api.projects.get).toHaveBeenCalledTimes(2);
  });

  it('keeps the form visible when the API rejects the save', async () => {
    vi.spyOn(api.team, 'list').mockResolvedValue([member]);
    vi.spyOn(api.projects, 'create').mockRejectedValue(
      new Error('Já existe um projeto com esse nome.')
    );

    renderPage('/projects/new');
    await fillNewProject();
    await userEvent.click(screen.getByRole('button', { name: 'Salvar projeto' }));

    expect(await screen.findByText('Já existe um projeto com esse nome.')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Projeto de teste')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeInTheDocument();
  });
});
