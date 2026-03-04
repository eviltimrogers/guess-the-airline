import { describe, it, expect } from 'vitest';
import { getThemeToggleIcon, toggleTheme, getStoredTheme, type Theme } from './theme';

describe('getThemeToggleIcon', () => {
  it('returns moon emoji for light mode', () => {
    expect(getThemeToggleIcon('light')).toBe('🌙');
  });

  it('returns sun emoji for dark mode', () => {
    expect(getThemeToggleIcon('dark')).toBe('☀️');
  });
});

describe('toggleTheme', () => {
  it('switches from dark to light', () => {
    expect(toggleTheme('dark')).toBe('light');
  });

  it('switches from light to dark', () => {
    expect(toggleTheme('light')).toBe('dark');
  });

  it('is its own inverse', () => {
    const themes: Theme[] = ['light', 'dark'];
    themes.forEach((theme) => {
      expect(toggleTheme(toggleTheme(theme))).toBe(theme);
    });
  });
});

describe('getStoredTheme', () => {
  const makeStorage = (value: string | null) => ({
    getItem: (_key: string) => value,
  });

  it('returns "light" when stored value is "light"', () => {
    expect(getStoredTheme(makeStorage('light'))).toBe('light');
  });

  it('returns "dark" when stored value is "dark"', () => {
    expect(getStoredTheme(makeStorage('dark'))).toBe('dark');
  });

  it('returns "dark" when no value is stored (null)', () => {
    expect(getStoredTheme(makeStorage(null))).toBe('dark');
  });

  it('returns "dark" for unrecognised stored values', () => {
    expect(getStoredTheme(makeStorage('invalid'))).toBe('dark');
    expect(getStoredTheme(makeStorage(''))).toBe('dark');
  });
});
