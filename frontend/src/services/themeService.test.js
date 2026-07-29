import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getTheme,
  initializeTheme,
  setTheme,
  THEME_CHANGE_EVENT,
  toggleTheme,
} from './themeService';

const STORAGE_KEY = 'orbitboard-theme';

function mockSystemTheme(prefersDark) {
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
    matches: prefersDark,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

const createLocalStorageMock = () => {
  let storage = {};

  return {
    getItem: vi.fn((key) => storage[key] ?? null),

    setItem: vi.fn((key, value) => {
      storage[key] = String(value);
    }),

    removeItem: vi.fn((key) => {
      delete storage[key];
    }),

    clear: vi.fn(() => {
      storage = {};
    }),
  };
};


describe('themeService', () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createLocalStorageMock());
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
    document.documentElement.style.colorScheme = '';
    mockSystemTheme(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('initializes the light theme from the system preference', () => {
    expect(initializeTheme()).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  it('initializes the dark theme from storage before the system preference', () => {
    window.localStorage.setItem(STORAGE_KEY, 'dark');

    expect(initializeTheme()).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('ignores an invalid stored theme and uses the system preference', () => {
    window.localStorage.setItem(STORAGE_KEY, 'invalid');
    mockSystemTheme(true);

    expect(initializeTheme()).toBe('dark');
  });

  it('returns the applied theme before consulting storage or the system', () => {
    document.documentElement.dataset.theme = 'dark';
    window.localStorage.setItem(STORAGE_KEY, 'light');

    expect(getTheme()).toBe('dark');
  });

  it('persists and applies the selected theme and dispatches a change event', () => {
    const listener = vi.fn();
    window.addEventListener(THEME_CHANGE_EVENT, listener, { once: true });

    expect(setTheme('dark')).toBe('dark');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail).toEqual({ theme: 'dark' });
  });

  it('toggles between the light and dark themes', () => {
    document.documentElement.dataset.theme = 'light';

    expect(toggleTheme()).toBe('dark');
    expect(toggleTheme()).toBe('light');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('light');
  });

  it('rejects an unsupported theme without changing the current theme', () => {
    document.documentElement.dataset.theme = 'light';

    expect(() => setTheme('contrast')).toThrow('Invalid theme: contrast');
    expect(getTheme()).toBe('light');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
