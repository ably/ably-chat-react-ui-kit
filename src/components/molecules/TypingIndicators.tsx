import React from 'react';
import { useChatClient, useTyping } from '@ably/chat/react';
import clsx from 'clsx';
import { TypingDots } from '../atoms/TypingDots.tsx';

/**
 * Props for the TypingIndicators component
 */
interface TypingIndicatorsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum number of distinct clients to display before collapsing */
  maxClients?: number;
  
  /** Additional CSS classes to apply to the component */
  className?: string;
  
  /** CSS classes to apply to the text element */
  textClassName?: string;
}

/**
 * TypingIndicators component displays who is currently typing in a chat
 * 
 * Features:
 * - Shows animated typing dots
 * - Displays a human-readable message about who is typing
 * - Excludes the current user from the typing list
 * - Limits the number of displayed names to avoid long messages
 * - Collapses additional typing users into a count
 */
const TypingIndicators: React.FC<TypingIndicatorsProps> = ({
  maxClients,
  className,
  textClassName,
}) => {
  const { currentlyTyping } = useTyping();
  const { clientId } = useChatClient();

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

export default TypingIndicators;

/**
 * Builds a human-readable "is / are typing" sentence
 * 
 * Creates a grammatically correct sentence showing who is typing,
 * with special handling for different numbers of users.
 *
 * @param userIds - Array of user IDs who are currently typing
 * @param maxClients - Maximum number of users to display by name before collapsing
 *                     the rest into "n others". Defaults to 1 if undefined or ≤ 0.
 * @returns A formatted string describing who is typing
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