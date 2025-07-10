import { Message } from '@ably/chat';
import React from 'react';

/**
 * Props for the MessageReactions component
 */
export interface MessageReactionsProps {
  /**
   * The Chat Message object containing reaction data.
   * Access reactions via `message.reactions.distinct` which provides a map of emoji to reaction details.
   * Only renders when the message has existing reactions.
   */
  message: Message;

  /**
   * Optional callback function triggered when a reaction button is clicked.
   * Receives the emoji character as a parameter for handling reaction add/remove logic.
   * Should implement toggle behavior - add reaction if user hasn't reacted, remove if they have.
   *
   * @param emoji - The emoji character that was clicked
   *
   * @example
   * ```tsx
   * const handleReactionClick = (emoji: string) => {
   *   const hasUserReacted = message.reactions?.distinct[emoji]?.clientIds.includes(currentClientId);
   *   if (hasUserReacted) {
   *     onReactionRemove(message, emoji);
   *   } else {
   *     onReactionAdd(message, emoji);
   *   }
   * };
   *
   * <MessageReactions
   *   message={message}
   *   onReactionClick={handleReactionClick}
   *   currentClientId={currentClientId}
   * />
   * ```
   */
  onReactionClick?: (emoji: string) => void;

  /**
   * Client ID of the current Ably Connection for the room.
   * Used to determine which reactions the current user has added for visual highlighting.
   * Reactions added by the current user are displayed with blue styling to indicate participation.
   */
  currentClientId: string;
}

/**
 * MessageReactions component displays emoji reactions for a chat message with interactive toggle functionality
 *
 * Core Features:
 * - Displays all emoji reactions with their total counts
 * - Visual highlighting for reactions added by the current user (blue styling)
 * - Click-to-toggle reactions (add/remove based on current user's participation)
 * - Responsive flexbox layout that wraps on smaller screens
 * - Accessibility with ARIA attributes
 * - Theme-aware styling supporting both light and dark modes
 * - Graceful handling of missing or empty reaction data
 *
 * Data Structure:
 * The component expects `message.reactions.distinct` to contain a map where:
 * - Keys are emoji characters (e.g., "👍", "❤️", "😂")
 * - Values contain `total` (number) and `clientIds` (string array)
 *
 * Styling:
 * • Pill-shaped buttons with rounded corners
 * • Current user's reactions: Blue background with darker blue border
 * • Other reactions: Gray background with hover effects
 * • Emoji and count displayed side-by-side within each button
 *
 * @example
 * // Basic usage within ChatMessage component
 * {message.reactions && Object.keys(message.reactions.distinct || {}).length > 0 && (
 *   <MessageReactions
 *     message={message}
 *     onReactionClick={handleReactionToggle}
 *     currentClientId={currentClientId}
 *   />
 * )}
 *
 * @example
 * // Integration with reaction management system
 * const ChatMessageWithReactions = ({ message, currentClientId }) => {
 *   const handleReactionClick = async (emoji: string) => {
 *     const reaction = message.reactions?.distinct[emoji];
 *     const hasUserReacted = reaction?.clientIds.includes(currentClientId) ?? false;
 *
 *     try {
 *       if (hasUserReacted) {
 *         await room.messages.deleteReaction(message, emoji);
 *       } else {
 *         await room.messages.addReaction(message, emoji);
 *       }
 *     } catch (error) {
 *       console.error('Failed to toggle reaction:', error);
 *     }
 *   };
 *
 *   return (
 *     <div className="message-container">
 *       <div className="message-content">{message.text}</div>
 *       <MessageReactions
 *         message={message}
 *         onReactionClick={handleReactionClick}
 *         currentClientId={currentClientId}
 *       />
 *     </div>
 *   );
 * };
 *
 */
export const MessageReactions = ({
  message,
  onReactionClick,
  currentClientId,
}: MessageReactionsProps) => {
  const distinct = message.reactions.distinct;

  // Get all emoji names that have reactions
  const emojiNames = Object.keys(distinct);

  if (emojiNames.length === 0) return;

  return (
    <div className="flex flex-wrap gap-1 mt-2" role="group" aria-label="Message reactions">
      {emojiNames.map((emoji) => {
        const reaction = distinct[emoji];
        if (!reaction) return;
        const hasUserReacted = reaction.clientIds.includes(currentClientId);
        const count = reaction.total;
        return (
          <button
            key={emoji}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-colors ${
              hasUserReacted
                ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300'
                : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            onClick={() => onReactionClick?.(emoji)}
            aria-label={`${emoji} reaction${hasUserReacted ? ' (you reacted)' : ''}, ${String(count)} ${count === 1 ? 'person' : 'people'}`}
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
