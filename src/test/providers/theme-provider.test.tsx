import '@testing-library/jest-dom';

import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeContext } from '../../context/theme-context.tsx';
import { ThemeProvider } from '../../providers/theme-provider.tsx';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      Reflect.deleteProperty(store, key);
    }),
  };
})();

// Replace the global localStorage with our mock
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
});


const matchMediaMock = () => {
  return {
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  };
};

Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(matchMediaMock),
});

describe('ThemeProvider', () => {
  let mockMatchMedia: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    localStorage.clear();

    mockMatchMedia = vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      media: '',
      onchange: null,
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(globalThis, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('ThemeProvider rendering', () => {
    it('should render children and provide context value', async () => {
      const ContextConsumer = () => {
        const context = React.useContext(ThemeContext);
        return (
          <div>
            <div data-testid="test-child">Test Child</div>
            {context ? (
              <span data-testid="context-provided">Context Provided</span>
            ) : (
              <span>No Context</span>
            )}
          </div>
        );
      };

      render(
        <ThemeProvider>
          <ContextConsumer />
        </ThemeProvider>
      );

      // Wait for the component to initialize
      await waitFor(() => {
        expect(screen.getByTestId('test-child')).toBeInTheDocument();
        expect(screen.getByTestId('context-provided')).toBeInTheDocument();
      });
    });
  });

  describe('Default theme', () => {
    it('should use light theme as default when no options are provided', async () => {
      const TestComponent = () => {
        const context = React.useContext(ThemeContext);
        return <div>{context && <div data-testid="theme">{context.theme}</div>}</div>;
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('theme').textContent).toBe('light');
      });
    });

    it('should use custom default theme when provided', async () => {
      const TestComponent = () => {
        const context = React.useContext(ThemeContext);
        const [isReady, setIsReady] = React.useState(false);

        React.useEffect(() => {
          if (context) {
            // Wait for the provider to initialize
            const timer = setTimeout(() => {
              setIsReady(true);
            }, 0);

            return () => { clearTimeout(timer); };
          }
        }, [context]);

        if (!context || !isReady) {
          return <div data-testid="loading">Loading...</div>;
        }

        return <div data-testid="theme">{context.theme}</div>;
      };

      render(
        <ThemeProvider options={{ detectSystemTheme: false, persist: false, defaultTheme: 'dark' }}>
          <TestComponent />
        </ThemeProvider>
      );

      // Wait for the component to be ready
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByTestId('theme').textContent).toBe('dark');
      });
    });
  });

  describe('Theme toggling', () => {
    it('should toggle theme when toggleTheme is called', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const context = React.useContext(ThemeContext);
        return (
          <div>
            {context && (
              <>
                <div data-testid="theme">{context.theme}</div>
                <button
                  data-testid="toggle-button"
                  onClick={() => {
                    context.toggleTheme();
                  }}
                >
                  Toggle Theme
                </button>
              </>
            )}
          </div>
        );
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Wait for initial theme to be set
      await waitFor(() => {
        expect(screen.getByTestId('theme').textContent).toBe('light');
      });

      // Toggle theme
      await user.click(screen.getByTestId('toggle-button'));

      // Wait for theme change
      await waitFor(() => {
        expect(screen.getByTestId('theme').textContent).toBe('dark');
      });

      // Toggle theme again
      await user.click(screen.getByTestId('toggle-button'));

      // Wait for theme change back to light
      await waitFor(() => {
        expect(screen.getByTestId('theme').textContent).toBe('light');
      });
    });
  });

  describe('setTheme function', () => {
    it('should set theme to specified value', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const context = React.useContext(ThemeContext);
        return (
          <div>
            {context && (
              <>
                <div data-testid="theme">{context.theme}</div>
                <button
                  data-testid="set-light"
                  onClick={() => {
                    context.setTheme('light');
                  }}
                >
                  Set Light
                </button>
                <button
                  data-testid="set-dark"
                  onClick={() => {
                    context.setTheme('dark');
                  }}
                >
                  Set Dark
                </button>
              </>
            )}
          </div>
        );
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Wait for initial theme
      await waitFor(() => {
        expect(screen.getByTestId('theme').textContent).toBe('light');
      });

      // Set theme to dark
      await user.click(screen.getByTestId('set-dark'));
      await waitFor(() => {
        expect(screen.getByTestId('theme').textContent).toBe('dark');
      });

      // Set theme to light
      await user.click(screen.getByTestId('set-light'));
      await waitFor(() => {
        expect(screen.getByTestId('theme').textContent).toBe('light');
      });
    });
  });

  describe('isDark and isLight properties', () => {
    it('should correctly reflect current theme state', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const context = React.useContext(ThemeContext);
        return (
          <div>
            {context && (
              <>
                <div data-testid="is-dark">{String(context.isDark)}</div>
                <div data-testid="is-light">{String(context.isLight)}</div>
                <button
                  data-testid="toggle-button"
                  onClick={() => {
                    context.toggleTheme();
                  }}
                >
                  Toggle Theme
                </button>
              </>
            )}
          </div>
        );
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Wait for initial state
      await waitFor(() => {
        expect(screen.getByTestId('is-light').textContent).toBe('true');
        expect(screen.getByTestId('is-dark').textContent).toBe('false');
      });

      // Toggle theme
      await user.click(screen.getByTestId('toggle-button'));

      // Wait for state change
      await waitFor(() => {
        expect(screen.getByTestId('is-light').textContent).toBe('false');
        expect(screen.getByTestId('is-dark').textContent).toBe('true');
      });
    });
  });

  describe('Theme persistence', () => {
    it('should persist theme preference to localStorage', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const context = React.useContext(ThemeContext);
        return (
          <div>
            {context && (
              <>
                <div data-testid="theme">{context.theme}</div>
                <button
                  data-testid="toggle-button"
                  onClick={() => {
                    context.toggleTheme();
                  }}
                >
                  Toggle Theme
                </button>
              </>
            )}
          </div>
        );
      };

      render(
        <ThemeProvider options={{ persist: true }}>
          <TestComponent />
        </ThemeProvider>
      );

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toBeInTheDocument();
      });

      // Toggle theme to dark
      await user.click(screen.getByTestId('toggle-button'));

      await waitFor(() => {
        expect(screen.getByTestId('theme').textContent).toBe('dark');
        // Check that theme was persisted to localStorage
        expect(localStorageMock.setItem).toHaveBeenCalledWith('ably-chat-ui-theme', 'dark');
      });
    });

    it('should load persisted theme from localStorage', async () => {
      localStorageMock.setItem('ably-chat-ui-theme', 'dark');

      const TestComponent = () => {
        const context = React.useContext(ThemeContext);
        return <div>{context && <div data-testid="theme">{context.theme}</div>}</div>;
      };

      render(
        <ThemeProvider options={{ persist: true }}>
          <TestComponent />
        </ThemeProvider>
      );

      // Wait for theme to be loaded from localStorage
      await waitFor(() => {
        expect(screen.getByTestId('theme').textContent).toBe('dark');
      });
    });

    it('should not persist theme when persist option is false', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const context = React.useContext(ThemeContext);
        return (
          <div>
            {context && (
              <>
                <div data-testid="theme">{context.theme}</div>
                <button
                  data-testid="toggle-button"
                  onClick={() => {
                    context.toggleTheme();
                  }}
                >
                  Toggle Theme
                </button>
              </>
            )}
          </div>
        );
      };

      render(
        <ThemeProvider options={{ persist: false }}>
          <TestComponent />
        </ThemeProvider>
      );

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toBeInTheDocument();
      });

      // Toggle theme to dark
      await user.click(screen.getByTestId('toggle-button'));

      await waitFor(() => {
        expect(screen.getByTestId('theme').textContent).toBe('dark');
      });

      // Check that theme was not persisted to localStorage
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe('System theme detection', () => {
    it('should detect system theme when detectSystemTheme is true', async () => {
      const mockMatchMedia = vi.fn((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        media: query,
        onchange: null,
        dispatchEvent: vi.fn(),
      }));


      Object.defineProperty(globalThis, 'matchMedia', {
        writable: true,
        value: mockMatchMedia,
      });

      const TestComponent = () => {
        const context = React.useContext(ThemeContext);
        return (
          <div>
            {context && (
              <>
                <div data-testid="theme">{context.theme}</div>
                <div data-testid="system-theme">{context.getSystemTheme() || 'none'}</div>
              </>
            )}
          </div>
        );
      };

      render(
        <ThemeProvider options={{ detectSystemTheme: true, persist: false }}>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        // System theme should be detected as dark
        expect(screen.getByTestId('system-theme').textContent).toBe('dark');
        // Theme should be set to system theme
        expect(screen.getByTestId('theme').textContent).toBe('dark');
      });
    });

    it('should reset to system theme when resetToSystemTheme is called', async () => {
      const user = userEvent.setup();

      const mockMatchMedia = vi.fn((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        media: query,
        onchange: null,
        dispatchEvent: vi.fn(),
      }));

      // Replace global matchMedia with mock
      Object.defineProperty(globalThis, 'matchMedia', {
        writable: true,
        value: mockMatchMedia,
      });

      const TestComponent = () => {
        const context = React.useContext(ThemeContext);
        return (
          <div>
            {context && (
              <>
                <div data-testid="theme">{context.theme}</div>
                <button
                  data-testid="set-light"
                  onClick={() => {
                    context.setTheme('light');
                  }}
                >
                  Set Light
                </button>
                <button
                  data-testid="reset-button"
                  onClick={() => {
                    context.resetToSystemTheme();
                  }}
                >
                  Reset to System
                </button>
              </>
            )}
          </div>
        );
      };

      render(
        <ThemeProvider options={{ detectSystemTheme: true }}>
          <TestComponent />
        </ThemeProvider>
      );

      // Wait for initial theme detection
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toBeInTheDocument();
      });

      // Set theme to light (overriding system theme)
      await user.click(screen.getByTestId('set-light'));
      await waitFor(() => {
        expect(screen.getByTestId('theme').textContent).toBe('light');
      });

      // Reset to system theme (dark)
      await user.click(screen.getByTestId('reset-button'));
      await waitFor(() => {
        expect(screen.getByTestId('theme').textContent).toBe('dark');
      });
    });
  });

  describe('Theme change notifications', () => {
    it('should notify about theme changes via onThemeChange', async () => {
      const changeCallback = vi.fn();
      const TestComponent = () => {
        const context = React.useContext(ThemeContext);
        const [callbackRegistered, setCallbackRegistered] = React.useState(false);
        const [firstToggleDone, setFirstToggleDone] = React.useState(false);
        const [secondToggleDone, setSecondToggleDone] = React.useState(false);

        // We need to wait till the callbacks are registered by the provider
        React.useEffect(() => {
          if (context && !callbackRegistered) {
            context.onThemeChange(changeCallback);
            setCallbackRegistered(true);
          }
        }, [context, callbackRegistered]);

        React.useEffect(() => {
          if (context && callbackRegistered && !firstToggleDone) {
            const timer = setTimeout(() => {
              act(() => {
                context.toggleTheme(); // light -> dark
                setFirstToggleDone(true);
              });
            }, 0);

            return () => {
              clearTimeout(timer);
            };
          }
        }, [context, callbackRegistered, firstToggleDone]);

        React.useEffect(() => {
          if (context && firstToggleDone && !secondToggleDone) {
            const timer = setTimeout(() => {
              act(() => {
                context.toggleTheme(); // dark -> light
                setSecondToggleDone(true);
              });
            }, 0);

            return () => {
              clearTimeout(timer);
            };
          }
        }, [context, firstToggleDone, secondToggleDone]);

        if (!context || !callbackRegistered || !firstToggleDone || !secondToggleDone) {
          return <div data-testid="loading">Loading...</div>;
        }

        return (
          <div>
            <div data-testid="theme">{context.theme}</div>
            <div data-testid="operations-complete">Complete</div>
          </div>
        );
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('operations-complete')).toBeInTheDocument();
      });

      // Callback should be called twice
      expect(changeCallback).toHaveBeenCalledTimes(2);

      // First call: light -> dark
      expect(changeCallback.mock.calls[0]?.[0]).toBe('dark');
      expect(changeCallback.mock.calls[0]?.[1]).toBe('light');

      // Second call: dark -> light
      expect(changeCallback.mock.calls[1]?.[0]).toBe('light');
      expect(changeCallback.mock.calls[1]?.[1]).toBe('dark');
    });

    it('should call external onThemeChange callback when provided', async () => {
      const externalCallback = vi.fn();

      const TestComponent = () => {
        const context = React.useContext(ThemeContext);
        const [operationsComplete, setOperationsComplete] = React.useState(false);

        React.useEffect(() => {
          if (context && !operationsComplete) {
            // Wait for next tick to ensure context is fully initialized
            const timer = setTimeout(() => {
              act(() => {
                context.toggleTheme(); // light -> dark
                setOperationsComplete(true);
              });
            }, 0);

            return () => {
              clearTimeout(timer);
            };
          }
        }, [context, operationsComplete]);

        if (!context || !operationsComplete) {
          return <div data-testid="loading">Loading...</div>;
        }

        return (
          <div>
            <div data-testid="theme">{context.theme}</div>
            <div data-testid="operations-complete">Complete</div>
          </div>
        );
      };

      render(
        <ThemeProvider onThemeChange={externalCallback}>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('operations-complete')).toBeInTheDocument();
      });

      // External callback should be called once
      expect(externalCallback).toHaveBeenCalledTimes(1);
      expect(externalCallback).toHaveBeenCalledWith('dark', 'light');
    });
  });

  describe('DOM updates', () => {
    it('should update document element with theme attributes', async () => {
      const user = userEvent.setup();

      const classListSpy = vi.spyOn(document.documentElement.classList, 'toggle');

      const TestComponent = () => {
        const context = React.useContext(ThemeContext);
        return (
          <div>
            {context && (
              <>
                <div data-testid="theme">{context.theme}</div>
                <button
                  data-testid="toggle-button"
                  onClick={() => {
                    context.toggleTheme();
                  }}
                >
                  Toggle Theme
                </button>
              </>
            )}
          </div>
        );
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toBeInTheDocument();
      });

      // Toggle theme to dark
      await user.click(screen.getByTestId('toggle-button'));

      await waitFor(() => {
        // Check that document element was updated
        expect(document.documentElement.dataset.theme).toBe('dark');
        expect(classListSpy).toHaveBeenCalledWith('dark', true);
      });
    });
  });
});
