import '@testing-library/jest-dom';

import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ThemeContext, ThemeContextType } from '../../context/theme-context.tsx';
import { useTheme } from '../../hooks/use-theme.tsx';
import { ThemeType } from '../../providers/theme-provider.tsx';

describe('useTheme Hook', () => {
  const mockThemeContext: ThemeContextType = {
    theme: 'light' as ThemeType,
    toggleTheme: vi.fn(),
    setTheme: vi.fn(),
    isDark: false,
    isLight: true,
    supportsSystemTheme: true,
    getSystemTheme: vi.fn((): ThemeType => 'light'),
    resetToSystemTheme: vi.fn(),
    onThemeChange: vi.fn(() => () => {}),
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeContext.Provider value={mockThemeContext}>{children}</ThemeContext.Provider>
  );

  it('should return the theme context when used within ThemeProvider', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current).toBe(mockThemeContext);
    expect(result.current.theme).toBe('light');
    expect(result.current.isDark).toBe(false);
    expect(result.current.isLight).toBe(true);
    expect(result.current.toggleTheme).toBe(mockThemeContext.toggleTheme);
    expect(result.current.setTheme).toBe(mockThemeContext.setTheme);
    expect(result.current.supportsSystemTheme).toBe(true);
    expect(result.current.getSystemTheme).toBe(mockThemeContext.getSystemTheme);
    expect(result.current.resetToSystemTheme).toBe(mockThemeContext.resetToSystemTheme);
    expect(result.current.onThemeChange).toBe(mockThemeContext.onThemeChange);
  });

  it('should throw an error when used outside of ThemeProvider', () => {
    const mockConsoleLog = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Expect the hook to throw an error when rendered without a provider
    expect(() => {
      renderHook(() => useTheme());
    }).toThrow('useTheme must be used within a ThemeProvider');

    // Restore console.error
    mockConsoleLog.mockRestore();
  });
});
