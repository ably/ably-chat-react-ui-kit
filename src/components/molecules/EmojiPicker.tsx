import React from 'react';

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
  position: { top: number; left: number };
}

const emojis = [
  '👍',
  '❤️',
  '😊',
  '😂',
  '😱',
  '😢',
  '🏃',
  '💯',
  '🔥',
  '👏',
  '☀️',
  '🎉',
  '🌈',
  '🙌',
  '💡',
  '🎶',
  '😎',
  '🤔',
  '🧠',
  '🍕',
  '🌟',
  '🚀',
  '🐶',
  '🐱',
  '🌍',
  '📚',
  '🎯',
  '🥳',
  '🤖',
  '🎨',
  '🧘',
  '🏆',
  '💥',
  '💖',
  '😇',
  '😜',
  '🌸',
  '💬',
  '📸',
  '🛠️',
  '⏰',
  '🧩',
  '🗺️',
];

const EmojiPicker: React.FC<EmojiPickerProps> = ({ isOpen, onClose, onEmojiSelect, position }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Emoji Picker */}
      <div
        className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 grid grid-cols-4 gap-2"
        style={{
          top: position.top,
          left: position.left,
          minWidth: '200px',
        }}
      >
        {emojis.map((emoji) => (
          <button
            key={emoji}
            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            onClick={() => onEmojiSelect(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </>
  );
};

export default EmojiPicker;
