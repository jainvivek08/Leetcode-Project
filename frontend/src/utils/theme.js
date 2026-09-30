import { useEffect, useState } from 'react';

const THEME_KEY = 'codequest_theme';

/**
 * Returns currently stored theme preference ('light' | 'dark' | 'system').
 */
export function getStoredTheme() {
  if (typeof window === 'undefined') return 'light';
  return localStorage.getItem(THEME_KEY) || 'light';
}

/**
 * Applies the given theme to the document HTML element and saves to localStorage.
 */
export function applyTheme(themeName) {
  if (typeof window === 'undefined') return;
  const isDark =
    themeName === 'dark' ||
    (themeName === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const root = document.documentElement;
  if (isDark) {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }

  localStorage.setItem(THEME_KEY, themeName);
  window.dispatchEvent(
    new CustomEvent('codequest-theme-change', {
      detail: { theme: themeName, isDark },
    })
  );
}

/**
 * Initializes theme on page load.
 */
export function initTheme() {
  const stored = getStoredTheme();
  applyTheme(stored);
}

/**
 * React hook to read and switch theme across any component.
 */
export function useTheme() {
  const [theme, setThemeState] = useState(getStoredTheme);
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    const handleThemeChange = (e) => {
      setThemeState(e.detail.theme);
    };

    window.addEventListener('codequest-theme-change', handleThemeChange);
    return () => {
      window.removeEventListener('codequest-theme-change', handleThemeChange);
    };
  }, []);

  const setTheme = (newTheme) => {
    applyTheme(newTheme);
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    setTheme(nextTheme);
    return nextTheme;
  };

  return { theme, isDark, setTheme, toggleTheme };
}
