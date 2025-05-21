import React from 'react';
import { Reaction } from '@ably/chat';

interface ReactionListProps {
  reactions: Reaction[];
  className?: string;
  reactionClassName?: string;
  label?: string;
}

export function ReactionList({
  reactions,
  className = '',
  reactionClassName = '',
  label = 'Received reactions:',
}: ReactionListProps) {
  return (
    <div className={`reaction-list ${className}`}>
      <span>{label}</span>
      <div className="reaction-list-container">
        {reactions.map((reaction, idx) => (
          <span key={idx} className={`reaction-item ${reactionClassName}`}>
            {reaction.type}
          </span>
        ))}
      </div>
    </div>
  );
}
