import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import { AvatarData } from '../components/atoms';

/**
 * Storage key for persisting avatar data in localStorage
 */
const STORAGE_KEY = 'ably-chat-ui-avatars';

/**
 * Callback function type for avatar change events
 */
export type AvatarChangeCallback = (
  type: 'user' | 'room',
  id: string,
  avatar: AvatarData,
  previousAvatar?: AvatarData
) => void;

/**
 * Options for avatar generation and management
 */
export interface AvatarOptions {
  /**
   * Whether to persist avatars to localStorage
   * @default true
   */
  persist?: boolean;

  /**
   * Custom color palette for avatar generation
   */
  customColors?: string[];

  /**
   * Maximum number of cached avatars (0 = unlimited)
   * @default 100
   */
  maxCacheSize?: number;

  /**
   * Error handler callback
   * @param error - The error that occurred
   */
  onError?: (error: unknown) => void;
}

/**
 * Persisted avatar data structure for localStorage
 */
export interface PersistedAvatarData {
  /** Cached avatars keyed by user `clientId` */
  userAvatars: Record<string, AvatarData>;

  /** Cached avatars keyed by room name */
  roomAvatars: Record<string, AvatarData>;

  /** Schema version of the persisted object */
  version: number;
}

/**
 * Shape of the AvatarContext value providing comprehensive avatar management
 */
export interface AvatarContextType {
  /**
   * Gets an avatar for a user if it exists in the cache
   * @param clientId - The unique identifier for the user
   * @param displayName - Optional display name (not used for lookup, only for creation)
   * @returns The avatar data if it exists, undefined otherwise
   */
  getAvatarForUser: (clientId: string, displayName?: string) => AvatarData | undefined;

  /**
   * Creates an avatar for a user and adds it to the cache
   * @param clientId - The unique identifier for the user
   * @param displayName - Optional display name (defaults to clientId if not provided)
   * @returns The created avatar data
   */
  createAvatarForUser: (clientId: string, displayName?: string) => AvatarData;

  /**
   * Gets an avatar for a room if it exists in the cache
   * @param roomName - The unique identifier for the room
   * @param displayName - Optional display name (not used for lookup, only for creation)
   * @returns The avatar data if it exists, undefined otherwise
   */
  getAvatarForRoom: (roomName: string, displayName?: string) => AvatarData | undefined;

  /**
   * Creates an avatar for a room and adds it to the cache
   * @param roomName - The unique identifier for the room
   * @param displayName - Optional display name (defaults to roomName if not provided)
   * @returns The created avatar data
   */
  createAvatarForRoom: (roomName: string, displayName?: string) => AvatarData;

  /**
   * Updates an existing user avatar or creates a new one
   * @param clientId - The unique identifier for the user
   * @param avatar - Partial avatar data to update
   */
  setUserAvatar: (clientId: string, avatar: Partial<AvatarData>) => void;

  /**
   * Updates an existing room avatar or creates a new one
   * @param roomName - The unique identifier for the room
   * @param avatar - Partial avatar data to update
   */
  setRoomAvatar: (roomName: string, avatar: Partial<AvatarData>) => void;

  /**
   * Returns all cached user avatars
   * @returns Record of user ID to avatar data
   */
  getUserAvatars: () => Record<string, AvatarData>;

  /**
   * Returns all cached room avatars
   * @returns Record of room ID to avatar data
   */
  getRoomAvatars: () => Record<string, AvatarData>;

  /**
   * Clears all user avatars from cache
   */
  clearUserAvatars: () => void;

  /**
   * Clears all room avatars from cache
   */
  clearRoomAvatars: () => void;

  /**
   * Clears all avatars from cache
   */
  clearAllAvatars: () => void;

  /**
   * Registers a callback for avatar change events
   * @param callback - Function to call when avatars change
   * @returns Cleanup function to remove the callback
   */
  onAvatarChange: (callback: AvatarChangeCallback) => () => void;

  /**
   * Exports all avatar data for backup/migration
   * @returns Serializable avatar data
   */
  exportAvatars: () => PersistedAvatarData;

  /**
   * Imports avatar data from backup/migration
   * @param data - Previously exported avatar data
   */
  importAvatars: (data: PersistedAvatarData) => void;
}

/**
 * React context for comprehensive avatar management
 * Provides avatar caching, persistence, and change notifications
 */
const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

/**
 * Default color palette for avatar generation
 * Carefully selected for accessibility and visual appeal
 */
const DEFAULT_AVATAR_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-red-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-yellow-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-fuchsia-500',
  'bg-sky-500',
];

/**
 * Current version for avatar data persistence schema
 */
const AVATAR_DATA_VERSION = 1;

/**
 * Hook for avatar generation logic
 * Handles color generation and initials extraction
 */
