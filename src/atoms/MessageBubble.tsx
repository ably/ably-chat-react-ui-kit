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
  return (
    <div className={clsx('text-base-content', className)}>
      {isDeleted ? (
        <span className="italic text-base-content/50">This message was deleted.</span>
      ) : (
        <p className="whitespace-pre-wrap break-words">{text}</p>
      )}
    </div>
  );
}
