import React, { useState, useRef, useCallback } from 'react';
import { useRoomReactions } from '@ably/chat/react';
import EmojiBurst from './EmojiBurst';
import EmojiWheel from './EmojiWheel';
import { RoomReactionEvent } from '@ably/chat';
import { useThrottle } from '../../hooks/useThrottle';

/**
 * Defines the properties for managing and customizing emoji reaction animations in a room.
 * @property {number} [emojiBurstDuration=500] - Duration for the emoji burst animation in milliseconds.
 * @property {Object} [emojiBurstPosition={ x: 0, y: 0 }] - Position for the burst animation, with x and y coordinates.
 */
interface RoomReactionProps {
  emojiBurstDuration?: number; // Duration for the emoji burst animation in ms
  emojiBurstPosition?: { x: number; y: number }; // Position for the burst animation
}

/**
 * RoomReaction component provides quick reaction functionality for the chat room
 *
 * Features:
 * - Quick reaction button with customizable default emoji
 * - Long press to open emoji selection wheel
 * - Selected emoji becomes new default for quick reactions
 * - Emoji burst animation when reaction is sent or received
 * - Throttled sending (max 1 reaction per 200ms) with immediate visual feedback
 * - Uses ephemeral room reactions (not stored messages)
 *
 * Room reactions are ephemeral and similar to typing indicators - they provide
 * momentary feedback without being persisted in the chat history.
 */
const RoomReaction: React.FC<RoomReactionProps> = ({
  emojiBurstDuration,
  emojiBurstPosition: initialEmojiBurstPosition,
}) => {
  const [showEmojiBurst, setShowEmojiBurst] = useState(false);
  const [emojiBurstPosition, setEmojiBurstPosition] = useState(
    initialEmojiBurstPosition || { x: 0, y: 0 }
  );
  const [burstEmoji, setBurstEmoji] = useState('👍');
  const [showEmojiWheel, setShowEmojiWheel] = useState(false);
  const [emojiWheelPosition, setEmojiWheelPosition] = useState({ x: 0, y: 0 });
  const [defaultEmoji, setDefaultEmoji] = useState('👍'); // Track current default emoji

  const reactionButtonRef = useRef<HTMLButtonElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  const { send } = useRoomReactions({
    listener: (reaction: RoomReactionEvent) => {
      if (reaction.reaction.isSelf) {
        // If the reaction is from ourselves, we don't need to show the burst animation
        return;
      }
      // Set the emoji and show burst at a default position (could be enhanced to show at random positions)
      setBurstEmoji(reaction.reaction.type);

      // If initialEmojiBurstPosition is provided, use it; otherwise use screen center
      if (!initialEmojiBurstPosition) {
        // Show burst in the screens center for incoming reactions
        setEmojiBurstPosition({
          x: window.innerWidth / 2, // horizontal center
          y: window.innerHeight / 2, // vertical center
        });
      }

      setShowEmojiBurst(true);
    },
  });

  /**
   * Shows the local burst animation at the button position
   * This provides immediate visual feedback regardless of network throttling
   */
  const showLocalBurst = useCallback((emoji: string) => {
    const button = reactionButtonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      setBurstEmoji(emoji);
      setEmojiBurstPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
      setShowEmojiBurst(true);
    }
  }, []);

  /**
   * Sends a room reaction (without throttling)
   * This is the base function that will be wrapped by useThrottle
   */
  const sendRoomReaction = useCallback(
    async (emoji: string) => {
      try {
        await send({ type: emoji });
      } catch (error) {
        console.error('Failed to send room reaction:', error);
      }
    },
    [send]
  );

  // Create throttled version of the send function to avoid excessive network calls
  const throttledSendReaction = useThrottle(sendRoomReaction, 200);

  /**
   * Handles sending a room reaction with immediate visual feedback and throttled network call
   */
  const sendReaction = useCallback(
    (emoji: string) => {
      // Always show local burst for immediate feedback
      showLocalBurst(emoji);

      // Send throttled network request
      throttledSendReaction(emoji);
    },
    [showLocalBurst, throttledSendReaction]
  );

  /**
   * Handles clicking the reaction button (short press)
   * Sends the current default emoji reaction with throttling
   */
  const handleReactionClick = useCallback(() => {
    // Only send reaction if this wasn't a long press
    if (!isLongPressRef.current) {
      sendReaction(defaultEmoji);
    }
    // Reset long press flag
    isLongPressRef.current = false;
  }, [sendReaction, defaultEmoji]);

  /**
   * Handles starting a potential long press
   */
  const handleMouseDown = useCallback(() => {
    isLongPressRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;

      // Show emoji wheel at button position
      const button = reactionButtonRef.current;
      if (button) {
        const rect = button.getBoundingClientRect();
        setEmojiWheelPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
        setShowEmojiWheel(true);

        // Add haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }
    }, 500); // 500ms for long press
  }, []);

  /**
   * Handles ending a potential long press
   */
  const handleMouseUp = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  /**
   * Handles touch start for mobile long press
   */
  const handleTouchStart = useCallback(() => {
    handleMouseDown();
  }, [handleMouseDown]);

  /**
   * Handles touch end for mobile long press
   */
  const handleTouchEnd = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);

  /**
   * Handles emoji selection from the wheel
   * Updates the default emoji and sends the reaction with throttling
   */
  const handleEmojiSelect = useCallback(
    (emoji: string) => {
      setShowEmojiWheel(false);
      setDefaultEmoji(emoji); // Update default emoji for future clicks
      sendReaction(emoji);
    },
    [sendReaction]
  );

  /**
   * Handles closing the emoji wheel
   */
  const handleEmojiWheelClose = useCallback(() => {
    setShowEmojiWheel(false);
  }, []);

  /**
   * Callback when the emoji burst animation completes
   * Hides the animation
   */
  const handleEmojiBurstComplete = useCallback(() => {
    setShowEmojiBurst(false);
  }, []);

  return (
    <div className="px-4 py-4">
      {/* Reaction Button */}
      <button
        ref={reactionButtonRef}
        className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded-md text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors select-none"
        onClick={handleReactionClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label={`Send ${defaultEmoji} reaction (long press for more options)`}
        type="button"
      >
        <span className="text-xl" aria-hidden={true}>
          {defaultEmoji}
        </span>
      </button>

      {/* Emoji Selection Wheel */}
      <EmojiWheel
        isOpen={showEmojiWheel}
        position={emojiWheelPosition}
        onEmojiSelect={handleEmojiSelect}
        onClose={handleEmojiWheelClose}
      />

      {/* Emoji Burst Animation */}
      <EmojiBurst
        isActive={showEmojiBurst}
        position={emojiBurstPosition}
        emoji={burstEmoji}
        duration={emojiBurstDuration}
        onComplete={handleEmojiBurstComplete}
      />
    </div>
  );
};

export default RoomReaction;
