import React from 'react';

interface TypingIndicatorProps {
  currentTypers: string[]; // e.g. ['Alice', 'Bob']
  className?: string;
}

export function TypingIndicator({ currentTypers, className = '' }: TypingIndicatorProps) {
  if (currentTypers.length === 0) return null;

  const text =
    currentTypers.length === 1
      ? `${currentTypers[0]} is typing…`
      : `${currentTypers.join(', ')} are typing…`;

  return <div className={`typing-indicator ${className}`}>{text}</div>;
}
