import React, { useEffect, useState } from 'react';

import { Icon } from '../atoms/icon.tsx';

// Default set of emoji reactions for the wheel
const DEFAULT_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🎉'];

/**
 * Props for the EmojiWheel component
 */
export interface EmojiWheelProps {
  /**
   * Whether the emoji wheel is currently visible and usable.
   * Controls both visibility and animation states.
   * When transitioning from true to false, exit animation plays before hiding.
   */
  isOpen: boolean;

  /**
   * Position where the wheel should appear, in viewport coordinates.
   * The wheel automatically adjusts position to stay within viewport boundaries.
   *
   * - Wheel centers itself on the provided coordinates
   * - Automatically repositioned if it would extend beyond viewport edges
   * - Ensures the wheel is fully visible on screen
   * - Total wheel diameter: ~208px (80px radius + 48px button + padding)
   *
   * @example
   * ```tsx
   * // From mouse event
   * position={{ x: event.clientX, y: event.clientY }}
   *
   * // From element center
   * const rect = element.getBoundingClientRect();
   * position={{
   *   x: rect.left + rect.width / 2,
   *   y: rect.top + rect.height / 2
   * }}
   *
   * // From touch event
   * const touch = event.touches[0];
   * position={{ x: touch.clientX, y: touch.clientY }}
   * ```
   */
  position: { x: number; y: number };

  /**
   * Optional list of emojis to display on the wheel.
   * If not provided, a default set of 8 emojis will be used.
   *
   * For optimal user experience, it's recommended to use exactly 8 emojis,
   * as the wheel is designed to display this number in a circular arrangement.
   * Using fewer or more emojis may affect the visual layout and usability.
   *
   * @example
   * ```tsx
   * // Custom emoji set
   * emojis={['🔥', '🚀', '👀', '🙌', '💯', '🎯', '🌟', '✨']}
   * ```
   */
  emojis?: string[];

  /**
   * Callback function triggered when an emoji is selected from the wheel.
   * Receives the selected emoji character as a string parameter.
   * The wheel does not automatically close after selection.
   *
   * @param emoji - The selected emoji from the set (default or custom)
   *
   * @remarks
   * The callback should handle:
   * - Adding the reaction to your data model
   * - Closing the wheel (by setting isOpen to false)
   * - Any additional UI updates or animations
   *
   * @example
   * ```tsx
   * onEmojiSelect={(emoji) => {
   *   // Add reaction to message
   *   sendReaction(emoji);
   *
   *   // Close the wheel
   *   setWheelOpen(false);
   *
   *   // Optional: Show feedback
   *   showToast(`Reacted with ${emoji}`);
   * }}
   * ```
   */
  onEmojiSelect: (emoji: string) => void;

  /**
   * Callback function triggered when the wheel should be closed.
   * Called when user clicks outside the wheel, clicks the center close button,
   * or triggers other dismissal actions.
   *
   * To dismiss the wheel, you can:
   * - Clicking outside the wheel area
   * - Clicking the center close button
   * - Programmatic closure (escape key, etc.)
   *
   * This callback should update parent state to set isOpen to false.
   * The component handles exit animations automatically.
   *
   * @example
   * ```tsx
   * onClose={() => {
   *   setWheelOpen(false);
   *   // Optional: cleanup or additional actions
   *   clearSelection();
   * }}
   * ```
   */
  onClose: () => void;
}

