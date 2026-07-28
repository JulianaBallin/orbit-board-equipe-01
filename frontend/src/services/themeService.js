const STORAGE_KEY = "orbitboard-theme";
const DARK_THEME = "dark";
const LIGHT_THEME = "light";

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? DARK_THEME
    : LIGHT_THEME;
}

function getStoredTheme() {
  const theme = localStorage.getItem(STORAGE_KEY);

  return theme === DARK_THEME || theme === LIGHT_THEME ? theme : null;
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function getTheme() {
  return (
    document.documentElement.dataset.theme ||
    getStoredTheme() ||
    getSystemTheme()
  );
}

export function setTheme(theme) {
  if (theme !== DARK_THEME && theme !== LIGHT_THEME) {
    throw new Error(`Invalid theme: ${theme}`);
  }

  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
  window.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));

  return theme;
}

export function toggleTheme() {
  return setTheme(getTheme() === DARK_THEME ? LIGHT_THEME : DARK_THEME);
}

export function initializeTheme() {
  const storedTheme = getStoredTheme();
  const theme = storedTheme || getSystemTheme();

  applyTheme(theme);
  return theme;
}

export const THEME_CHANGE_EVENT = "themechange";
