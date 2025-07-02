import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { AvatarData } from '../components/atoms/avatar.tsx';
import { AvatarContext } from '../context/avatar-context.tsx';

/**
 * Removes any undefined entries from a record.
 *
 * @param cache - A record whose values may be T or undefined
 * @returns A new record containing only the entries whose values are defined
 */
export function cleanCache<T>(cache: Record<string, T | undefined>): Record<string, T> {
  const result: Record<string, T> = {};

  // Iterate through each key in the cache
  for (const key in cache) {
    const value = cache[key];
    if (value !== undefined) {
      // Narrowed to T, safe to assign
      result[key] = value;
    }
  }

  return result;
}

/**
 * Type guard to validate persisted avatar data structure
 */
const isValidPersistedData = (data: unknown): data is PersistedAvatarData => {
  if (!data || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.version === 'number' &&
    typeof obj.userAvatars === 'object' &&
    obj.userAvatars !== null &&
    typeof obj.roomAvatars === 'object' &&
    obj.roomAvatars !== null
  );
};
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
  /** Cached avatars keyed by user `clientId` (values may be undefined, but are cleaned before saving) */
  userAvatars: Record<string, AvatarData | undefined>;

  /** Cached avatars keyed by room name (values may be undefined, but are cleaned before saving) */
  roomAvatars: Record<string, AvatarData | undefined>;

  /** Schema version of the persisted object */
  version: number;
}

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
        hash = ((hash << 5) - hash + (text.codePointAt(i) ?? 0)) & 0xFFFFFFFF;
      }
      return avatarColors[Math.abs(hash) % avatarColors.length] || 'bg-gray-500';
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
      .replaceAll(/[^\w\s]/g, ' ')
      .replaceAll(/\s+/g, ' ');

    const words = cleanName.split(' ').filter((word: string) => word.length > 0);

    if (words.length >= 2) {
      const firstInitial = words[0]?.[0] || '';
      const secondInitial = words[1]?.[0] || '';
      return (firstInitial + secondInitial).toUpperCase();
    }
    return cleanName.slice(0, 2).toUpperCase();
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
      for (const callback of changeCallbacks) {
        try {
          callback(type, id, avatar, previousAvatar);
        } catch (error) {
          handleError(error, 'Avatar change callback');
        }
      }
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
  // allow undefined values in the cache
  const [userAvatars, setUserAvatars] = useState<Record<string, AvatarData | undefined>>({});
  const [roomAvatars, setRoomAvatars] = useState<Record<string, AvatarData | undefined>>({});
  const isInitialized = useRef(false);
  const isImporting = useRef(false);

  // helper to strip undefined entries
  // Load persisted data on mount
  useEffect(() => {
    if (!persist || isInitialized.current) return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);

        if (isValidPersistedData(parsed)) {
          if (parsed.version === AVATAR_DATA_VERSION) {
            setUserAvatars(parsed.userAvatars);
            setRoomAvatars(parsed.roomAvatars);
          } else {
            handleError(
              new Error(`Mismatched avatar data version: ${String(parsed.version)}`),
              'Loading persisted avatars'
            );
          }
        } else {
          handleError(
            new Error('Invalid avatar data format in localStorage'),
            'Loading persisted avatars'
          );
        }
      }
    } catch (error) {
      handleError(error, 'Loading persisted avatars');
    }

    isInitialized.current = true;
  }, [persist, handleError]);

  // Persist data when avatars change (clean out undefined first)
  useEffect(() => {
    if (!persist || !isInitialized.current || isImporting.current) return;

    try {
      const data: PersistedAvatarData = {
        userAvatars: cleanCache(userAvatars),
        roomAvatars: cleanCache(roomAvatars),
        version: AVATAR_DATA_VERSION,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      handleError(error, 'Saving persisted avatars');
    }
  }, [userAvatars, roomAvatars, persist, handleError]);

  // Reset the importing flag after state changes are committed
  useLayoutEffect(() => {
    if (isImporting.current) {
      isImporting.current = false;
    }
  }, [userAvatars, roomAvatars]);

  /**
   * Manages cache size to prevent memory issues
   */
  const manageCacheSize = useCallback(
    (
      currentCache: Record<string, AvatarData | undefined>
    ): Record<string, AvatarData | undefined> => {
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
  const clearUserAvatars = useCallback(() => {
    setUserAvatars({});
  }, []);
  const clearRoomAvatars = useCallback(() => {
    setRoomAvatars({});
  }, []);
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
      userAvatars: cleanCache(userAvatars),
      roomAvatars: cleanCache(roomAvatars),
      version: AVATAR_DATA_VERSION,
    }),
    [userAvatars, roomAvatars]
  );

  const importAvatars = useCallback(
    (data: PersistedAvatarData) => {
      try {
        if (data.version === AVATAR_DATA_VERSION) {
          // Set the importing flag to prevent the persistence effect from running
          isImporting.current = true;
          setUserAvatars(data.userAvatars);
          setRoomAvatars(data.roomAvatars);
        } else {
          handleError(
            new Error(`Unsupported avatar data version: ${String(data.version)}`),
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
export interface AvatarProviderProps {
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
export const AvatarProvider = ({ children, options = {} }: AvatarProviderProps) => {
  const { persist = true, customColors, maxCacheSize = 100, onError } = options;
  const { generateColor, generateInitials } = useAvatarGeneration(customColors);
  const { notifyAvatarChange, onAvatarChange, handleError } = useAvatarNotifications(onError);

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
  } = useAvatarCache(persist, maxCacheSize, handleError);

  /**
   * Gets an avatar for a user if it exists in the cache
   * @param clientId - The unique identifier for the user
   * @returns The avatar data if it exists, undefined otherwise
   */
  const getAvatarForUser = useCallback(
    (clientId: string): AvatarData | undefined => {
      return userAvatars[clientId];
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
      return roomAvatars[roomName];
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
        const name = avatar.displayName || existing?.displayName || roomName;

        const updatedAvatar: AvatarData = {
          displayName: name,
          color: avatar.color || existing?.color || generateColor(roomName),
          initials: avatar.initials || existing?.initials || generateInitials(name),
          src: avatar.src || existing?.src,
        };

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