/**
 * EmojiWheel component displays a circular selection of emoji reactions
 *
 * Features:
 * - Circular arrangement of 8 emoji reactions
 * - Animated appearance with scaling and rotation
 * - Click outside to close
 * - Hover effects for better UX
 * - Optimized for touch and mouse interaction
 * - Safe positioning prevents off-screen rendering
 * - Staggered animation entrance for visual appeal
 * - Center close button for easy dismissal
 *
 *
 * @example
 * // Quick reaction button in chat interface
 * const [showReactionWheel, setShowReactionWheel] = useState(false);
 * const reactionButtonRef = useRef<HTMLButtonElement>(null);
 *
 * const handleReactionClick = () => {
 *   if (reactionButtonRef.current) {
 *     const rect = reactionButtonRef.current.getBoundingClientRect();
 *     setWheelPosition({
 *       x: rect.left + rect.width / 2,
 *       y: rect.top + rect.height / 2
 *     });
 *     setShowReactionWheel(true);
 *   }
 * };
 *
 * <button
 *   ref={reactionButtonRef}
 *   onClick={handleReactionClick}
 *   className="reaction-trigger"
 * >
 *   😀 React
 * </button>
 *
 * @example
 * // Touch-optimized mobile usage
 * const handleTouchStart = (event: React.TouchEvent) => {
 *   const touch = event.touches[0];
 *   setWheelPosition({ x: touch.clientX, y: touch.clientY });
 *   setWheelOpen(true);
 * };
 *
 * <div
 *   onTouchStart={handleTouchStart}
 *   className="touch-target"
 * >
 *   Hold to react
 * </div>
 */
export const EmojiWheel = ({
  isOpen,
  position,
  emojis: customEmojis,
  onEmojiSelect,
  onClose,
}: EmojiWheelProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Use custom emojis or fall back to default set
  const emojis = customEmojis || DEFAULT_EMOJIS;

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Add click outside listener
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        if (!target.closest('[data-emoji-wheel]')) {
          onClose();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    } else {
      // Delay hiding to allow exit animation
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 200);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [isOpen, onClose]);

  // Force re-render on window resize to ensure proper positioning
  const [, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    if (!isOpen && !isAnimating) return;

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, isAnimating]);

  if (!isOpen && !isAnimating) return;

  const radius = 80; // Distance from center to emoji buttons
  const buttonSize = 48; // Size of each emoji button
  const wheelSize = (radius + buttonSize) * 2; // Total wheel size

  // Calculate safe position to prevent wheel from going off-screen
  const minMargin = 20; // Minimum margin from screen edges
  const safePosition = {
    x: Math.max(
      wheelSize / 2 + minMargin,
      Math.min(window.innerWidth - wheelSize / 2 - minMargin, position.x)
    ),
    y: Math.max(
      wheelSize / 2 + minMargin,
      Math.min(window.innerHeight - wheelSize / 2 - minMargin, position.y)
    ),
  };

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none"
      role="dialog"
      aria-label="Emoji reaction selector"
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 transition-opacity duration-200 pointer-events-auto ${
          isOpen ? 'opacity-30' : 'opacity-0'
        }`}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
        onClick={onClose}
      />

      {/* Emoji Wheel Container */}
      <div
        data-emoji-wheel="true"
        className={`absolute pointer-events-auto transition-all duration-300 ease-out ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
        }`}
        style={{
          left: safePosition.x - wheelSize / 2,
          top: safePosition.y - wheelSize / 2,
          width: wheelSize,
          height: wheelSize,
        }}
      >
        {/* Center background circle */}
        <div className="absolute inset-0 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-2xl border border-gray-200 dark:border-gray-600" />

        {/* Center close button */}
        <button
          onClick={onClose}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center shadow-md z-10"
          aria-label="Close emoji selector"
        >
          <Icon name="close" size="sm" />
        </button>

        {/* Emoji buttons arranged in circle */}
        {emojis.map((emoji, index) => {
          const angle = (index / emojis.length) * 2 * Math.PI - Math.PI / 2; // Start from top
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <button
              key={emoji}
              onClick={() => {
                onEmojiSelect(emoji);
              }}
              className={`absolute rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl hover:scale-125 transition-all duration-200 flex items-center justify-center text-2xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
                isOpen ? 'animate-pulse' : ''
              }`}
              style={{
                width: buttonSize,
                height: buttonSize,
                left: '50%',
                top: '50%',
                transform: `translate(${String(x - buttonSize / 2)}px, ${String(y - buttonSize / 2)}px)`,
                animationDelay: `${String(index * 75)}ms`,
                animationDuration: '800ms',
                animationIterationCount: '1',
                animationFillMode: 'both',
              }}
              aria-label={`React with ${emoji}`}
            >
              {emoji}
            </button>
          );
        })}
      </div>
    </div>
  );
};
