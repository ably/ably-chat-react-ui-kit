import { useAvatar } from '../context';
import { useCallback, useEffect, useState } from 'react';
import { AvatarData } from '../components/atoms';

/**
 * Props for the useRoomAvatar hook
 */
export interface UseRoomAvatarProps {
  /** The unique identifier for the room */
  roomName: string;
  /** Optional room name (defaults to roomId if not provided) */
  displayName?: string;
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
 * @param roomName - The unique identifier for the room
 * @param displayName - Optional display name (defaults to roomName if not provided)
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
 * const { roomAvatar: avatarData, setRoomAvatar: updateAvatar } = useRoomAvatar(roomName);
 */
export const useRoomAvatar = ({
  roomName,
  displayName,
}: UseRoomAvatarProps): UseRoomAvatarReturn => {
  const { getAvatarForRoom, createAvatarForRoom, setRoomAvatar: updateRoomAvatar } = useAvatar();
  const [avatar, setAvatar] = useState<AvatarData | undefined>();

  useEffect(() => {
    // Try to get existing avatar
    const existingAvatar = getAvatarForRoom(roomName);

    if (existingAvatar) {
      setAvatar(existingAvatar);
    } else {
      // Create a new avatar if one doesn't exist
      const newAvatar = createAvatarForRoom(roomName, displayName);
      setAvatar(newAvatar);
    }
  }, [getAvatarForRoom, createAvatarForRoom, roomName, displayName]);

  /**
   * Updates the room avatar both in the cache and local state
   *
   * @param avatarData - Partial avatar data to update
   */
  const setRoomAvatar = useCallback(
    (avatarData: Partial<AvatarData>) => {
      updateRoomAvatar(roomName, avatarData);
      setAvatar((prev) => (prev ? { ...prev, ...avatarData } : undefined));
    },
    [updateRoomAvatar, roomName]
  );

  return {
    roomAvatar: avatar,
    setRoomAvatar,
  };
};
