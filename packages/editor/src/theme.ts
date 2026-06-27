export type EditorTheme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'viewfoundry-editor-theme';

export function loadStoredTheme(defaultTheme: EditorTheme = 'dark'): EditorTheme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // ignore storage errors (private mode, iframe restrictions)
  }
  return defaultTheme;
}

export function saveStoredTheme(theme: EditorTheme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore
  }
}

export function toggleTheme(theme: EditorTheme): EditorTheme {
  return theme === 'dark' ? 'light' : 'dark';
}
