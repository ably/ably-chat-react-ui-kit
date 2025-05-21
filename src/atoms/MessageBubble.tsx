import clsx from 'clsx';
import React from 'react';

interface MessageBubbleProps {
  text: string;
  isDeleted?: boolean;
  isSelf?: boolean;
  className?: string;
}

export function MessageBubble({
  text,
  isDeleted = false,
  isSelf = false,
  className = '',
}: MessageBubbleProps) {
  const baseClasses = clsx('message-bubble', {
    'message-bubble-self': isSelf,
    'message-bubble-other': !isSelf,
  });

  return (
    <div className={`${baseClasses} ${className}`}>
      {isDeleted ? <>This message was deleted.</> : text}
    </div>
  );
}
