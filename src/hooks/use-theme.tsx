import { useContext } from 'react';

import { ThemeContext, ThemeContextType } from '../context/theme-context.tsx';

/**
 * Hook to access the theme context with comprehensive theme management
 *
 * Provides access to current theme state, theme switching functionality,
 * and system theme integration capabilities.
 *
 * @returns The theme context value with all theme management methods
 * @throws Error if used outside of a ThemeProvider
 *
 * @example
 * // Basic theme usage
 * const { theme, toggleTheme } = useTheme();
 *
 * return (
 *   <button
 *     onClick={toggleTheme}
 *     className={theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
 *   >
 *     Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
 *   </button>
 * );
 *
 * @example
 * // Using boolean helpers
 * const { isDark, isLight, setTheme } = useTheme();
 *
 * return (
 *   <div className={isDark ? 'dark-mode' : 'light-mode'}>
 *     <button onClick={() => setTheme('light')}>
 *       Light Mode
 *     </button>
 *     <button onClick={() => setTheme('dark')}>
 *       Dark Mode
 *     </button>
 *   </div>
 * );
 *
 * @example
 * // System theme integration
 * const { supportsSystemTheme, getSystemTheme, resetToSystemTheme } = useTheme();
 *
 * return (
 *   <div>
 *     {supportsSystemTheme && (
 *       <button onClick={resetToSystemTheme}>
 *         Use System Theme ({getSystemTheme()})
 *       </button>
 *     )}
 *   </div>
 * );
 *
 * @example
 * // Theme change notifications
 * const { onThemeChange } = useTheme();
 *
 * useEffect(() => {
 *   const cleanup = onThemeChange((newTheme, previousTheme) => {
 *     console.log(`Theme changed from ${previousTheme} to ${newTheme}`);
 *     // Update analytics, save preferences, etc.
 *   });
 *
 *   return cleanup; // Important: cleanup to prevent memory leaks
 * }, [onThemeChange]);
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error(
      'useTheme must be used within a ThemeProvider. ' +
        'Make sure your component is wrapped with <ThemeProvider>. ' +
        'Example: <ThemeProvider><YourComponent /></ThemeProvider>'
    );
  }

  return context;
};
