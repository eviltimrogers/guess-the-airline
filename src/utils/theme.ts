export type Theme = 'light' | 'dark';

export function getThemeToggleIcon(theme: Theme): string {
  return theme === 'light' ? '🌙' : '☀️';
}

export function toggleTheme(current: Theme): Theme {
  return current === 'light' ? 'dark' : 'light';
}

export function getStoredTheme(storage: Pick<Storage, 'getItem'>): Theme {
  return storage.getItem('airline-theme') === 'light' ? 'light' : 'dark';
}
