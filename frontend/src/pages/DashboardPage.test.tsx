import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from './DashboardPage';
import { api } from '../api/client';
import { makeDashboard, makeWorkItem } from '../test/fixtures';

const dashboard = makeDashboard({
  totalProjects: 3,
  activeProjects: 2,
  totalTasks: 5,
  completedTasks: 1,
  overdueTasks: 0,
  tasksByStatus: {
    Backlog: 1,
    InProgress: 1,
    Review: 1,
    Done: 1
  },
  recentTasks: [
    makeWorkItem({
      id: 'task-1',
      title: 'Validar dashboard',
      projectName: 'OrbitBoard',
      assigneeName: 'Camila Félix',
      priority: 'High',
      status: 'InProgress'
    })
  ]
});

describe('DashboardPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the metrics, status distribution and recent tasks', async () => {
    vi.spyOn(api, 'dashboard').mockResolvedValue(dashboard);

    render(<DashboardPage />);

    expect(await screen.findByRole('heading', { name: 'Visão geral' })).toBeInTheDocument();
    expect(screen.getByText('Validar dashboard')).toBeInTheDocument();
    expect(screen.getByText('2 ativos')).toBeInTheDocument();
    expect(screen.getAllByText('Em andamento')).toHaveLength(2);
  });

  it('retries after an API error', async () => {
    vi.spyOn(api, 'dashboard')
      .mockRejectedValueOnce(new Error('Backend indisponível.'))
      .mockResolvedValueOnce(dashboard);

    render(<DashboardPage />);

    expect(await screen.findByText('Backend indisponível.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByRole('heading', { name: 'Visão geral' })).toBeInTheDocument();
    expect(api.dashboard).toHaveBeenCalledTimes(2);
  });
});
