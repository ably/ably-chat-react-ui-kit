import React from 'react';
import EmojiPickerReact from 'emoji-picker-react';
import { EmojiClickData } from 'emoji-picker-react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  className?: string;
}

export function EmojiPicker({ onEmojiSelect, className = '' }: EmojiPickerProps) {
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
  };

  return (
    <div className={`dropdown dropdown-end ${className}`}>
      <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
        <span className="text-lg">😊</span>
      </div>
      <div tabIndex={0} className="dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box">
        <EmojiPickerReact onEmojiClick={handleEmojiClick} />
      </div>
    </div>
  );
} 