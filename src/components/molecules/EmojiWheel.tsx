import React, { useEffect, useState } from 'react';
import { Icon } from '../atoms/Icon';

/**
 * Props for the EmojiWheel component
 */
export interface EmojiWheelProps {
  /** Whether the emoji wheel is currently visible */
  isOpen: boolean;
  /** Position where the wheel should appear */
  position: { x: number; y: number };
  /** Callback when an emoji is selected */
  onEmojiSelect: (emoji: string) => void;
  /** Callback when the wheel should be closed */
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
 */
export const EmojiWheel: React.FC<EmojiWheelProps> = ({
  isOpen,
  position,
  onEmojiSelect,
  onClose,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Available emoji reactions for the wheel
  const emojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🎉'];

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
      return () => document.removeEventListener('mousedown', handleClickOutside);
    } else {
      // Delay hiding to allow exit animation
      const timer = setTimeout(() => setIsAnimating(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen && !isAnimating) return null;

  const radius = 80; // Distance from center to emoji buttons
  const buttonSize = 48; // Size of each emoji button
  const wheelSize = (radius + buttonSize) * 2; // Total wheel size

  // Calculate safe position to prevent wheel from going off-screen
  const safePosition = {
    x: Math.max(wheelSize / 2, Math.min(window.innerWidth - wheelSize / 2, position.x)),
    y: Math.max(wheelSize / 2, Math.min(window.innerHeight - wheelSize / 2, position.y)),
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
              onClick={() => onEmojiSelect(emoji)}
              className={`absolute rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl hover:scale-125 transition-all duration-200 flex items-center justify-center text-2xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
                isOpen ? 'animate-pulse' : ''
              }`}
              style={{
                width: buttonSize,
                height: buttonSize,
                left: '50%',
                top: '50%',
                transform: `translate(${x - buttonSize / 2}px, ${y - buttonSize / 2}px)`,
                animationDelay: `${index * 75}ms`,
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