const useAvatarGeneration = (customColors?: string[]) => {
  const avatarColors = customColors || DEFAULT_AVATAR_COLORS;

  /**
   * Generates a deterministic color based on a string using a hash function
   */
  const generateColor = useCallback(
    (text: string): string => {
      let hash = 0;
      for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) - hash + text.charCodeAt(i)) & 0xffffffff;
      }
      return avatarColors[Math.abs(hash) % avatarColors.length];
    },
    [avatarColors]
  );

  /**
   * Generates initials from a display name with intelligent word parsing
   */
  const generateInitials = useCallback((displayName: string): string => {
    if (!displayName.trim()) return '??';

    // Remove common prefixes and clean the name
    const cleanName = displayName
      .trim()
      .replace(/^(mr|mrs|ms|dr|prof)\.?\s+/i, '')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ');

    const words = cleanName.split(' ').filter((word) => word.length > 0);

    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return cleanName.substring(0, 2).toUpperCase();
  }, []);

  return { generateColor, generateInitials };
};

/**
 * Hook for avatar change notifications
 * Manages callback registration and notification dispatching
 */
const useAvatarNotifications = (onError?: (error: unknown) => void) => {
  const [changeCallbacks, setChangeCallbacks] = useState<Set<AvatarChangeCallback>>(new Set());

  /**
   * Error handling helper
   */
  const handleError = useCallback(
    (error: unknown, context?: string) => {
      if (onError) {
        onError(error);
      } else if (process.env.NODE_ENV === 'development') {
        console.warn(`Avatar error${context ? ` (${context})` : ''}:`, error);
      }
    },
    [onError]
  );

  /**
   * Notifies all registered callbacks about avatar changes
   */
  const notifyAvatarChange = useCallback(
    (type: 'user' | 'room', id: string, avatar: AvatarData, previousAvatar?: AvatarData) => {
      changeCallbacks.forEach((callback) => {
        try {
          callback(type, id, avatar, previousAvatar);
        } catch (error) {
          handleError(error, 'Avatar change callback');
        }
      });
    },
    [changeCallbacks, handleError]
  );

  /**
   * Registers a callback for avatar change events
   */
  const onAvatarChange = useCallback((callback: AvatarChangeCallback) => {
    setChangeCallbacks((prev) => new Set(prev).add(callback));

    return () => {
      setChangeCallbacks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(callback);
        return newSet;
      });
    };
  }, []);

  return { notifyAvatarChange, onAvatarChange, handleError };
};

/**
 * Hook for avatar caching and persistence
 * Manages localStorage operations, cache size limits, and state management
 */
const useAvatarCache = (
  persist: boolean,
  maxCacheSize: number,
  handleError: (error: unknown, context?: string) => void
) => {
  const [userAvatars, setUserAvatars] = useState<Record<string, AvatarData>>({});
  const [roomAvatars, setRoomAvatars] = useState<Record<string, AvatarData>>({});
  const isInitialized = useRef(false);

  // Load persisted data on mount
  useEffect(() => {
    if (!persist || isInitialized.current) return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.version === AVATAR_DATA_VERSION) {
          setUserAvatars(parsed.userAvatars || {});
          setRoomAvatars(parsed.roomAvatars || {});
        } else {
          handleError(
            new Error(`Mismatched avatar data version: ${parsed.version}`),
            'Loading persisted avatars'
          );
        }
      }
    } catch (error) {
      handleError(error, 'Loading persisted avatars');
    }

    isInitialized.current = true;
  }, [persist, handleError]);

  // Persist data when avatars change
  useEffect(() => {
    if (!persist || !isInitialized.current) return;

    try {
      const data: PersistedAvatarData = {
        userAvatars,
        roomAvatars,
        version: AVATAR_DATA_VERSION,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      handleError(error, 'Saving persisted avatars');
    }
  }, [userAvatars, roomAvatars, persist, handleError]);

  /**
   * Manages cache size to prevent memory issues
   */
  const manageCacheSize = useCallback(
    (currentCache: Record<string, AvatarData>): Record<string, AvatarData> => {
      if (maxCacheSize === 0 || Object.keys(currentCache).length < maxCacheSize) {
        return currentCache;
      }

      // Remove oldest entries (simple LRU-like behavior)
      const entries = Object.entries(currentCache);
      const toKeep = entries.slice(1); // Remove first entry
      return Object.fromEntries(toKeep);
    },
    [maxCacheSize]
  );

  // Cache management methods
  const clearUserAvatars = useCallback(() => setUserAvatars({}), []);
  const clearRoomAvatars = useCallback(() => setRoomAvatars({}), []);
  const clearAllAvatars = useCallback(() => {
    setUserAvatars({});
    setRoomAvatars({});
  }, []);

  // Getter methods
  const getUserAvatars = useCallback(() => userAvatars, [userAvatars]);
  const getRoomAvatars = useCallback(() => roomAvatars, [roomAvatars]);

  // Import/export functionality
  const exportAvatars = useCallback(
    (): PersistedAvatarData => ({
      userAvatars,
      roomAvatars,
      version: AVATAR_DATA_VERSION,
    }),
    [userAvatars, roomAvatars]
  );

  const importAvatars = useCallback(
    (data: PersistedAvatarData) => {
      try {
        if (data.version === AVATAR_DATA_VERSION) {
          setUserAvatars(data.userAvatars || {});
          setRoomAvatars(data.roomAvatars || {});
        } else {
          handleError(
            new Error(`Unsupported avatar data version: ${data.version}`),
            'Importing avatars'
          );
        }
      } catch (error) {
        handleError(error, 'Importing avatars');
      }
    },
    [handleError]
  );

  return {
    userAvatars,
    roomAvatars,
    setUserAvatars,
    setRoomAvatars,
    manageCacheSize,
    clearUserAvatars,
    clearRoomAvatars,
    clearAllAvatars,
    getUserAvatars,
    getRoomAvatars,
    exportAvatars,
    importAvatars,
  };
};

