import React from 'react';
import clsx from 'clsx';

interface ReactionButtonProps {
  emoji: string;
  count: number;
  isActive?: boolean;
  onClick: (emoji: string) => void;
  onContextMenu?: (emoji: string) => void;
  className?: string;
}

export function ReactionButton({
  emoji,
  count,
  isActive = false,
  onClick,
  onContextMenu,
  className = '',
}: ReactionButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick(emoji);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (onContextMenu) {
      e.preventDefault();
      onContextMenu(emoji);
    }
  };

  return (
    <button
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className={clsx(
        'btn btn-sm gap-1 min-h-0 h-auto py-1 px-2',
        isActive ? 'btn-primary' : 'btn-ghost',
        className
      )}
      aria-label={`React with ${emoji}`}
    >
      <span>{emoji}</span>
      {count > 0 && <span className="text-xs opacity-70">({count})</span>}
    </button>
  );
}
