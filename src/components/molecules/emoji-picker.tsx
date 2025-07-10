import React, { useCallback, useEffect, useMemo, useState } from 'react';

const DEFAULT_EMOJI_STORAGE_KEY = 'ably-chat-recent-emojis';

/**
 * Props for the EmojiPicker component
 */
export interface EmojiPickerProps {
  /**
   * Callback function triggered when the picker should be closed.
   * Called on backdrop click, escape key press, or programmatic close.
   * Should update the parent component's state to hide the picker.
   *
   * This callback does not automatically close the picker after emoji selection.
   * Use onEmojiSelect to handle post-selection behavior.
   */
  onClose: () => void;

  /**
   * Callback function triggered when an emoji is selected.
   * Receives the selected emoji character as a string parameter.
   * The selected emoji is automatically added to recent emojis list.
   *
   * @param emoji - The selected emoji character (e.g., "😀", "❤️")
   *
   * - Recent emojis are persisted to localStorage
   * - Maximum of 10 recent emojis are maintained
   *
   * @example
   * ```tsx
   * onEmojiSelect={(emoji) => {
   *   addEmojiToInput(emoji);
   *   setPickerOpen(false); // Close picker after selection
   * }}
   * ```
   */
  onEmojiSelect: (emoji: string) => void;

  /**
   * Position coordinates for rendering the picker in viewport coordinates.
   * Should account for picker dimensions (240px × 320px) to prevent overflow.
   *
   * - Consider viewport boundaries to prevent edge overflow
   * - Add margins for visual spacing from trigger element
   *
   * @example
   * ```tsx
   * // Position below button with spacing
   * const rect = buttonRef.current.getBoundingClientRect();
   * const position = {
   *   top: rect.bottom + 8,
   *   left: rect.left
   * };
   *
   * // Position above with overflow protection
   * const position = {
   *   top: Math.max(10, rect.top - 330),
   *   left: Math.min(rect.left, window.innerWidth - 250)
   * };
   * ```
   */
  position: { top: number; left: number };

  /**
   * Number of columns to display in the emoji grid.
   * Affects both main emoji grid and recent emojis section.
   * Must be a positive integer; decimal values may cause layout issues.
   *
   * @default 4
   *
   * - Higher values create wider, shorter grids
   * - Lower values create narrower, taller grids
   * - Consider emoji button size (32px) when choosing columns
   * - Recommended range: 3-6 columns for optimal usability
   */
  columns?: number;

  /**
   * Optional custom list of emojis to display instead of the default set.
   * Useful for creating themed emoji pickers or limiting choices.
   *
   * Custom List Behavior:
   * - Completely replaces the default emoji set
   * - Recent emojis will only show emojis from this custom list
   * - Order in array determines display order in picker
   *
   * @example
   * ```tsx
   * // Reaction-only emojis
   * emojiList={['👍', '👎', '❤️', '😂', '😮', '😢']}
   *
   * // Status emojis
   * emojiList={['🟢', '🟡', '🔴', '⚫', '🔵']}
   *
   * // Celebration emojis
   * emojiList={['🎉', '🥳', '🎊', '🍾', '🎈', '🎁']}
   * ```
   */
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
 * - Persistent recent emojis via localStorage
 * - Optimized rendering with memoization
 *
 * @example
 * // Basic emoji picker triggered by button
 * const [pickerOpen, setPickerOpen] = useState(false);
 * const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
 *
 * const handleShowPicker = (event: React.MouseEvent) => {
 *   const rect = event.currentTarget.getBoundingClientRect();
 *   setPickerPosition({
 *     top: rect.bottom + 8,
 *     left: rect.left
 *   });
 *   setPickerOpen(true);
 * };
 *
 * return (
 *   <>
 *     <button onClick={handleShowPicker}>😀 Add Emoji</button>
 *     <EmojiPicker
 *       isOpen={pickerOpen}
 *       position={pickerPosition}
 *       onClose={() => setPickerOpen(false)}
 *       onEmojiSelect={(emoji) => {
 *         addEmojiToMessage(emoji);
 *         setPickerOpen(false);
 *       }}
 *     />
 *   </>
 * );
 *
 * @example
 * // Custom emoji list with reaction-specific emojis
 * const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];
 *
 * {showReactionPicker && (<EmojiPicker
 *   position={reactionPosition}
 *   emojiList={reactionEmojis}
 *   columns={3}
 *   onClose={() => setShowReactionPicker(false)}
 *   onEmojiSelect={handleReaction}
 * />)}
 *
 * @example
 * // Chat message emoji picker with positioning
 * const handleEmojiButton = (event: React.MouseEvent, messageId: string) => {
 *   event.stopPropagation();
 *   const rect = event.currentTarget.getBoundingClientRect();
 *
 *   // Position above the button with some spacing
 *   setPickerPosition({
 *     top: rect.top - 330, // picker height + margin
 *     left: Math.max(10, rect.left - 100) // prevent edge overflow
 *   });
 *   setActiveMessageId(messageId);
 *   setPickerOpen(true);
 * };
 */
export const EmojiPicker = ({
  onClose,
  onEmojiSelect,
  position,
  columns = 4,
  emojiList,
}: EmojiPickerProps) => {
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);

  // Load recent emojis from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DEFAULT_EMOJI_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        setRecentEmojis(parsed);
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
          localStorage.setItem(DEFAULT_EMOJI_STORAGE_KEY, JSON.stringify(updated));
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
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Use provided emoji list or default
  const displayEmojis = useMemo(() => emojiList || emojis, [emojiList]);

  // Memoize emoji buttons to optimize rendering
  const emojiButtons = useMemo(() => {
    return displayEmojis.map((emoji) => (
      <button
        key={emoji}
        className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        onClick={() => {
          handleEmojiSelect(emoji);
        }}
        aria-label={`Emoji ${emoji}`}
        title={emoji}
      >
        {emoji}
      </button>
    ));
  }, [displayEmojis, handleEmojiSelect]);

  // Memoize recent emoji buttons
  const recentEmojiButtons = useMemo(() => {
    if (recentEmojis.length === 0) return;

    return (
      <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Recent</p>
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${String(columns)}, minmax(0, 1fr))` }}
        >
          {recentEmojis.map((emoji) => (
            <button
              key={`recent-${emoji}`}
              className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              onClick={() => {
                handleEmojiSelect(emoji);
              }}
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
          width: 'min(240px, calc(100vw - 40px))',
          height: 'min(320px, calc(100vh - 40px))',
          minHeight: '120px', // Ensures at least 2 rows of emojis (8px padding + 2 * (32px emoji + 8px gap))
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
              style={{ gridTemplateColumns: `repeat(${String(columns)}, minmax(0, 1fr))` }}
            >
              {emojiButtons}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
