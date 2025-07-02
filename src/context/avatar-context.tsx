import { createContext } from 'react';

import { AvatarData } from '../components/atoms/avatar.tsx';
import { AvatarChangeCallback, PersistedAvatarData } from '../providers/avatar-provider.tsx';

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
   * Returns all cached user avatars (some values may be undefined)
   * @returns Record of user ID to avatar data or undefined
   */
  getUserAvatars: () => Record<string, AvatarData | undefined>;

  /**
   * Returns all cached room avatars (some values may be undefined)
   * @returns Record of room ID to avatar data or undefined
   */
  getRoomAvatars: () => Record<string, AvatarData | undefined>;

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
   * Exports all avatar data for backup/migration (cleans undefined entries)
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
export const AvatarContext = createContext<AvatarContextType | undefined>(undefined);
