import React, { 
  createContext, 
  useContext, 
  useState, 
  useCallback, 
  ReactNode, 
  useMemo, 
  useEffect,
  useRef 
} from 'react';
import { AvatarData } from '../components/atoms/Avatar';

/**
 * Storage key for persisting avatar data in localStorage
 */
const STORAGE_KEY = 'chat-ui-avatars';

/**
 * Callback function type for avatar change events
 */
type AvatarChangeCallback = (
  type: 'user' | 'room', 
  id: string, 
  avatar: AvatarData, 
  previousAvatar?: AvatarData
) => void;

/**
 * Options for avatar generation and management
 */
interface AvatarOptions {
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
}

/**
 * Persisted avatar data structure for localStorage
 */
interface PersistedAvatarData {
  userAvatars: Record<string, AvatarData>;
  roomAvatars: Record<string, AvatarData>;
  version: number;
}

/**
 * Shape of the AvatarContext value providing comprehensive avatar management
 */
interface AvatarContextType {
  /**
   * Gets or creates an avatar for a user with automatic caching
   * @param userId - The unique identifier for the user
   * @param displayName - Optional display name (defaults to userId if not provided)
   * @returns An AvatarData object for the user
   */
  getAvatarForUser: (userId: string, displayName?: string) => AvatarData;
  
  /**
   * Gets or creates an avatar for a room with automatic caching
   * @param roomId - The unique identifier for the room
   * @param roomName - Optional room name (defaults to processed roomId if not provided)
   * @returns An AvatarData object for the room
   */
  getAvatarForRoom: (roomId: string, roomName?: string) => AvatarData;

  /**
   * Updates an existing user avatar or creates a new one
   * @param userId - The unique identifier for the user
   * @param avatar - Partial avatar data to update
   */
  setUserAvatar: (userId: string, avatar: Partial<AvatarData>) => void;
  
  /**
   * Updates an existing room avatar or creates a new one
   * @param roomId - The unique identifier for the room
   * @param avatar - Partial avatar data to update
   */
  setRoomAvatar: (roomId: string, avatar: Partial<AvatarData>) => void;

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
] as const;

/**
 * Current version for avatar data persistence schema
 */
const AVATAR_DATA_VERSION = 1;

/**
 * Props for the AvatarProvider component
 */
interface AvatarProviderProps {
  /**
   * Child components that will have access to the avatar context
   */
  children: ReactNode;
  
  /**
   * Configuration options for avatar management
   */
  options?: AvatarOptions;
}

