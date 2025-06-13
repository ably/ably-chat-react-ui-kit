import { useCallback, useEffect, useState } from 'react';

import { AvatarData } from '../components/atoms/avatar.tsx';
import { useAvatar } from './use-avatar.tsx';

/**
 * Props for the useUserAvatar hook
 */
export interface UseUserAvatarProps {
  /**
   * The unique identifier for the user.
   * Used as the primary key for avatar storage and retrieval.
   * Should be consistent across all components referencing the same user.
   * This is typically the client ID used in Ably Chat.
   *
   * @example
   * // Using client ID only
   * const { userAvatar } = useUserAvatar({ clientId: "user_123" });
   *
   */
  clientId: string;

  /**
   * Optional human-readable display name for the user.
   * Used as the default displayName when creating new avatars.
   * If not provided, falls back to using clientId as the display name.
   * Can be updated later using setUserAvatar for personalization.
   *
   * @example
   * // With custom display name
   * const { userAvatar } = useUserAvatar({
   *   clientId: "user_123",
   *   displayName: "Alice Smith"
   * });
   *
   * @example
   * // Display name defaults to clientId
   * const { userAvatar } = useUserAvatar({ clientId: "alice-smith" });
   * // → displayName will be "alice-smith"
   *
   */
  displayName?: string;
}

/**
 * Return type for the useUserAvatar hook
 */
export interface UseUserAvatarReturn {
  /**
   * The current avatar data for the user.
   * Contains display name, color, initials, and optional image source.
   * Undefined during initial loading or if avatar creation fails.
   * Updates automatically when avatar data changes through context.
   *
   * @example
   * const { userAvatar } = useUserAvatar({ clientId: "user_123" });
   *
   * if (userAvatar) {
   *   console.log(userAvatar.displayName); // "Alice Smith"
   *   console.log(userAvatar.color);       // "#3B82F6"
   *   console.log(userAvatar.initials);    // "AS"
   *   console.log(userAvatar.src);         // "https://..." or undefined
   * }
   */
  userAvatar: AvatarData | undefined;

  /**
   * Function to update the user avatar with new data.
   * Merges provided data with existing avatar properties.
   * Updates both the avatar context cache and local component state.
   * Changes persist across component unmounts and remounts.
   *
   * @param avatarData - Partial avatar data to merge with existing data
   *
   * @example
   * // Update display name and color
   * setUserAvatar({
   *   displayName: "Alice Johnson",
   *   color: "#EF4444"
   * });
   *
   * @example
   * // Add profile picture
   * setUserAvatar({
   *   src: "https://example.com/profile.jpg"
   * });
   *
   */
  setUserAvatar: (avatarData: Partial<AvatarData>) => void;
}

/**
 * Custom hook for managing user avatar data with automatic generation and caching
 *
 * Features:
 * - Automatic avatar retrieval from the avatar context cache
 * - On-demand avatar creation for new users with generated colors and initials
 * - Synchronized across all components using the same clientId under the same context
 * - Persistent storage through the avatar context provider
 * - Optimistic UI updates with immediate local state changes
 * - Fallback display name generation from clientId when not provided
 *
 * Avatar Generation Logic:
 * - Checks context cache for existing user avatar first
 * - Creates new avatar if none exists using clientId and display name
 * - Generates deterministic color using hash algorithm based on clientId
 * - Extracts initials from display name or clientId for fallback display
 * - Caches generated avatar for future use across all components
 *
 *
 * @example
 * // Basic usage in message components
 * const MessageAvatar = ({ message }) => {
 *   const { userAvatar } = useUserAvatar({
 *     clientId: message.clientId,
 *     displayName: message.senderName
 *   });
 *
 *   return (
 *     <Avatar
 *       src={userAvatar?.src}
 *       color={userAvatar?.color}
 *       initials={userAvatar?.initials}
 *       alt={userAvatar?.displayName}
 *       size="sm"
 *     />
 *   );
 * };
 *
 * @example
 * // User profile editing with avatar customization
 * const UserProfile = ({ clientId, name }) => {
 *   const { userAvatar, setUserAvatar } = useUserAvatar({
 *     clientId,
 *     displayName: name
 *   });
 *
 *   const handleNameChange = (newName) => {
 *     setUserAvatar({ displayName: newName });
 *     updateUserProfile({ name: newName });
 *   };
 *
 *   const handleAvatarUpload = async (file) => {
 *     const uploadedUrl = await uploadImage(file);
 *     setUserAvatar({ src: uploadedUrl });
 *   };
 *
 *   return (
 *     <div className="profile-editor">
 *       <AvatarUploader
 *         currentAvatar={userAvatar}
 *         onUpload={handleAvatarUpload}
 *       />
 *       <TextInput
 *         value={userAvatar?.displayName || ''}
 *         onChange={handleNameChange}
 *         placeholder="Enter display name"
 *       />
 *     </div>
 *   );
 * };
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
