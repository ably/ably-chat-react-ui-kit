import { useCallback, useEffect, useState } from 'react';
import { AvatarData } from '../components/atoms';
import { useAvatar } from '../context';

/**
 * Props for the useUserAvatar hook
 */
export interface UseUserAvatarProps {
  /** The unique identifier for the user */
  clientId: string;
  /** Optional display name (defaults to userId if not provided) */
  displayName?: string;
}

/**
 * Return type for the useUserAvatar hook
 */
export interface UseUserAvatarReturn {
  /** The avatar data for the user */
  userAvatar: AvatarData | undefined;
  /** Function to update the user avatar */
  setUserAvatar: (avatarData: Partial<AvatarData>) => void;
}

/**
 * Custom hook that handles fetching or creating a user avatar with internal state management
 *
 * @param clientId - The unique identifier for the user
 * @param displayName - Optional display name (defaults to clientId if not provided)
 * @returns Object containing the avatar data and setter function for the user
 * @throws Error if used outside of an AvatarProvider
 *
 * @example
 * // In a component:
 * const { userAvatar, setUserAvatar } = useUserAvatar(clientId);
 *
 * // Update the avatar
 * setUserAvatar({ displayName: 'New Name', color: '#ff0000' });
 *
 * @example
 * // With destructuring alias:
 * const { userAvatar: avatarData, setUserAvatar: updateAvatar } = useUserAvatar(clientId);
 */
export const useUserAvatar = ({
  clientId,
  displayName,
}: UseUserAvatarProps): UseUserAvatarReturn => {
  const { getAvatarForUser, createAvatarForUser, setUserAvatar: updateUserAvatar } = useAvatar();
  const [avatar, setAvatar] = useState<AvatarData | undefined>();

  useEffect(() => {
    // Try to get existing avatar
    const existingAvatar = getAvatarForUser(clientId);

    if (existingAvatar) {
      setAvatar(existingAvatar);
    } else {
      // Create a new avatar if one doesn't exist
      const newAvatar = createAvatarForUser(clientId, displayName);
      setAvatar(newAvatar);
    }
  }, [getAvatarForUser, createAvatarForUser, clientId, displayName]);

  /**
   * Updates the user avatar both in the cache and local state
   *
   * @param avatarData - Partial avatar data to update
   */
  const setUserAvatar = useCallback(
    (avatarData: Partial<AvatarData>) => {
      updateUserAvatar(clientId, avatarData);
      // Update local state to reflect changes immediately
      setAvatar((prev) => (prev ? { ...prev, ...avatarData } : undefined));
    },
    [updateUserAvatar, clientId]
  );

  return {
    userAvatar: avatar,
    setUserAvatar,
  };
};
