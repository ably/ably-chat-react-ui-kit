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
      className="ably-participant"
      role="listitem"
      aria-label={`${isSelf ? 'You' : clientId}, ${statusText}`}
    >
      <div className="ably-participant__avatar">
        <Avatar
          alt={avatarData?.displayName}
          src={avatarData?.src}
          color={avatarData?.color}
          size="sm"
          initials={avatarData?.initials}
        />
        {/* Presence Icon */}
        <div
          className={`ably-participant__presence-indicator ${
            isPresent ? 'ably-participant__presence-indicator--online' : 'ably-participant__presence-indicator--offline'
          }`}
          aria-hidden="true"
          title={isPresent ? 'Online' : 'Offline'}
        />
      </div>

      <div className="ably-participant__content">
        <div className="ably-participant__name-container">
          <h4 className="ably-participant__name">
            {clientId}
            {isSelf && <span className="ably-participant__self-label">(you)</span>}
          </h4>
        </div>
        {/* Status */}
        <div className="ably-participant__status">
          {/* Check if this participant is currently typing */}
          {isTyping && !isSelf ? (
            <span className="ably-participant__typing">
              <TypingDots aria-hidden="true" />
              typing...
            </span>
          ) : isPresent ? (
            <span className="ably-participant__online">Online</span>
          ) : (
            <span className="ably-participant__offline">Offline</span>
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
