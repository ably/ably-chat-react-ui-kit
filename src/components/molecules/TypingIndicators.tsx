import React from 'react';
import { useChatClient, useRoom, useTyping } from '@ably/chat/react';
import clsx from 'clsx';
import { TypingDots } from '../atoms/TypingDots.tsx';

interface TypingIndicatorsProps {
  currentUserId: string;
  className?: string;
}

/**
 * Builds a human-readable “is / are typing” sentence.
 *
 *  • `maxClients` – how many distinct clients to list before collapsing the rest
 *    into “n other(s)”.
 *    If `maxClients` is `undefined` or ≤ 0, we default to 1.
 */
export function buildTypingSentence(userIds: string[], maxClients: number = 1): string {
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

  // Need to collapse the tail into “…n others”
  const displayNames = userIds.slice(0, safeMax).join(', ');
  const remaining = count - safeMax;

  return `${displayNames} and ${remaining} other${remaining > 1 ? 's' : ''} are typing`;
}

interface TypingIndicatorsProps extends React.HTMLAttributes<HTMLDivElement> {
  maxClients?: number; // max number of distinct clients to display

  /* style hooks */
  className?: string;
  dotsClassName?: string;
  dotClassName?: string;
  dotSizeClassName?: string; // size util, e.g. 'w-2 h-2'
  textClassName?: string;
}

const TypingIndicators: React.FC<TypingIndicatorsProps> = ({
  maxClients,
  className,
  dotsClassName,
  dotClassName,
  dotSizeClassName,
  textClassName,
  ...rest
}) => {
  const { currentlyTyping } = useTyping();
  const { clientId } = useChatClient();

  /* Exclude yourself */
  const activeTypingUsers = Array.from(currentlyTyping).filter((id) => id !== clientId);

  if (!activeTypingUsers.length) return null;

  return (
    <div
      className={clsx(
        'flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400',
        className
      )}
      {...rest}
    >
      <TypingDots
        className={dotsClassName}
        dotClassName={dotClassName}
        dotSizeClassName={dotSizeClassName}
      />
      <span className={textClassName}>{buildTypingSentence(activeTypingUsers, maxClients)}</span>
    </div>
  );
};

export default TypingIndicators;