/**
 * Props for the AvatarProvider component
 */
interface AvatarProviderProps {
  children: React.ReactNode;
  options?: AvatarOptions;
}

/**
 * AvatarProvider manages avatar state, caching, and persistence.
 *
 * Features:
 * - Automatic avatar generation with deterministic colors and initials
 * - Persistent caching in localStorage (configurable)
 * - Change notifications for avatar updates
 * - Import/export functionality to backup/restore avatars
 * - Memory management with configurable cache limits
 *
 * This provider uses the following hooks:
 * - useAvatarCache: Handles caching and persistence
 * - useAvatarGeneration: Handles color and initial generation
 * - useAvatarNotifications: Handles change callbacks
 *
 * @example
 * // Basic usage
 * <AvatarProvider>
 *   <ChatApplication />
 * </AvatarProvider>
 *
 * @example
 * // With custom configuration
 * <AvatarProvider
 *   options={{
 *     persist: true,
 *     maxCacheSize: 50,
 *     customColors: ['bg-brand-500', 'bg-brand-600']
 *   }}
 * >
 *   <ChatApplication />
 * </AvatarProvider>
 */
export const AvatarProvider: React.FC<AvatarProviderProps> = ({ children, options = {} }) => {
  const { persist = true, customColors, maxCacheSize = 100, onError } = options;
  const { generateColor, generateInitials } = useAvatarGeneration(customColors);
  const { notifyAvatarChange, onAvatarChange, handleError } = useAvatarNotifications(onError);

  // Guard against server-side rendering where window is undefined
  const isClient = typeof window !== 'undefined';

  const {
    userAvatars,
    roomAvatars,
    setUserAvatars,
    setRoomAvatars,
    manageCacheSize,
    clearUserAvatars,
    clearRoomAvatars,
    clearAllAvatars,
    getUserAvatars,
    getRoomAvatars,
    exportAvatars,
    importAvatars,
  } = useAvatarCache(isClient && persist, maxCacheSize, handleError);

  /**
   * Gets an avatar for a user if it exists in the cache
   * @param clientId - The unique identifier for the user
   * @returns The avatar data if it exists, undefined otherwise
   */
  const getAvatarForUser = useCallback(
    (clientId: string): AvatarData | undefined => {
      // Return cached avatar if it exists
      if (userAvatars[clientId]) {
        return userAvatars[clientId];
      }

      // Return undefined if avatar doesn't exist
      return undefined;
    },
    [userAvatars]
  );

  /**
   * Creates an avatar for a user and adds it to the cache
   * @param clientId - The unique identifier for the user
   * @param displayName - Optional display name (defaults to clientId if not provided)
   * @returns The created avatar data
   */
  const createAvatarForUser = useCallback(
    (clientId: string, displayName?: string): AvatarData => {
      const name = displayName || clientId;
      const newAvatar: AvatarData = {
        displayName: name,
        color: generateColor(clientId),
        initials: generateInitials(name),
      };

      // Update cache with size management
      setUserAvatars((prev) => {
        const managed = manageCacheSize(prev);
        const updated = { ...managed, [clientId]: newAvatar };

        notifyAvatarChange('user', clientId, newAvatar);

        return updated;
      });

      return newAvatar;
    },
    [generateColor, generateInitials, manageCacheSize, notifyAvatarChange, setUserAvatars]
  );

  /**
   * Gets an avatar for a room if it exists in the cache
   * @param roomName - The unique identifier for the room
   * @returns The avatar data if it exists, undefined otherwise
   */
  const getAvatarForRoom = useCallback(
    (roomName: string): AvatarData | undefined => {
      // Return cached avatar if it exists
      if (roomAvatars[roomName]) {
        return roomAvatars[roomName];
      }

      // Return undefined if avatar doesn't exist
      return undefined;
    },
    [roomAvatars]
  );

  /**
   * Creates an avatar for a room and adds it to the cache
   * @param roomName - The unique identifier for the room
   * @param displayName - Optional display name (defaults to roomName if not provided)
   * @returns The created avatar data
   */
  const createAvatarForRoom = useCallback(
    (roomName: string, displayName?: string): AvatarData => {
      // Use displayName or roomName directly
      const name = displayName || roomName;

      const newAvatar: AvatarData = {
        displayName: name,
        color: generateColor(roomName),
        initials: generateInitials(name),
      };

      // Update cache with size management
      setRoomAvatars((prev) => {
        const managed = manageCacheSize(prev);
        const updated = { ...managed, [roomName]: newAvatar };

        // Notify change in next tick
        notifyAvatarChange('room', roomName, newAvatar);

        return updated;
      });

      return newAvatar;
    },
    [generateColor, generateInitials, manageCacheSize, notifyAvatarChange, setRoomAvatars]
  );

  /**
   * Updates or creates a user avatar with change notifications
   */
  const setUserAvatar = useCallback(
    (clientId: string, avatar: Partial<AvatarData>) => {
      setUserAvatars((prev) => {
        const existing = prev[clientId];
        const name = avatar.displayName || existing?.displayName || clientId;

        const updatedAvatar: AvatarData = {
          displayName: name,
          color: avatar.color || existing?.color || generateColor(clientId),
          initials: avatar.initials || existing?.initials || generateInitials(name),
          src: avatar.src || existing?.src,
        };

        // Notify change
        notifyAvatarChange('user', clientId, updatedAvatar, existing);

        return { ...prev, [clientId]: updatedAvatar };
      });
    },
    [generateColor, generateInitials, notifyAvatarChange, setUserAvatars]
  );

  /**
   * Updates or creates a room avatar with change notifications
   */
  const setRoomAvatar = useCallback(
    (roomName: string, avatar: Partial<AvatarData>) => {
      setRoomAvatars((prev) => {
        const existing = prev[roomName];
        // Use roomName directly without processing
        const name = avatar.displayName || existing?.displayName || roomName;

        const updatedAvatar: AvatarData = {
          displayName: name,
          color: avatar.color || existing?.color || generateColor(roomName),
          initials: avatar.initials || existing?.initials || generateInitials(name),
          src: avatar.src || existing?.src,
        };

        // Notify change
        notifyAvatarChange('room', roomName, updatedAvatar, existing);

        return { ...prev, [roomName]: updatedAvatar };
      });
    },
    [generateColor, generateInitials, notifyAvatarChange, setRoomAvatars]
  );

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      getAvatarForUser,
      createAvatarForUser,
      getAvatarForRoom,
      createAvatarForRoom,
      setUserAvatar,
      setRoomAvatar,
      getUserAvatars,
      getRoomAvatars,
      clearUserAvatars,
      clearRoomAvatars,
      clearAllAvatars,
      onAvatarChange,
      exportAvatars,
      importAvatars,
    }),
    [
      getAvatarForUser,
      createAvatarForUser,
      getAvatarForRoom,
      createAvatarForRoom,
      setUserAvatar,
      setRoomAvatar,
      getUserAvatars,
      getRoomAvatars,
      clearUserAvatars,
      clearRoomAvatars,
      clearAllAvatars,
      onAvatarChange,
      exportAvatars,
      importAvatars,
    ]
  );

  return <AvatarContext.Provider value={contextValue}>{children}</AvatarContext.Provider>;
};

/**
 * Hook to access the avatar context with comprehensive avatar management.
 *
 * @returns The avatar context value
 * @throws Error if used outside of an AvatarProvider
 *
 * @example
 * // Basic usage
 * const { getAvatarForUser, setUserAvatar } = useAvatar();
 * const userAvatar = getAvatarForUser('user-123', 'John Doe');
 *
 * @example
 * // Listen for avatar changes
 * const { onAvatarChange } = useAvatar();
 * useEffect(() => {
 *   const cleanup = onAvatarChange((type, id, avatar, prev) => {
 *     console.log(`${type} avatar changed for ${id}`);
 *   });
 *   return cleanup;
 * }, [onAvatarChange]);
 *
 * @example
 * // Backup and restore avatars
 * const { exportAvatars, importAvatars } = useAvatar();
 * const backup = exportAvatars();
 * // ... later
 * importAvatars(backup);
 */
export const useAvatar = (): AvatarContextType => {
  const context = useContext(AvatarContext);

  if (context === undefined) {
    throw new Error(
      'useAvatar must be used within an AvatarProvider. ' +
        'Make sure your component is wrapped with <AvatarProvider>.'
    );
  }

  return context;
};
