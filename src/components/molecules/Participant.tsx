import React from 'react';
import Avatar from '../atoms/Avatar';
import { TypingDots } from '../atoms/TypingDots.tsx';

interface ParticipantProps {
  clientId: string;
  isPresent: boolean;
  isSelf: boolean;
  isTyping: boolean;
  avatarSrc: string;
  avatarColor: string;
}

const Participant: React.FC<ParticipantProps> = ({
  clientId,
  isPresent,
  isSelf,
  isTyping,
  avatarSrc,
  avatarColor,
}) => {
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700">
      <div className="relative">
        <Avatar alt={clientId} src={avatarSrc} color={avatarColor} size="sm" />
        {/* Presence Icon */}
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
            isPresent ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">{clientId}</h4>
        </div>
        {/* Status */}
        <div className="flex items-center gap-2 mt-0.5">
          {/* Check if this participant is currently typing */}
          {isTyping && !isSelf ? (
            <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <TypingDots />
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

export default Participant;
