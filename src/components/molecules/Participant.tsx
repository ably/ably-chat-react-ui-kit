import React, { useEffect, useState } from 'react';
import { Avatar, AvatarData } from '../atoms/Avatar';
import { TypingDots } from '../atoms';
import { useAvatar } from '../../context';

/**
 * Props for the Participant component
 */
interface ParticipantProps {
  /** Unique identifier for the participant */
  clientId: string;
  /** Whether the participant is currently present/online */
  isPresent: boolean;
  /** Whether this participant is the current user */
  isSelf: boolean;
  /** Whether the participant is currently typing */
  isTyping: boolean;
  /** Avatar data for the participant */
  avatar?: AvatarData;
}

/**
 * Participant component displays information about a chat participant
 *
 * Features:
 * - Shows participant's avatar with presence indicator
 * - Displays name and online status
 * - Shows typing indicator when participant is typing
 * - Differentiates between current user and other participants
 */
export const Participant: React.FC<ParticipantProps> = ({
  clientId,
  isPresent,
  isSelf,
  isTyping,
  avatar: propAvatar,
}) => {
  // Use the AvatarProvider to get user avatars
  const { getAvatarForUser } = useAvatar();
  const [avatarData, setAvatarData] = useState<AvatarData | undefined>(undefined);

  useEffect(() => {
    if (!propAvatar) {
      const avatar = getAvatarForUser(clientId);
      setAvatarData(avatar);
    } else {
      setAvatarData(propAvatar);
    }
  }, [getAvatarForUser, clientId, propAvatar]);

  // Determine the status text for screen readers
  const statusText = isTyping && !isSelf ? 'typing' : isPresent ? 'online' : 'offline';

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
