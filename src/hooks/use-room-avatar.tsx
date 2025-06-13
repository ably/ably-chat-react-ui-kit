import { useCallback, useEffect, useState } from 'react';

import { AvatarData } from '../components/atoms/avatar.tsx';
import { useAvatar } from './use-avatar.tsx';

/**
 * Props for the useRoomAvatar hook
 */
export interface UseRoomAvatarProps {
  /**
   * The unique identifier for the room.
   * Used as the primary key for avatar storage and retrieval.
   * Should be consistent across all components referencing the same room.
   *
   * @example
   * // Using a unique room name
   * const { roomAvatar } = useRoomAvatar({ roomName: "room_123" });
   */
  roomName: string;

  /**
   * Optional human-readable display name for the room.
   * Used as the default displayName when creating new avatars.
   * If not provided, falls back to using roomName as the display name.
   * Can be updated later using setRoomAvatar.
   *
   * @example
   * // With custom display name
   * const { roomAvatar } = useRoomAvatar({
   *   roomName: "room_123",
   *   displayName: "General Discussion"
   * });
   *
   * @example
   * // Display name defaults to roomName
   * const { roomAvatar } = useRoomAvatar({ roomName: "general-chat" });
   * // → displayName will be "general-chat"
   */
  displayName?: string;
}

/**
 * Return type for the useRoomAvatar hook
 */
export interface UseRoomAvatarReturn {
  /**
   * The current avatar data for the room.
   * Contains display name, color, initials, and optional image source.
   * Undefined during initial loading or if avatar creation fails.
   * Updates automatically when avatar data changes.
   *
   * @example
   * const { roomAvatar } = useRoomAvatar({ roomName: "room_123" });
   *
   * if (roomAvatar) {
   *   console.log(roomAvatar.displayName); // "General Discussion"
   *   console.log(roomAvatar.color);       // "#3B82F6"
   *   console.log(roomAvatar.initials);    // "GD"
   * }
   */
  roomAvatar: AvatarData | undefined;

  /**
   * Function to update the room avatar with new data.
   * Merges provided data with existing avatar properties.
   * Updates both the avatar context cache and local component state.
   * Changes persist across component unmounts and remounts.
   *
   * @param avatarData - Partial avatar data to merge with existing data
   *
   * @example
   * // Update display name and color
   * setRoomAvatar({
   *   displayName: "Updated Room Name",
   *   color: "#EF4444"
   * });
   *
   * @example
   * // Add custom avatar image
   * setRoomAvatar({
   *   src: "https://example.com/room-avatar.jpg"
   * });
   *
   * @example
   * // Update only the color
   * setRoomAvatar({ color: "#10B981" });
   */
  setRoomAvatar: (avatarData: Partial<AvatarData>) => void;
}

/**
 * Custom hook for managing room avatar data with automatic generation and caching
 *
 * Features:
 * - Automatic avatar retrieval from the avatar context cache
 * - On-demand avatar creation for new rooms with generated colors and initials
 * - Fallback display name generation from roomName when not provided
 * - Optimistic UI updates with immediate local state changes
 * - Used in conjunction with the <Avatar /> component for display
 *
 * @example
 * // Basic usage in room components
 * const RoomHeader = ({ roomId }) => {
 *   const { roomAvatar, setRoomAvatar } = useRoomAvatar({ roomName: roomId });
 *
 *   return (
 *     <div className="flex items-center gap-3">
 *       <Avatar
 *         src={roomAvatar?.src}
 *         color={roomAvatar?.color}
 *         initials={roomAvatar?.initials}
 *         alt={roomAvatar?.displayName}
 *       />
 *       <h1>{roomAvatar?.displayName}</h1>
 *     </div>
 *   );
 * };
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
