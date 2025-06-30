import React from 'react';

import { useUserAvatar } from '../../hooks/use-user-avatar.tsx';
import { Avatar, AvatarData } from '../atoms/avatar.tsx';
import { TypingDots } from '../atoms/typing-dots.tsx';

/**
 * Props for the Participant component
 */
export interface ParticipantProps {
  /**
   * Unique clientId for the participant.
   * Used for avatar generation and display name when no custom avatar is provided.
   */
  clientId: string;

  /**
   * Whether the participant is currently present/online in the room.
   * Controls the presence indicator color (green for online, gray for offline).
   */
  isPresent: boolean;

  /**
   * Whether this participant represents the current client.
   * When true, displays "(you)" label and hides typing indicators for self.
   */
  isSelf: boolean;

  /**
   * Whether the participant is currently typing in the chat.
   * Shows animated typing dots and "typing..." text when true (except for current user).
   */
  isTyping: boolean;

  /**
   * Optional custom avatar data for the participant.
   * If not provided, uses the useUserAvatar hook to generate/retrieve avatar data.
   */
  avatar?: AvatarData;
}

/**
 * Participant component displays detailed information about a chat room participant
 *
 * Features:
 * - Avatar display with automatic fallback to generated avatars via useUserAvatar hook
 * - Real-time presence indicator (green dot for online, gray for offline)
 * - Typing status with animated dots and text indicator
 * - Current user identification with "(you)" label
 * - Accessible design with proper ARIA attributes and screen reader support
 * - Hover effects for interactive feel within participant lists
 * - Theme-aware styling supporting light and dark modes
 *
 * Styling:
 * • Status line showing either typing animation, online, or offline state
 * • Proper text truncation for long participant names
 *
 *
 * @example
 * // Basic participant in a list
 * <Participant
 *   clientId="user123"
 *   isPresent={true}
 *   isSelf={false}
 *   isTyping={false}
 * />
 *
 * @example
 * // Current user with custom avatar
 * <Participant
 *   clientId="currentUser"
 *   isPresent={true}
 *   isSelf={true}
 *   isTyping={false}
 *   avatar={{
 *     displayName: "John Doe",
 *     src: "https://example.com/avatar.jpg",
 *     color: "bg-blue-500"
 *   }}
 * />
 *
 *
 */

export const Participant = ({
  clientId,
  isPresent,
  isSelf,
  isTyping,
  avatar: propAvatar,
}: ParticipantProps) => {
  // Use the custom hook to get or create user avatar
  const { userAvatar } = useUserAvatar({ clientId });
  const avatarData = propAvatar || userAvatar;

  // Use the helper function
  const statusText = getParticipantStatus(isTyping, isPresent, isSelf);

  return (
    <div
      className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
      role="listitem"
      aria-label={`${isSelf ? 'You' : clientId}, ${statusText}`}
    >
      <div className="relative">
        <Avatar
          alt={avatarData?.displayName}
          src={avatarData?.src}
          color={avatarData?.color}
          size="sm"
          initials={avatarData?.initials}
        />
        {/* Presence Icon */}
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
            isPresent ? 'bg-green-500' : 'bg-gray-400'
          }`}
          aria-hidden="true"
          title={isPresent ? 'Online' : 'Offline'}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {clientId}
            {isSelf && <span className="ml-1 text-xs text-gray-500">(you)</span>}
          </h4>
        </div>
        {/* Status */}
        <div className="flex items-center gap-2 mt-0.5">
          {/* Check if this participant is currently typing */}
          {isTyping && !isSelf ? (
            <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <TypingDots aria-hidden="true" />
              typing...
            </span>
          ) : isPresent ? (
            <span className="text-sm text-green-600 dark:text-green-400">Online</span>
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400">Offline</span>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Helper function to determine participant status text
 *
 * @param isTyping - Whether the participant is currently typing
 * @param isPresent - Whether the participant is currently present/online
 * @param isSelf - Whether this participant represents the current user
 * @returns Status text for the participant
 */
const getParticipantStatus = (isTyping: boolean, isPresent: boolean, isSelf: boolean): string => {
  if (isTyping && !isSelf) return 'typing';
  return isPresent ? 'online' : 'offline';
};
