import React from 'react';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Participant from './Participant';
import { PresenceMember } from '@ably/chat';

interface ParticipantListProps {
  presenceData: PresenceMember[];
  currentUserId: string;
  currentlyTyping: Set<string>;
  isOpen: boolean;
  onToggle: () => void;
  position: { top: number; left: number };
  generateAvatarUrl: (clientId: string) => string;
  getUserColor: (clientId: string) => string;
}

const ParticipantList: React.FC<ParticipantListProps> = ({
  presenceData,
  currentUserId,
  currentlyTyping,
  isOpen,
  onToggle,
  position,
  generateAvatarUrl,
  getUserColor,
}) => {
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
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Participants ({presentCount})
          </h3>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <Icon name="close" size="sm" />
          </Button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{presentCount} present</p>
      </div>

      {/* Participants List */}
      <div className="max-h-64 overflow-y-auto">
        {sortedParticipants.map((member) => (
          <Participant
            key={member.clientId}
            clientId={member.clientId}
            isPresent={true}
            isSelf={member.clientId === currentUserId}
            isTyping={currentlyTyping.has(member.clientId)}
            avatarSrc={generateAvatarUrl(member.clientId)}
            avatarColor={getUserColor(member.clientId)}
          />
        ))}
      </div>
    </div>
  );
};

export default ParticipantList;
