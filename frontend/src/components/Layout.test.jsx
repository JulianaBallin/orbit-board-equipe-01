import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Layout from './Layout';
import {
  getTheme,
  THEME_CHANGE_EVENT,
  toggleTheme,
} from '../services/themeService';

vi.mock('../services/themeService', () => ({
  getTheme: vi.fn(),
  THEME_CHANGE_EVENT: 'themechange',
  toggleTheme: vi.fn(),
}));

function renderLayout(initialEntry = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Layout>
        <section>Conteúdo da página</section>
      </Layout>
    </MemoryRouter>,
  );
}

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getTheme.mockReturnValue('light');
  });

  it('renders the navigation and page content', () => {
    renderLayout();

    expect(screen.getByText('OrbitBoard')).toBeInTheDocument();
    expect(
      screen.getByRole('navigation').querySelectorAll('a'),
    ).toHaveLength(4);
    expect(
      screen.getByRole('heading', { name: 'Central de trabalho' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Conteúdo da página')).toBeInTheDocument();
  });

  it('marks the link for the current route as active', () => {
    renderLayout('/tasks');

    expect(screen.getByRole('link', { name: /Tarefas/i })).toHaveClass('active');
    expect(screen.getByRole('link', { name: /Visão geral/i })).not.toHaveClass(
      'active',
    );
  });

  it('shows the action to enable the dark theme initially', () => {
    renderLayout();

    expect(
      screen.getByRole('button', { name: 'Alterar para o tema escuro' }),
    ).toHaveAttribute('title', 'Alterar para o tema escuro');
  });

  it('calls the theme toggle when the user activates the button', async () => {
    renderLayout();

    await userEvent.click(
      screen.getByRole('button', { name: 'Alterar para o tema escuro' }),
    );

    expect(toggleTheme).toHaveBeenCalledTimes(1);
  });

  it('updates the accessible action after a theme change event', () => {
    renderLayout();

    fireEvent(
      window,
      new CustomEvent(THEME_CHANGE_EVENT, {
        detail: { theme: 'dark' },
      }),
    );

    expect(
      screen.getByRole('button', { name: 'Alterar para o tema claro' }),
    ).toHaveAttribute('title', 'Alterar para o tema claro');
  });
});
