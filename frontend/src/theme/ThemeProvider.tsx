import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { darkTheme, lightTheme, type SemanticTheme } from './tokens';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = Exclude<ThemePreference, 'system'>;

const STORAGE_KEY = 'orbitboard-theme';
const mediaQuery = '(prefers-color-scheme: dark)';

function isPreference(value: string | null): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

function storedPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isPreference(stored) ? stored : 'system';
}

function systemTheme(): ResolvedTheme {
  return typeof window !== 'undefined' && window.matchMedia(mediaQuery).matches ? 'dark' : 'light';
}

interface ThemeContextValue {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function publishTheme(theme: ResolvedTheme, semanticTheme: SemanticTheme): void {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  root.style.setProperty('--color-background', semanticTheme.colors.background);
  root.style.setProperty('--color-surface', semanticTheme.colors.surface);
  root.style.setProperty('--color-surface-muted', semanticTheme.colors.surfaceMuted);
  root.style.setProperty('--color-text', semanticTheme.colors.text);
  root.style.setProperty('--color-text-muted', semanticTheme.colors.textMuted);
  root.style.setProperty('--color-border', semanticTheme.colors.border);
  root.style.setProperty('--color-action', semanticTheme.colors.action);
  root.style.setProperty('--color-focus', semanticTheme.colors.focus);
}

interface AppThemeProviderProps {
  children: ReactNode;
}

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const [preference, setPreferenceState] = useState<ThemePreference>(storedPreference);
  const [system, setSystem] = useState<ResolvedTheme>(systemTheme);
  const resolvedTheme = preference === 'system' ? system : preference;
  const semanticTheme = resolvedTheme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    const query = window.matchMedia(mediaQuery);
    const update = (event: MediaQueryListEvent) => setSystem(event.matches ? 'dark' : 'light');
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => publishTheme(resolvedTheme, semanticTheme), [resolvedTheme, semanticTheme]);

  const value = useMemo<ThemeContextValue>(() => ({
    preference,
    resolvedTheme,
    setPreference(next) {
      setPreferenceState(next);
      window.localStorage.setItem(STORAGE_KEY, next);
    },
    toggleTheme() {
      const next = resolvedTheme === 'dark' ? 'light' : 'dark';
      setPreferenceState(next);
      window.localStorage.setItem(STORAGE_KEY, next);
    },
  }), [preference, resolvedTheme]);

  return (
    <ThemeContext.Provider value={value}>
      <StyledThemeProvider theme={semanticTheme}>{children}</StyledThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAppTheme deve ser usado dentro de AppThemeProvider.');
  return context;
}

export function initializeTheme(): void {
  const preference = storedPreference();
  const resolved = preference === 'system' ? systemTheme() : preference;
  publishTheme(resolved, resolved === 'dark' ? darkTheme : lightTheme);
}
