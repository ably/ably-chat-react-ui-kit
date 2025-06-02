import React from 'react';
import { useTyping } from '@ably/chat/react';

interface TypingIndicatorsProps {
  currentUserId: string;
  className?: string;
}

const TypingIndicators: React.FC<TypingIndicatorsProps> = ({ currentUserId, className = '' }) => {
  // Use typing hook directly in this component
  const { currentlyTyping } = useTyping();

  // Filter out current user from typing set
  const activeTypingUsers = Array.from(currentlyTyping).filter(
    (clientId) => clientId !== currentUserId
  );

  if (activeTypingUsers.length === 0) {
    return null;
  }

  const formatTypingText = () => {
    const count = activeTypingUsers.length;

    if (count === 1) {
      return `${activeTypingUsers[0]} is typing`;
    }

    if (count === 2) {
      return `${activeTypingUsers[0]} and ${activeTypingUsers[1]} are typing`;
    }

    if (count <= 3) {
      const names = activeTypingUsers.slice(0, -1).join(', ');
      const lastName = activeTypingUsers[activeTypingUsers.length - 1];
      return `${names} and ${lastName} are typing`;
    }

    // More than 3 users
    const remaining = count - 1;
    return `${activeTypingUsers[0]} and ${remaining} other${remaining > 1 ? 's' : ''} are typing`;
  };

  return (
    <div
      className={`flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 ${className}`}
    >
      {/* Animated typing dots */}
      <div className="flex gap-0.5">
        <div
          className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
          style={{ animationDelay: '0ms', animationDuration: '1s' }}
        />
        <div
          className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
          style={{ animationDelay: '200ms', animationDuration: '1s' }}
        />
        <div
          className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
          style={{ animationDelay: '400ms', animationDuration: '1s' }}
        />
      </div>

      <span>{formatTypingText()}</span>
    </div>
  );
};

export default TypingIndicators;
