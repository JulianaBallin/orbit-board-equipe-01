import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppThemeProvider, useAppTheme } from './ThemeProvider';

function ThemeProbe() {
  const { preference, resolvedTheme, setPreference } = useAppTheme();
  return (
    <div>
      <span>{preference}:{resolvedTheme}</span>
      <button onClick={() => setPreference('system')}>Sistema</button>
    </div>
  );
}

describe('AppThemeProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal('matchMedia', vi.fn((query: string): MediaQueryList => ({
      matches: query.includes('dark'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));
  });

  it('resolves system preference, publishes it and persists an explicit preference', async () => {
    render(<AppThemeProvider><ThemeProbe /></AppThemeProvider>);
    expect(screen.getByText('system:dark')).toBeInTheDocument();
    expect(document.documentElement.dataset.theme).toBe('dark');

    await userEvent.click(screen.getByRole('button', { name: 'Sistema' }));
    expect(window.localStorage.getItem('orbitboard-theme')).toBe('system');
  });
});
