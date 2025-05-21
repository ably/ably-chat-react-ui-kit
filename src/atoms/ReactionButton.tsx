import React from 'react';

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
      className={`reaction-button ${className}`}
      aria-label={`React with ${emoji}`}
    >
      {emoji} ({count})
    </button>
  );
}
