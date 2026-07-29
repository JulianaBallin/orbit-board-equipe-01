import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Layout from './Layout';
import { AppThemeProvider } from '../theme/ThemeProvider';

function renderLayout(initialEntry = '/dashboard') {
  return render(
    <AppThemeProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Layout>
          <section>Conteúdo da página</section>
        </Layout>
      </MemoryRouter>
    </AppThemeProvider>,
  );
}

describe('Layout', () => {
  it('renders navigation, active route and page content', () => {
    renderLayout('/tasks');
    expect(screen.getByText('OrbitBoard')).toBeInTheDocument();
    expect(screen.getByRole('navigation').querySelectorAll('a')).toHaveLength(4);
    expect(screen.getByRole('heading', { name: 'Central de trabalho' })).toBeInTheDocument();
    expect(screen.getByText('Conteúdo da página')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Tarefas/i })).toHaveClass('active');
  });

  it('toggles the resolved theme and accessible label', async () => {
    window.localStorage.setItem('orbitboard-theme', 'light');
    renderLayout();
    const toggle = screen.getByRole('button', { name: 'Alterar para o tema escuro' });
    await userEvent.click(toggle);
    expect(screen.getByRole('button', { name: 'Alterar para o tema claro' })).toBeInTheDocument();
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(window.localStorage.getItem('orbitboard-theme')).toBe('dark');
  });
});
