export type EditorTheme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'viewfoundry-editor-theme';

export function loadStoredTheme(
  defaultTheme: EditorTheme = 'dark',
  storageKey: string = THEME_STORAGE_KEY,
): EditorTheme {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // ignore storage errors (private mode, iframe restrictions)
  }
  return defaultTheme;
}

export function saveStoredTheme(theme: EditorTheme, storageKey: string = THEME_STORAGE_KEY): void {
  try {
    localStorage.setItem(storageKey, theme);
  } catch {
    // ignore
  }
}

export function toggleTheme(theme: EditorTheme): EditorTheme {
  return theme === 'dark' ? 'light' : 'dark';
}
