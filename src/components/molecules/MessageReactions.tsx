import React from 'react';
import { Message } from '@ably/chat';

/**
 * Props for the MessageReactions component
 */
export interface MessageReactionsProps {
  /** The message object containing reaction data */
  message: Message;
  /** Callback function when a reaction is clicked, receives the emoji character */
  onReactionClick?: (emoji: string) => void;
  /** ID of the current user to determine if they've reacted */
  currentClientId: string;
}

/**
 * MessageReactions component displays emoji reactions for a message
 *
 * Features:
 * - Shows all emoji reactions with their counts
 * - Highlights reactions the current user has added
 * - Allows toggling reactions by clicking
 * - Visually distinguishes between active and inactive reactions
 */
export const MessageReactions: React.FC<MessageReactionsProps> = ({
  message,
  onReactionClick,
  currentClientId,
}) => {
  const distinct = message.reactions?.distinct ?? {};

  // Get all emoji names that have reactions
  const emojiNames = Object.keys(distinct);

  if (emojiNames.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-2" role="group" aria-label="Message reactions">
      {emojiNames.map((emoji) => {
        const reaction = distinct[emoji];
        const hasUserReacted = reaction?.clientIds.includes(currentClientId) ?? false;
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
            aria-label={`${emoji} reaction${hasUserReacted ? ' (you reacted)' : ''}, ${count} ${count === 1 ? 'person' : 'people'}`}
            aria-pressed={hasUserReacted}
            type="button"
          >
            <span aria-hidden="true">{emoji}</span>
            <span className="font-medium" aria-hidden="true">
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
