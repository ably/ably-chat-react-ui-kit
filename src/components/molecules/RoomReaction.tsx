import React, { useState, useRef, useCallback } from 'react';
import Icon from '../atoms/Icon';
import EmojiBurst from './EmojiBurst';

/**
 * Props for the RoomReaction component
 */
interface RoomReactionProps {
  /** Callback function when a reaction is sent, receives the reaction emoji */
  onReactionSend: (reaction: string) => void;
}

/**
 * RoomReaction component provides quick reaction functionality for the chat room
 *
 * Features:
 * - Quick thumbs-up button with animation
 * - Emoji burst animation when reaction is sent
 * - Positioned alongside the message input
 */
const RoomReaction: React.FC<RoomReactionProps> = ({ onReactionSend }) => {
  const [showEmojiBurst, setShowEmojiBurst] = useState(false);
  const [emojiBurstPosition, setEmojiBurstPosition] = useState({ x: 0, y: 0 });
  const thumbsUpButtonRef = useRef<HTMLButtonElement>(null);

  /**
   * Handles clicking the thumbs-up button
   * Triggers the emoji burst animation at the button's position
   */
  const handleThumbsUpClick = useCallback(() => {
    // Send a thumbs up reaction immediately
    onReactionSend('👍');

    // Show the animation
    const button = thumbsUpButtonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      setEmojiBurstPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
      setShowEmojiBurst(true);
    }
  }, [onReactionSend]);

  /**
   * Callback when the emoji burst animation completes
   * Hides the animation
   */
  const handleEmojiBurstComplete = useCallback(() => {
    setShowEmojiBurst(false);
  }, []);

  return (
    <>
      {/* Thumbs Up Reaction Button */}
      <button
        ref={thumbsUpButtonRef}
        className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded-md text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        onClick={handleThumbsUpClick}
        aria-label="Send thumbs up reaction"
        type="button"
      >
        <Icon name="thumbsup" size="md" aria-hidden={true} />
      </button>

      {/* Emoji Burst Animation */}
      <EmojiBurst
        isActive={showEmojiBurst}
        position={emojiBurstPosition}
        onComplete={handleEmojiBurstComplete}
      />
    </>
  );
};

export default RoomReaction; 