import React from 'react';
import { Message } from '@ably/chat';

interface MessageReactionsProps {
  message: Message;
  onReactionClick?: (emoji: string) => void;
  currentUserId: string;
}

const MessageReactions: React.FC<MessageReactionsProps> = ({
  message,
  onReactionClick,
  currentUserId,
}) => {
  const distinct = message.reactions?.distinct ?? {};

  // Get all emoji names that have reactions
  const emojiNames = Object.keys(distinct);

  if (emojiNames.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {emojiNames.map((emoji) => {
        const reaction = distinct[emoji];
        const hasUserReacted = reaction?.clientIds.includes(currentUserId) ?? false;
        const count = reaction?.total ?? 0;

        return (
          <button
            key={emoji}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-colors ${
              hasUserReacted
                ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300'
                : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            onClick={() => onReactionClick?.(emoji)}
          >
            <span>{emoji}</span>
            <span className="font-medium">{count}</span>
          </button>
        );
      })}
    </div>
  );
};

export default MessageReactions;
