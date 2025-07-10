/**
 * ThemeContext provides theme state management (light/dark mode) across the application.
 *
 * @module ThemeContext
 */
import { createContext } from 'react';

import { ThemeChangeCallback, ThemeType } from '../providers/theme-provider.tsx';

/**
 * Shape of the ThemeContext value providing comprehensive theme management
 */
export interface ThemeContextType {
  /**
   * Current active theme
   */
  theme: ThemeType;

  /**
   * Toggles between light and dark themes
   */
  toggleTheme: () => void;

  /**
   * Sets a specific theme
   * @param theme - The theme to set
   */
  setTheme: (theme: ThemeType) => void;

  /**
   * Indicates if the current theme is dark
   */
  isDark: boolean;

  /**
   * Indicates if the current theme is light
   */
  isLight: boolean;

  /**
   * Indicates if system theme detection is supported
   */
  supportsSystemTheme: boolean;

  /**
   * Gets the current system theme preference
   * @returns The system theme preference or undefined if not available
   */
  getSystemTheme: () => ThemeType | undefined;

  /**
   * Resets theme to system preference (if available) or default
   */
  resetToSystemTheme: () => void;

  /**
   * Registers a callback for theme change events
   * @param callback - Function to call when theme changes
   * @returns Cleanup function to remove the callback
   */
  onThemeChange: (callback: ThemeChangeCallback) => () => void;
}

/**
 * React context for comprehensive theme management
 * Provides theme state, persistence, and system integration
 */
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
