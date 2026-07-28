import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('./components/Layout', () => ({
  default: ({ children }) => <main>{children}</main>
}));
vi.mock('./pages/DashboardPage', () => ({
  default: () => <h1>Dashboard route</h1>
}));
vi.mock('./pages/ProjectFormPage', () => ({
  default: () => <h1>Project form route</h1>
}));
vi.mock('./pages/ProjectsPage', () => ({
  default: () => <h1>Projects route</h1>
}));
vi.mock('./pages/TaskFormPage', () => ({
  default: () => <h1>Task form route</h1>
}));
vi.mock('./pages/TasksPage', () => ({
  default: () => <h1>Tasks route</h1>
}));
vi.mock('./pages/TeamMemberFormPage', () => ({
  default: () => <h1>Team member form route</h1>
}));
vi.mock('./pages/TeamPage', () => ({
  default: () => <h1>Team route</h1>
}));

function renderRoute(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

describe('App routes', () => {
  it.each([
    ['/dashboard', 'Dashboard route'],
    ['/projects', 'Projects route'],
    ['/projects/new', 'Project form route'],
    ['/projects/project-1/edit', 'Project form route'],
    ['/tasks', 'Tasks route'],
    ['/tasks/new', 'Task form route'],
    ['/tasks/task-1/edit', 'Task form route'],
    ['/team', 'Team route'],
    ['/team/new', 'Team member form route'],
    ['/team/member-1/edit', 'Team member form route']
  ])('renders %s', (path, heading) => {
    renderRoute(path);

    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
  });

  it.each(['/', '/rota-inexistente'])('redirects %s to the dashboard', async (path) => {
    renderRoute(path);

    expect(
      await screen.findByRole('heading', { name: 'Dashboard route' })
    ).toBeInTheDocument();
  });
});