/**
 * AvatarProvider manages avatar state, caching, and persistence across the application
 * 
 * Features:
 * - Automatic avatar generation with deterministic colors and initials
 * - Persistent caching in localStorage (configurable)
 * - Change notifications for avatar updates
 * - Import/export functionality for data migration
 * - Memory management with configurable cache limits
 * - Type-safe avatar operations
 * 
 * TODO: Consider breaking this provider into smaller hooks:
 * - useAvatarCache: Handle caching and persistence
 * - useAvatarGeneration: Handle color and initial generation
 * - useAvatarNotifications: Handle change callbacks
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
export const AvatarProvider: React.FC<AvatarProviderProps> = ({ 
  children, 
  options = {} 
}) => {
  const {
    persist = true,
    customColors,
    maxCacheSize = 100
  } = options;

  // Use custom colors or default palette
  const avatarColors = customColors || DEFAULT_AVATAR_COLORS;
  
  // State for avatar storage
  const [userAvatars, setUserAvatars] = useState<Record<string, AvatarData>>({});
  const [roomAvatars, setRoomAvatars] = useState<Record<string, AvatarData>>({});
  const [changeCallbacks, setChangeCallbacks] = useState<Set<AvatarChangeCallback>>(new Set());
  
  // Refs for performance optimization
  const isInitialized = useRef(false);

  // Load persisted data on mount
  useEffect(() => {
    if (!persist || isInitialized.current) return;
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data: PersistedAvatarData = JSON.parse(saved);
        // Validate version compatibility
        if (data.version === AVATAR_DATA_VERSION) {
          setUserAvatars(data.userAvatars || {});
          setRoomAvatars(data.roomAvatars || {});
        }
      }
    } catch (error) {
      // TODO: Replace with proper error reporting service in production
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to load persisted avatar data:', error);
      }
    }
    
    isInitialized.current = true;
  }, [persist]);

  // Persist data when avatars change
  useEffect(() => {
    if (!persist || !isInitialized.current) return;
    
    try {
      const data: PersistedAvatarData = {
        userAvatars,
        roomAvatars,
        version: AVATAR_DATA_VERSION
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to persist avatar data:', error);
      }
    }
  }, [userAvatars, roomAvatars, persist]);

  /**
   * Generates a deterministic color based on a string using a hash function
   * @param text - The text to generate a color from
   * @returns A Tailwind CSS color class
   */
  const generateColor = useCallback((text: string): string => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash + text.charCodeAt(i)) & 0xffffffff;
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
  }, [avatarColors]);

  /**
   * Generates initials from a display name with intelligent word parsing
   * @param displayName - The name to generate initials from
   * @returns Up to 2 characters of initials
   */
  const generateInitials = useCallback((displayName: string): string => {
    if (!displayName.trim()) return '??';
    
    // Remove common prefixes and clean the name
    const cleanName = displayName
      .trim()
      .replace(/^(mr|mrs|ms|dr|prof)\.?\s+/i, '')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ');
    
    const words = cleanName.split(' ').filter(word => word.length > 0);
    
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return cleanName.substring(0, 2).toUpperCase();
  }, []);

  /**
   * Manages cache size to prevent memory issues
   */
  const manageCacheSize = useCallback((
    currentCache: Record<string, AvatarData>,
    newKey: string
  ): Record<string, AvatarData> => {
    if (maxCacheSize === 0 || Object.keys(currentCache).length < maxCacheSize) {
      return currentCache;
    }
    
    // Remove oldest entries (simple LRU-like behavior)
    const entries = Object.entries(currentCache);
    const toKeep = entries.slice(1); // Remove first entry
    return Object.fromEntries(toKeep);
  }, [maxCacheSize]);

  /**
   * Notifies all registered callbacks about avatar changes
   */
  const notifyAvatarChange = useCallback((
    type: 'user' | 'room',
    id: string,
    avatar: AvatarData,
    previousAvatar?: AvatarData
  ) => {
    changeCallbacks.forEach(callback => {
      try {
        callback(type, id, avatar, previousAvatar);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error in avatar change callback:', error);
        }
      }
    });
  }, [changeCallbacks]);

  /**
   * Gets or creates an avatar for a user with caching and notifications
   */
  const getAvatarForUser = useCallback((userId: string, displayName?: string): AvatarData => {
    // Return cached avatar if it exists
    if (userAvatars[userId]) {
      return userAvatars[userId];
    }

    // Create new avatar
    const name = displayName || userId;
    const newAvatar: AvatarData = {
      displayName: name,
      color: generateColor(userId),
      initials: generateInitials(name),
    };

    // Update cache with size management
    setUserAvatars(prev => {
      const managed = manageCacheSize(prev, userId);
      const updated = { ...managed, [userId]: newAvatar };
      
      // Notify change in next tick to avoid state update during render
      setTimeout(() => notifyAvatarChange('user', userId, newAvatar), 0);
      
      return updated;
    });

    return newAvatar;
  }, [userAvatars, generateColor, generateInitials, manageCacheSize, notifyAvatarChange]);

  /**
   * Gets or creates an avatar for a room with intelligent name processing
   */
  const getAvatarForRoom = useCallback((roomId: string, roomName?: string): AvatarData => {
    // Return cached avatar if it exists  
    if (roomAvatars[roomId]) {
      return roomAvatars[roomId];
    }

    // Process room name with better formatting
    const name = roomName || roomId
      .replace(/^room-\d+-/, '') // Remove room- prefix
      .replace(/[-_]/g, ' ') // Replace dashes and underscores with spaces
      .replace(/\b\w/g, l => l.toUpperCase()); // Title case

    const newAvatar: AvatarData = {
      displayName: name,
      color: generateColor(roomId),
      initials: generateInitials(name),
    };

    // Update cache with size management
    setRoomAvatars(prev => {
      const managed = manageCacheSize(prev, roomId);
      const updated = { ...managed, [roomId]: newAvatar };
      
      // Notify change in next tick
      setTimeout(() => notifyAvatarChange('room', roomId, newAvatar), 0);
      
      return updated;
    });

    return newAvatar;
  }, [roomAvatars, generateColor, generateInitials, manageCacheSize, notifyAvatarChange]);

  /**
   * Updates or creates a user avatar with change notifications
   */
  const setUserAvatar = useCallback((userId: string, avatar: Partial<AvatarData>) => {
    setUserAvatars(prev => {
      const existing = prev[userId];
      const name = avatar.displayName || existing?.displayName || userId;
      
      const updatedAvatar: AvatarData = {
        displayName: name,
        color: avatar.color || existing?.color || generateColor(userId),
        initials: avatar.initials || existing?.initials || generateInitials(name),
        src: avatar.src || existing?.src,
      };

      // Notify change
      setTimeout(() => notifyAvatarChange('user', userId, updatedAvatar, existing), 0);
      
      return { ...prev, [userId]: updatedAvatar };
    });
  }, [generateColor, generateInitials, notifyAvatarChange]);

  /**
   * Updates or creates a room avatar with change notifications
   */
  const setRoomAvatar = useCallback((roomId: string, avatar: Partial<AvatarData>) => {
    setRoomAvatars(prev => {
      const existing = prev[roomId];
      const defaultName = roomId.replace(/^room-\d+-/, '').replace(/[-_]/g, ' ');
      const name = avatar.displayName || existing?.displayName || defaultName;

      const updatedAvatar: AvatarData = {
        displayName: name,
        color: avatar.color || existing?.color || generateColor(roomId),
        initials: avatar.initials || existing?.initials || generateInitials(name),
        src: avatar.src || existing?.src,
      };

      // Notify change
      setTimeout(() => notifyAvatarChange('room', roomId, updatedAvatar, existing), 0);
      
      return { ...prev, [roomId]: updatedAvatar };
    });
  }, [generateColor, generateInitials, notifyAvatarChange]);

  // Simple getter methods
  const getUserAvatars = useCallback(() => userAvatars, [userAvatars]);
  const getRoomAvatars = useCallback(() => roomAvatars, [roomAvatars]);

  // Clear methods
  const clearUserAvatars = useCallback(() => setUserAvatars({}), []);
  const clearRoomAvatars = useCallback(() => setRoomAvatars({}), []);
  const clearAllAvatars = useCallback(() => {
    setUserAvatars({});
    setRoomAvatars({});
  }, []);

  // Change notification management
  const onAvatarChange = useCallback((callback: AvatarChangeCallback) => {
    setChangeCallbacks(prev => new Set(prev).add(callback));
    
    return () => {
      setChangeCallbacks(prev => {
        const newSet = new Set(prev);
        newSet.delete(callback);
        return newSet;
      });
    };
  }, []);

  // Import/export functionality
  const exportAvatars = useCallback((): PersistedAvatarData => ({
    userAvatars,
    roomAvatars,
    version: AVATAR_DATA_VERSION
  }), [userAvatars, roomAvatars]);

  const importAvatars = useCallback((data: PersistedAvatarData) => {
    if (data.version === AVATAR_DATA_VERSION) {
      setUserAvatars(data.userAvatars || {});
      setRoomAvatars(data.roomAvatars || {});
    } else {
      throw new Error(`Unsupported avatar data version: ${data.version}`);
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    getAvatarForUser,
    getAvatarForRoom,
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
  }), [
    getAvatarForUser,
    getAvatarForRoom,
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
  ]);

  return (
    <AvatarContext.Provider value={contextValue}>
      {children}
    </AvatarContext.Provider>
  );
};

/**
 * Hook to access the avatar context with comprehensive avatar management
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
