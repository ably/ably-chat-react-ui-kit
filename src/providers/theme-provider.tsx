import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ThemeContext } from '../context/theme-context.tsx';

/**
 * Storage key for persisting theme preference in localStorage
 */
const THEME_STORAGE_KEY = 'ably-chat-ui-theme';
/**
 * Supported theme types
 */
export type ThemeType = 'light' | 'dark';
/**
 * Callback function type for theme change events
 */
export type ThemeChangeCallback = (theme: ThemeType, previousTheme: ThemeType) => void;

/**
 * Configuration options for theme management
 */
export interface ThemeOptions {
  /**
   * Whether to persist theme preference to localStorage
   * @default true
   */
  persist?: boolean;

  /**
   * Whether to detect and use system theme preference
   * @default true
   */
  detectSystemTheme?: boolean;

  /**
   * Initial theme to use if no preference is found
   * @default 'light'
   */
  defaultTheme?: ThemeType;
}

/**
 * Props for the ThemeProvider component
 */
export interface ThemeProviderProps {
  /**
   * Child components that will have access to the theme context
   */
  children: ReactNode;

  /**
   * Configuration options for theme management
   */
  options?: ThemeOptions;

  /**
   * Callback fired when the theme changes
   */
  onThemeChange?: ThemeChangeCallback;
}

/**
 * ThemeProvider manages theme state, persistence, and system integration across the application
 *
 * Features:
 * - Light/dark theme management with type safety
 * - Persistent theme preference in localStorage
 * - System theme preference detection and integration
 * - Change notifications for theme updates
 * - Performance optimizations with memoization
 * - Accessibility support with proper DOM updates
 *
 * TODO: Adding more themes for:
 * - High contrast mode for accessibility
 * - Custom user/brand themes
 *
 * @example
 * // Basic usage
 * <ThemeProvider>
 *   <ChatApplication />
 * </ThemeProvider>
 *
 * @example
 * // With custom configuration
 * <ThemeProvider
 *   options={{
 *     persist: true,
 *     detectSystemTheme: true,
 *     defaultTheme: 'dark'
 *   }}
 *   onThemeChange={(theme, prev) => {
 *     console.log(`Theme changed from ${prev} to ${theme}`);
 *   }}
 * >
 *   <ChatApplication />
 * </ThemeProvider>
 */
export const ThemeProvider = ({
  children,
  options = {},
  onThemeChange: externalOnThemeChange,
}: ThemeProviderProps) => {
  const { persist = true, detectSystemTheme = true, defaultTheme = 'light' } = options;

  const [theme, setThemeState] = useState<ThemeType>(defaultTheme);
  const [changeCallbacks, setChangeCallbacks] = useState<Set<ThemeChangeCallback>>(new Set());
  const isInitialized = useRef(false);

  /**
   * Detects the system theme preference
   */
  const supportsSystemTheme =
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    globalThis.window !== undefined && typeof globalThis.window.matchMedia === 'function';

  const getSystemTheme = useCallback<() => ThemeType | undefined>(() => {
    if (!supportsSystemTheme) {
      return; // SSR / old browser → not available
    }

    return globalThis.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, [supportsSystemTheme]);

  /**
   * Notifies all registered callbacks about theme changes
   */
  const notifyThemeChange = useCallback(
    (newTheme: ThemeType, previousTheme: ThemeType) => {
      if (newTheme === previousTheme) return;

      for (const callback of changeCallbacks) {
        try {
          callback(newTheme, previousTheme);
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error in theme change callback:', error);
          }
        }
      }

      // Notify external callback if provided
      if (externalOnThemeChange) {
        try {
          externalOnThemeChange(newTheme, previousTheme);
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error in external theme change callback:', error);
          }
        }
      }
    },
    [changeCallbacks, externalOnThemeChange]
  );

  /**
   * Sets the theme with change notifications and persistence
   */
  const setTheme = useCallback(
    (newTheme: ThemeType) => {
      setThemeState((prevTheme) => {
        if (prevTheme !== newTheme) {
          // Persist theme preference
          if (persist) {
            try {
              localStorage.setItem(THEME_STORAGE_KEY, newTheme);
            } catch (error) {
              if (process.env.NODE_ENV === 'development') {
                console.warn('Failed to persist theme preference:', error);
              }
            }
          }

          // Notify change
          notifyThemeChange(newTheme, prevTheme);
        }
        return newTheme;
      });
    },
    [persist, notifyThemeChange]
  );

  /**
   * Toggles between light and dark themes
   */
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  /**
   * Resets theme to system preference or default
   */
  const resetToSystemTheme = useCallback(() => {
    const systemTheme = getSystemTheme();
    setTheme(systemTheme || defaultTheme);
  }, [getSystemTheme, setTheme, defaultTheme]);

  /**
   * Registers a callback for theme change events
   */
  const onThemeChange = useCallback((callback: ThemeChangeCallback) => {
    setChangeCallbacks((prev) => new Set(prev).add(callback));

    return () => {
      setChangeCallbacks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(callback);
        return newSet;
      });
    };
  }, []);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    if (isInitialized.current) return;

    let initialTheme = defaultTheme;

    // Try to get saved theme preference
    if (persist) {
      try {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === 'light' || savedTheme === 'dark') {
          initialTheme = savedTheme;
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to load saved theme preference:', error);
        }
      }
    }

    // Fall back to system theme if no saved preference and detection is enabled
    if ((detectSystemTheme && !persist) || (persist && !localStorage.getItem(THEME_STORAGE_KEY))) {
      const systemTheme = getSystemTheme();
      if (systemTheme) {
        initialTheme = systemTheme;
      }
    }

    setThemeState(initialTheme);
    isInitialized.current = true;
  }, [persist, detectSystemTheme, defaultTheme, getSystemTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (!supportsSystemTheme) return;

    const mql = globalThis.matchMedia('(prefers-color-scheme: dark)');
    const handle = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handle);
      return () => {
        mql.removeEventListener('change', handle);
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    mql.addListener(handle);
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      mql.removeListener(handle);
    };
  }, [setTheme, supportsSystemTheme]);

  // Apply theme to document element
  useEffect(() => {
    if (!isInitialized.current) return;

    const root = document.documentElement;

    // Update data attribute for CSS targeting
    root.dataset.theme = theme;

    // Update class for Tailwind dark mode
    root.classList.toggle('dark', theme === 'dark');

    // Update meta theme-color for mobile browsers
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', theme === 'dark' ? '#1f2937' : '#ffffff');
    }
  }, [theme]);

  // Derived state
  const isDark = useMemo(() => theme === 'dark', [theme]);
  const isLight = useMemo(() => theme === 'light', [theme]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      theme,
      toggleTheme,
      setTheme,
      isDark,
      isLight,
      supportsSystemTheme,
      getSystemTheme,
      resetToSystemTheme,
      onThemeChange,
    }),
    [
      theme,
      toggleTheme,
      setTheme,
      isDark,
      isLight,
      supportsSystemTheme,
      getSystemTheme,
      resetToSystemTheme,
      onThemeChange,
    ]
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};
