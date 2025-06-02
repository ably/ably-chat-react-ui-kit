/**
 * ThemeContext provides theme state management (light/dark mode) across the application.
 *
 * @module ThemeContext
 */
import React, { createContext, useState, useEffect, ReactNode } from 'react';

/**
 * Defines the shape of the theme context.
 */
export interface ThemeContextType {
  /** Current theme, either 'light' or 'dark'. */
  theme: string;
  /** Function to toggle between 'light' and 'dark' themes. */
  toggleTheme: () => void;
}

/**
 * React context for theme management with default values.
 */
export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
});

/**
 * Props for the ThemeProvider component.
 */
interface ThemeProviderProps {
  /** Child components that will have access to the theme context. */
  children: ReactNode;
}

/**
 * ThemeProvider component that manages and provides theme state to its children.
 *
 * @param {ThemeProviderProps} props - Component props.
 * @returns {React.ReactElement} Theme context provider wrapping child components.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState('light');

  // Apply the current theme to the document root element.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Toggle between 'light' and 'dark' themes.
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};
