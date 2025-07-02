import '@testing-library/jest-dom';

import { act,render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AvatarData } from '../../components/atoms/avatar.tsx';
import { AvatarContext, AvatarContextType } from '../../context/avatar-context.tsx';
import {
  AvatarProvider,
  cleanCache,
  PersistedAvatarData,
} from '../../providers/avatar-provider.tsx';

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

// Replace global loclaStorage
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
});

describe('AvatarProvider', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('cleanCache utility', () => {
    it('should remove undefined entries from a record', () => {
      const input = {
        user1: { displayName: 'User 1', color: 'bg-blue-500', initials: 'U1' },
        user2: undefined,
        user3: { displayName: 'User 3', color: 'bg-green-500', initials: 'U3' },
      };

      const result = cleanCache(input);

      expect(result).toEqual({
        user1: { displayName: 'User 1', color: 'bg-blue-500', initials: 'U1' },
        user3: { displayName: 'User 3', color: 'bg-green-500', initials: 'U3' },
      });
      expect(Object.keys(result).length).toBe(2);
      expect(result.user2).toBeUndefined();
    });
  });

  describe('AvatarProvider rendering', () => {
    it('should render children and provide context value', async () => {
      const ContextConsumer = () => {
        const context = React.useContext(AvatarContext);
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
        <AvatarProvider>
          <ContextConsumer />
        </AvatarProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('test-child')).toBeInTheDocument();
        expect(screen.getByTestId('context-provided')).toBeInTheDocument();
      });
    });
  });

  describe('Avatar creation and retrieval', () => {
    it('should create and retrieve avatars with proper defaults', async () => {
      const TestComponent = () => {
        const context = React.useContext(AvatarContext);
        const [avatarsCreated, setAvatarsCreated] = React.useState(false);

        React.useEffect(() => {
          if (context && !avatarsCreated) {
            // Create avatars with and without display names
            context.createAvatarForUser('user123', 'John Doe');
            context.createAvatarForRoom('general', 'General Chat');
            context.createAvatarForUser('user456');
            context.createAvatarForRoom('random');
            setAvatarsCreated(true);
          }
        }, [context, avatarsCreated]);

        if (!context || !avatarsCreated) {
          return <div data-testid="loading">Loading...</div>;
        }

        return (
          <div>
            <div data-testid="user-avatar-with-name">
              {JSON.stringify(context.getAvatarForUser('user123'))}
            </div>
            <div data-testid="room-avatar-with-name">
              {JSON.stringify(context.getAvatarForRoom('general'))}
            </div>
            <div data-testid="user-avatar-without-name">
              {JSON.stringify(context.getAvatarForUser('user456'))}
            </div>
            <div data-testid="room-avatar-without-name">
              {JSON.stringify(context.getAvatarForRoom('random'))}
            </div>
          </div>
        );
      };

      render(
        <AvatarProvider>
          <TestComponent />
        </AvatarProvider>
      );

      // Wait for the component to be ready
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Test user avatar with display name
      const userAvatarWithName = JSON.parse(
        screen.getByTestId('user-avatar-with-name').textContent ?? '{}'
      ) as AvatarData;
      expect(userAvatarWithName).toHaveProperty('displayName', 'John Doe');
      expect(userAvatarWithName).toHaveProperty('initials');
      expect(userAvatarWithName).toHaveProperty('color');

      // Test room avatar with display name
      const roomAvatarWithName = JSON.parse(
        screen.getByTestId('room-avatar-with-name').textContent ?? '{}'
      ) as AvatarData;
      expect(roomAvatarWithName).toHaveProperty('displayName', 'General Chat');
      expect(roomAvatarWithName).toHaveProperty('initials');
      expect(roomAvatarWithName).toHaveProperty('color');

      // Test user avatar without display name (should use ID)
      const userAvatarWithoutName = JSON.parse(
        screen.getByTestId('user-avatar-without-name').textContent ?? '{}'
      ) as AvatarData;
      expect(userAvatarWithoutName).toHaveProperty('displayName', 'user456');

      // Test room avatar without display name (should use ID)
      const roomAvatarWithoutName = JSON.parse(
        screen.getByTestId('room-avatar-without-name').textContent ?? '{}'
      ) as AvatarData;
      expect(roomAvatarWithoutName).toHaveProperty('displayName', 'random');
    });
  });

  describe('Avatar updates and notifications', () => {
    it('should update avatars and notify about changes', async () => {
      const changeCallback = vi.fn();

      const TestComponent = () => {
        const context = React.useContext(AvatarContext);
        const [callbackRegistered, setCallbackRegistered] = React.useState(false);
        const [operationsComplete, setOperationsComplete] = React.useState(false);

        React.useEffect(() => {
          if (context && !callbackRegistered) {
            context.onAvatarChange(changeCallback);
            setCallbackRegistered(true);
          }
        }, [context, callbackRegistered]);

        React.useEffect(() => {
          if (context && callbackRegistered && !operationsComplete) {
            // Execute in the expected order
            context.createAvatarForUser('user123', 'John Doe');
            context.createAvatarForRoom('general', 'General Chat');

            context.setUserAvatar('user123', {
              displayName: 'John Updated',
              color: 'bg-red-500',
              src: 'https://example.com/avatar.jpg',
            });

            context.setRoomAvatar('general', {
              displayName: 'Updated General',
              color: 'bg-purple-500',
            });

            setOperationsComplete(true);
          }
        }, [context, callbackRegistered, operationsComplete]);

        if (!context || !callbackRegistered || !operationsComplete) {
          return <div data-testid="loading">Loading...</div>;
        }

        return (
          <div>
            <div data-testid="user-avatar">
              {JSON.stringify(context.getAvatarForUser('user123'))}
            </div>
            <div data-testid="room-avatar">
              {JSON.stringify(context.getAvatarForRoom('general'))}
            </div>
            <div data-testid="update-status">Updated</div>
          </div>
        );
      };

      render(
        <AvatarProvider>
          <TestComponent />
        </AvatarProvider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('update-status')).toBeInTheDocument();
      });

      // Check updated user avatar
      const userAvatar = JSON.parse(screen.getByTestId('user-avatar').textContent ?? '{}') as AvatarData;
      expect(userAvatar).toHaveProperty('displayName', 'John Updated');
      expect(userAvatar).toHaveProperty('color', 'bg-red-500');
      expect(userAvatar).toHaveProperty('src', 'https://example.com/avatar.jpg');

      // Check updated room avatar
      const roomAvatar = JSON.parse(screen.getByTestId('room-avatar').textContent ?? '{}') as AvatarData;
      expect(roomAvatar).toHaveProperty('displayName', 'Updated General');
      expect(roomAvatar).toHaveProperty('color', 'bg-purple-500');

      // Check that change callback was called for all operations
      expect(changeCallback).toHaveBeenCalledTimes(4);

      expect(changeCallback.mock.calls[0]?.[0]).toBe('user');
      expect(changeCallback.mock.calls[0]?.[1]).toBe('user123');
      expect(changeCallback.mock.calls[0]?.[2]).toHaveProperty('displayName', 'John Doe');

      expect(changeCallback.mock.calls[1]?.[0]).toBe('user');
      expect(changeCallback.mock.calls[1]?.[1]).toBe('user123');
      expect(changeCallback.mock.calls[1]?.[2]).toHaveProperty('displayName', 'John Updated');
      expect(changeCallback.mock.calls[1]?.[3]).toHaveProperty('displayName', 'John Doe');

      expect(changeCallback.mock.calls[2]?.[0]).toBe('room');
      expect(changeCallback.mock.calls[2]?.[1]).toBe('general');
      expect(changeCallback.mock.calls[2]?.[2]).toHaveProperty('displayName', 'General Chat');

      expect(changeCallback.mock.calls[3]?.[0]).toBe('room');
      expect(changeCallback.mock.calls[3]?.[1]).toBe('general');
      expect(changeCallback.mock.calls[3]?.[2]).toHaveProperty('displayName', 'Updated General');
      expect(changeCallback.mock.calls[3]?.[3]).toHaveProperty('displayName', 'General Chat');
    });
  });

  describe('Persistence and cache management', () => {
    it('should persist avatars to localStorage and manage cache size', async () => {
      const TestComponent = () => {
        const context = React.useContext(AvatarContext);
        const [isReady, setIsReady] = React.useState(false);

        React.useEffect(() => {
          if (context) {
            const timer = setTimeout(() => {
              act(() => {
                context.createAvatarForUser('user1', 'User 1');
                context.createAvatarForUser('user2', 'User 2');
                context.createAvatarForUser('user3', 'User 3');
                context.createAvatarForRoom('room1', 'Room 1');
                setIsReady(true);
              });
            }, 0);

            return () => {
              clearTimeout(timer);
            };
          }
        }, [context]);

        if (!context || !isReady) {
          return <div data-testid="loading">Loading...</div>;
        }

        return (
          <div>
            <div data-testid="avatars">{Object.keys(context.getUserAvatars()).join(',')}</div>
          </div>
        );
      };

      // Render with maxCacheSize=2 to test cache limiting
      render(
        <AvatarProvider options={{ maxCacheSize: 2 }}>
          <TestComponent />
        </AvatarProvider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Check that cache is limited to 2 user avatars
      await waitFor(() => {
        const avatars = screen.getByTestId('avatars').textContent?.split(',') ?? [];
        expect(avatars.length).toBe(2);
        // The first avatar should have been removed
        expect(avatars).not.toContain('user1');
      });

      // Check that data was persisted to localStorage
      expect(localStorageMock.setItem).toHaveBeenCalled();
      const storageKey = 'ably-chat-ui-avatars';
      const storedData = JSON.parse(localStorageMock.getItem(storageKey) ?? '{}') as PersistedAvatarData;

      expect(storedData).toHaveProperty('version', 1);
      expect(storedData).toHaveProperty('userAvatars');
      expect(storedData).toHaveProperty('roomAvatars');
      expect(Object.keys(storedData.userAvatars)).toHaveLength(2);
      expect(Object.keys(storedData.roomAvatars)).toHaveLength(1);
    });

    it('should load persisted avatars and support clearing cache', async () => {
      const persistedData: PersistedAvatarData = {
        userAvatars: {
          user1: {
            displayName: 'Persisted User',
            color: 'bg-blue-500',
            initials: 'PU',
          },
        },
        roomAvatars: {
          room1: {
            displayName: 'Persisted Room',
            color: 'bg-green-500',
            initials: 'PR',
          },
        },
        version: 1,
      };

      localStorageMock.setItem('ably-chat-ui-avatars', JSON.stringify(persistedData));

      const TestComponent = () => {
        const context = React.useContext(AvatarContext);
        const [isReady, setIsReady] = React.useState(false);

        React.useEffect(() => {
          if (context) {
            const timer = setTimeout(() => {
              act(() => {
                // Clear user avatars
                context.clearUserAvatars();
                setIsReady(true);
              });
            }, 0);

            return () => { clearTimeout(timer); };
          }
        }, [context]);

        if (!context || !isReady) {
          return <div data-testid="loading">Loading...</div>;
        }

        return (
          <div>
            <div data-testid="user-avatars">{Object.keys(context.getUserAvatars()).length}</div>
            <div data-testid="room-avatars">{Object.keys(context.getRoomAvatars()).length}</div>
            <div data-testid="cleared">Cleared</div>
          </div>
        );
      };

      render(
        <AvatarProvider>
          <TestComponent />
        </AvatarProvider>
      );

      // Wait for clearing to complete
      await waitFor(() => {
        expect(screen.queryByTestId('cleared')).toBeInTheDocument();
      });

      // User avatars should be cleared, room avatars should remain
      expect(screen.getByTestId('user-avatars').textContent).toBe('0');
      expect(screen.getByTestId('room-avatars').textContent).toBe('1');
    });
  });

  describe('Import/Export functionality', () => {
    it('should export and import avatars', async () => {
      let context: AvatarContextType | undefined;

      const TestComponent = () => {
        context = React.useContext(AvatarContext);
        return <div data-testid="ready">Ready</div>;
      };

      render(
        <AvatarProvider>
          <TestComponent />
        </AvatarProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('ready')).toBeInTheDocument();
        expect(context).not.toBeNull();
      });


      act(() => {
        context?.createAvatarForUser('user1', 'User 1');
        context?.createAvatarForRoom('room1', 'Room 1');
      });

      await waitFor(() => {
        expect(context?.getAvatarForUser('user1')).toHaveProperty('displayName', 'User 1');
        expect(context?.getAvatarForRoom('room1')).toHaveProperty('displayName', 'Room 1');
      });

      // Export the data
      const exportedData = context?.exportAvatars();
      expect(exportedData).toBeDefined();
      expect(exportedData?.userAvatars.user1).toHaveProperty('displayName', 'User 1');
      expect(exportedData?.roomAvatars.room1).toHaveProperty('displayName', 'Room 1');

      act(() => {
        context?.clearAllAvatars();
      });

      await waitFor(() => {
        expect(context?.getAvatarForUser('user1')).toBeUndefined();
        expect(context?.getAvatarForRoom('room1')).toBeUndefined();
      });

      // Import the data back
      act(() => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        context?.importAvatars(exportedData!);
      });

      // Wait for import to complete and verify
      await waitFor(() => {
        expect(context?.getAvatarForUser('user1')).toHaveProperty('displayName', 'User 1');
        expect(context?.getAvatarForRoom('room1')).toHaveProperty('displayName', 'Room 1');
      });
    });
  });
});
