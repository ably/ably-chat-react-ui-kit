import React from 'react';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Participant from './Participant';
import { PresenceMember } from '@ably/chat';
import { useAvatar } from '../../context/AvatarContext';

/**
 * Props for the ParticipantList component
 */
interface ParticipantListProps {
  /** Array of presence members in the room */
  presenceData: PresenceMember[];
  /** ID of the current user */
  currentUserId: string;
  /** Set of user IDs who are currently typing */
  currentlyTyping: Set<string>;
  /** Whether the participant list is currently open */
  isOpen: boolean;
  /** Callback function to toggle the list open/closed */
  onToggle: () => void;
  /** Position coordinates for rendering the list */
  position: { top: number; left: number };
}

/**
 * ParticipantList component displays a modal list of participants in a room
 *
 * Features:
 * - Shows all online participants with their avatars and status
 * - Sorts list with current user at the top
 * - Displays typing indicators for users who are typing
 * - Shows total count of participants
 * - Positioned at specified coordinates
 */
const ParticipantList: React.FC<ParticipantListProps> = ({
  presenceData,
  currentUserId,
  currentlyTyping,
  isOpen,
  onToggle,
  position,
}) => {
  // Use the AvatarProvider to get user avatars
  const { getAvatarForUser } = useAvatar();

  if (!isOpen) {
    return null;
  }

  // Calculate present count from unique clientIds in presence data
  const presentCount = presenceData?.length || 0;

  // Sort participants: current user first, then by clientId
  const sortedParticipants = presenceData
    ? [...presenceData].sort((a, b) => {
        if (a.clientId === currentUserId && b.clientId !== currentUserId) return -1;
        if (a.clientId !== currentUserId && b.clientId === currentUserId) return 1;
        return a.clientId.localeCompare(b.clientId);
      })
    : [];

  return (
    <div
      className="absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg min-w-80 max-h-96 overflow-hidden z-50"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translateX(-50%)',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="participants-heading"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <h3 id="participants-heading" className="font-semibold text-gray-900 dark:text-gray-100">
            Participants ({presentCount})
          </h3>
          <Button variant="ghost" size="sm" onClick={onToggle} aria-label="Close participants list">
            <Icon name="close" size="sm" aria-hidden="true" />
          </Button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1" aria-live="polite">
          {presentCount} {presentCount === 1 ? 'person' : 'people'} present
        </p>
      </div>

      {/* Participants List */}
      <div className="max-h-64 overflow-y-auto" role="list" aria-label="Room participants">
        {sortedParticipants.map((member) => {
          // Get the avatar for this user from the AvatarProvider
          const userAvatar = getAvatarForUser(member.clientId);

          return (
            <Participant
              key={member.clientId}
              clientId={member.clientId}
              isPresent={true}
              isSelf={member.clientId === currentUserId}
              isTyping={currentlyTyping.has(member.clientId)}
              avatar={userAvatar}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ParticipantList;
