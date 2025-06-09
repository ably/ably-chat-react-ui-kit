import React, { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Props for the EmojiPicker component
 */
export interface EmojiPickerProps {
  /** Whether the emoji picker is currently open */
  isOpen: boolean;
  /** Callback function when the picker is closed */
  onClose: () => void;
  /** Callback function when an emoji is selected, receives the emoji character */
  onEmojiSelect: (emoji: string) => void;
  /** Position coordinates for rendering the picker */
  position: { top: number; left: number };
  /** Number of columns to display (default: 4) */
  columns?: number;
  /** Optional custom list of emojis to display */
  emojiList?: string[];
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

/**
 * EmojiPicker component displays a grid of emoji characters for selection
 *
 * Features:
 * - Positioned at specified coordinates
 * - Backdrop for easy dismissal
 * - Grid layout of emojis with customizable columns
 * - Recent emojis section showing last 10 used emojis
 * - Scrollable emoji list
 * - Keyboard navigation (Escape to close)
 * - Support for custom emoji lists
 * - Accessible emoji buttons
 */
export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  isOpen,
  onClose,
  onEmojiSelect,
  position,
  columns = 4,
  emojiList,
}) => {
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);

  // Load recent emojis from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentEmojis');
      if (stored) {
        setRecentEmojis(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recent emojis:', error);
    }
  }, []);

  // Add emoji to recent list when selected
  const handleEmojiSelect = useCallback(
    (emoji: string) => {
      setRecentEmojis((prev) => {
        // Remove emoji if it already exists in the list
        const filtered = prev.filter((e) => e !== emoji);
        // Add emoji to the beginning of the list and limit to 10
        const updated = [emoji, ...filtered].slice(0, 10);

        // Save to localStorage
        try {
          localStorage.setItem('recentEmojis', JSON.stringify(updated));
        } catch (error) {
          console.error('Failed to save recent emojis:', error);
        }

        return updated;
      });

      onEmojiSelect(emoji);
    },
    [onEmojiSelect]
  );

  // Handle Escape key to close the picker
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Use provided emoji list or default
  const displayEmojis = useMemo(() => emojiList || emojis, [emojiList]);

  // Memoize emoji buttons to optimize rendering
  const emojiButtons = useMemo(() => {
    return displayEmojis.map((emoji) => (
      <button
        key={emoji}
        className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        onClick={() => handleEmojiSelect(emoji)}
        aria-label={`Emoji ${emoji}`}
        title={emoji}
      >
        {emoji}
      </button>
    ));
  }, [displayEmojis, handleEmojiSelect]);

  // Memoize recent emoji buttons
  const recentEmojiButtons = useMemo(() => {
    if (recentEmojis.length === 0) return null;

    return (
      <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Recent</p>
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {recentEmojis.map((emoji) => (
            <button
              key={`recent-${emoji}`}
              className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              onClick={() => handleEmojiSelect(emoji)}
              aria-label={`Emoji ${emoji}`}
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    );
  }, [recentEmojis, columns, handleEmojiSelect]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />

      {/* Emoji Picker */}
      <div
        className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden"
        style={{
          top: position.top,
          left: position.left,
          width: '240px',
          height: '320px',
        }}
        role="dialog"
        aria-label="Emoji picker"
      >
        {/* Fixed container with proper scrolling */}
        <div className="h-full flex flex-col">
          {/* Content area with scrolling */}
          <div className="flex-1 overflow-y-auto p-3">
            {recentEmojiButtons}

            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            >
              {emojiButtons}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
