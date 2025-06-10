import React from 'react';
import { useChatClient, useTyping } from '@ably/chat/react';
import clsx from 'clsx';
import { TypingDots } from '../atoms';

/**
 * Props for the TypingIndicators component
 */
export interface TypingIndicatorsProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Maximum number of distinct clients to display by name before collapsing to "X others".
   * Controls the verbosity of the typing message to prevent overly long text.
   * When exceeded, remaining users are summarized as "and N other(s)".
   *
   * @default 1
   * @example
   * // Show only first user: "Alice is typing"
   * maxClients={1}
   *
   * @example
   * // Show up to 3 users: "Alice, Bob and Charlie are typing"
   * maxClients={3}
   *
   * @example
   * // With overflow: "Alice, Bob and 5 others are typing"
   * maxClients={2} // when 7 users are typing
   */
  maxClients?: number;

  /**
   * Additional CSS classes to apply to the container element.
   * Merged with default styling classes.
   *
   * @example
   * // Custom positioning and colors
   * className="absolute bottom-2 left-4 text-blue-500"
   *
   * @example
   * // Integration with flex layouts
   * className="flex-shrink-0 ml-4"
   */
  className?: string;

  /**
   * CSS classes to apply specifically to the typing text element.
   * Allows independent styling of the text content without affecting container layout.
   *
   * @example
   * // Custom text styling
   * textClassName="font-medium text-green-600 text-xs"
   *
   * @example
   * // Responsive text sizing
   * textClassName="text-sm md:text-base"
   */
  textClassName?: string;

  /**
   * Whether typing indicators should be shown at all.
   * When false, component returns null regardless of typing activity.
   * Useful for conditional display based on room settings or user preferences.
   *
   * @default true
   * @example
   * // Conditional based on room settings
   * enabled={roomSettings.showTypingIndicators}
   *
   * @example
   * // Disable in busy rooms
   * enabled={participantCount < 50}
   */
  enabled?: boolean;
}

/**
 * TypingIndicators component displays real-time typing activity in a chat room
 *
 * Features:
 * - Animated typing dots
 * - Human-readable sentences showing who is currently typing
 * - Smart participant limiting to prevent overly long messages
 * - Automatic exclusion of the current user from typing displays
 * - Live region support for screen reader announcements
 * - Custom styling of container and text elements
 * - Enable/disable functionality for conditional display
 *
 * Display:
 * • 0 typing: Component returns null (nothing rendered)
 * • 1 user: "Alice is typing"
 * • 2 users: "Alice and Bob are typing"
 * • 3 users: "Alice, Bob and Charlie are typing"
 * • 4+ users (maxClients=3): "Alice, Bob and 2 others are typing"
 * • Current user excluded: Never shows "You are typing"
 *
 * @example
 * // Conditional display based on room size
 * <TypingIndicators
 *   enabled={participantCount < 20}
 *   maxClients={3}
 *   className="px-4 py-2"
 * />
 *
 * @example
 * // Custom styling for different contexts
 * // Light theme with custom colors
 * <TypingIndicators
 *   className="bg-blue-50 rounded-lg px-3 py-2"
 *   textClassName="text-blue-700 font-medium"
 *   maxClients={2}
 * />
 *
 */

export const TypingIndicators: React.FC<TypingIndicatorsProps> = ({
  maxClients,
  className,
  textClassName,
  enabled = true,
}) => {
  const { currentlyTyping } = useTyping();
  const { clientId } = useChatClient();

  // If typing indicators are disabled, don't render anything
  if (!enabled) return null;

  // Exclude yourself from the typing indicators
  const activeTypingUsers = Array.from(currentlyTyping).filter((id) => id !== clientId);

  if (!activeTypingUsers.length) return null;
  return (
    <div
      className={clsx(
        'flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <TypingDots aria-hidden="true" />
      <span className={textClassName}>{buildTypingSentence(activeTypingUsers, maxClients)}</span>
    </div>
  );
};

/**
 * Builds a human-readable "is / are typing" sentence with proper grammar and overflow handling
 *
 * Creates grammatically correct sentences showing who is typing, with special handling
 * for different numbers of users and smart truncation when limits are exceeded.
 *
 * Grammar Rules:
 * • Single user: "Alice is typing"
 * • Two users: "Alice and Bob are typing"
 * • Three users: "Alice, Bob and Charlie are typing"
 * • Multiple users: "Alice, Bob, Charlie and David are typing"
 * • With overflow: "Alice, Bob and 3 others are typing"
 *
 * Overflow Logic:
 * • When user count exceeds maxClients, shows first N names + "X others"
 * • Proper pluralization: "1 other" vs "2 others"
 * • Always maintains readability regardless of participant count
 *
 * @param userIds - Array of client IDs who are currently typing (excluding current user)
 * @param maxClients - Maximum number of users to display by name before collapsing.
 *                     Values ≤ 0 are normalized to 1 to ensure at least one name shows.
 * @returns A formatted string describing who is typing, or empty string if no users
 *
 * @example
 * // Basic cases
 * buildTypingSentence(["Alice"], 3)
 * // → "Alice is typing"
 *
 * buildTypingSentence(["Alice", "Bob"], 3)
 * // → "Alice and Bob are typing"
 *
 * buildTypingSentence(["Alice", "Bob", "Charlie"], 3)
 * // → "Alice, Bob and Charlie are typing"
 *
 * // Overflow cases
 * buildTypingSentence(["Alice", "Bob", "Charlie", "David"], 2)
 * // → "Alice, Bob and 2 others are typing"
 *
 * buildTypingSentence(["Alice", "Bob", "Charlie", "David", "Eve"], 1)
 * // → "Alice and 4 others are typing"
 *
 * // Edge cases
 * buildTypingSentence([], 3)
 * // → ""
 *
 * buildTypingSentence(["Alice"], 0)  // maxClients normalized to 1
 * // → "Alice is typing"
 */

function buildTypingSentence(userIds: string[], maxClients: number = 1): string {
  const count = userIds.length;
  const safeMax = Math.max(1, maxClients); // never smaller than 1

  // No users
  if (count === 0) return '';

  // All users fit into the limit → list them, nothing to collapse
  if (count <= safeMax) {
    if (count === 1) return `${userIds[0]} is typing`;
    if (count === 2) return `${userIds[0]} and ${userIds[1]} are typing`;
    if (count === 3) return `${userIds[0]}, ${userIds[1]} and ${userIds[2]} are typing`;

    // >3 but still within the limit – generic join
    const names = userIds.slice(0, -1).join(', ');
    return `${names} and ${userIds[count - 1]} are typing`;
  }

  // Need to collapse the tail into "…n others"
  const displayNames = userIds.slice(0, safeMax).join(', ');
  const remaining = count - safeMax;

  return `${displayNames} and ${remaining} other${remaining > 1 ? 's' : ''} are typing`;
}
