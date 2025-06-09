import { useAvatar } from '../context';
import { useCallback, useEffect, useState } from 'react';
import { AvatarData } from '../components/atoms';

/**
 * Props for the useRoomAvatar hook
 */
export interface UseRoomAvatarProps {
  /** The unique identifier for the room */
  roomId: string;
  /** Optional room name (defaults to roomId if not provided) */
  roomName?: string;
}

/**
 * Return type for the useRoomAvatar hook
 */
export interface UseRoomAvatarReturn {
  /** The avatar data for the room */
  roomAvatar: AvatarData | undefined;
  /** Function to update the room avatar */
  setRoomAvatar: (avatarData: Partial<AvatarData>) => void;
}

/**
 * Custom hook that handles fetching or creating a room avatar with internal state management
 *
 * @param roomId - The unique identifier for the room
 * @param roomName - Optional room name (defaults to roomId if not provided)
 * @returns Object containing the avatar data and setter function for the room
 * @throws Error if used outside of an AvatarProvider
 *
 * @example
 * // In a component:
 * const { roomAvatar, setRoomAvatar } = useRoomAvatar(roomId);
 *
 * // Update the avatar
 * setRoomAvatar({ displayName: 'New Name', color: '#ff0000' });
 *
 * @example
 * // With destructuring alias:
 * const { roomAvatar: avatarData, setRoomAvatar: updateAvatar } = useRoomAvatar(roomId);
 */
export const useRoomAvatar = ({ roomId, roomName }: UseRoomAvatarProps): UseRoomAvatarReturn => {
  const { getAvatarForRoom, createAvatarForRoom, setRoomAvatar: updateRoomAvatar } = useAvatar();
  const [avatar, setAvatar] = useState<AvatarData | undefined>();

  useEffect(() => {
    // Try to get existing avatar
    const existingAvatar = getAvatarForRoom(roomId);

    if (existingAvatar) {
      setAvatar(existingAvatar);
    } else {
      // Create a new avatar if one doesn't exist
      const newAvatar = createAvatarForRoom(roomId, roomName);
      setAvatar(newAvatar);
    }
  }, [getAvatarForRoom, createAvatarForRoom, roomId, roomName]);

  /**
   * Updates the room avatar both in the cache and local state
   *
   * @param avatarData - Partial avatar data to update
   */
  const setRoomAvatar = useCallback(
    (avatarData: Partial<AvatarData>) => {
      updateRoomAvatar(roomId, avatarData);
      setAvatar((prev) => (prev ? { ...prev, ...avatarData } : undefined));
    },
    [updateRoomAvatar, roomId]
  );

  return {
    roomAvatar: avatar,
    setRoomAvatar,
  };
};
