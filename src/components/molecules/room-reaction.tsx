import { RoomReactionEvent } from '@ably/chat';
import { useRoomReactions } from '@ably/chat/react';
import { clsx } from 'clsx';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useThrottle } from '../../hooks/use-throttle.tsx';
import { EmojiBurst } from './emoji-burst.tsx';
import { EmojiWheel } from './emoji-wheel.tsx';

/**
 * Props for the RoomReaction component
 */
export interface RoomReactionProps {
  /**
   * Duration for the emoji burst animation in milliseconds.
   * Controls how long the emoji animation is visible before automatically hiding.
   * Longer durations provide more noticeable feedback but may feel slower.
   * @default 500
   */
  emojiBurstDuration?: number;

  /**
   * Fixed position for the burst animation when receiving reactions from others.
   * When provided, all incoming reactions will animate at this position.
   * When not provided, incoming reactions animate at screen center.
   * Own reactions always animate from the button position
   *
   * @example
   * // Fixed position in top-right corner
   * emojiBurstPosition={{ x: window.innerWidth - 100, y: 100 }}
   *
   * @example
   * // Center of a specific element
   * const rect = element.getBoundingClientRect();
   * emojiBurstPosition={{
   *   x: rect.left + rect.width / 2,
   *   y: rect.top + rect.height / 2
   * }}
   */
  emojiBurstPosition?: { x: number; y: number };

  /**
   * Additional CSS classes to apply to the reaction button container.
   * Allows customization of spacing, alignment, and styling.
   * Merged with default padding and container classes using clsx.
   *
   * @example
   * // Custom spacing and positioning
   * className="px-6 py-2 fixed bottom-4 right-4"
   *
   * @example
   * // Integration with flex layouts
   * className="flex-shrink-0 ml-auto"
   */
  className?: string;
}

/**
 * RoomReaction component provides ephemeral room reaction functionality for chat rooms
 *
 * Core Features:
 * - Quick reaction button with customizable default emoji (starts with 👍)
 * - Long press (500ms) to open circular emoji selection wheel
 * - Selected emoji becomes new default for subsequent quick reactions
 * - Immediate visual feedback with emoji burst animations
 * - Throttled sending (max 1 reaction per 200ms)
 * - Handles both outgoing and incoming room reactions
 * - Mobile-friendly with touch event support and haptic feedback
 * - Accessible with proper ARIA labels and keyboard interaction
 *
 * Interaction:
 * • Short click/tap: Sends current default emoji immediately
 * • Long press/hold: Opens emoji wheel for selection
 * • Emoji wheel selection: Updates default and sends chosen emoji
 * • Click outside wheel: Closes wheel without sending
 *
 *
 * Room Reactions vs Message Reactions:
 * Room reactions are ephemeral like typing indicators - they provide momentary
 * feedback without being stored in chat history. They're useful for quick
 * acknowledgments, applause, or ambient reactions during conversations.
 *
 * @example
 * // With custom animation settings
 * <RoomReaction
 *   emojiBurstDuration={1000}
 *   emojiBurstPosition={{ x: 400, y: 300 }}
 * />
 *
 * @example
 * // Custom positioning and styling
 * <RoomReaction
 *   className="fixed bottom-4 right-4 bg-white rounded-full shadow-lg p-2"
 *   emojiBurstDuration={750}
 * />
 *
 */
export const RoomReaction = ({
  emojiBurstDuration = 500,
  emojiBurstPosition: initialEmojiBurstPosition,
  className,
}: RoomReactionProps) => {
  const [showEmojiBurst, setShowEmojiBurst] = useState(false);
  const [emojiBurstPosition, setEmojiBurstPosition] = useState(
    initialEmojiBurstPosition || { x: 0, y: 0 }
  );
  const [burstEmoji, setBurstEmoji] = useState('👍');
  const [showEmojiWheel, setShowEmojiWheel] = useState(false);
  const [emojiWheelPosition, setEmojiWheelPosition] = useState({ x: 0, y: 0 });
  const [defaultEmoji, setDefaultEmoji] = useState('👍'); // Track current default emoji

  const reactionButtonRef = useRef<HTMLButtonElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isLongPressRef = useRef(false);

  const { send } = useRoomReactions({
    listener: (reaction: RoomReactionEvent) => {
      if (reaction.reaction.isSelf) {
        // If the reaction is from ourselves, we don't need to show the burst animation
        // (we already showed it locally for immediate feedback)
        return;
      }

      // Set the emoji and show burst for incoming reactions
      setBurstEmoji(reaction.reaction.name);

      // Use provided position or default to screen center for incoming reactions
      if (initialEmojiBurstPosition) {
        setEmojiBurstPosition(initialEmojiBurstPosition);
      } else {
        // Show burst in the screen center for incoming reactions
        setEmojiBurstPosition({
          x: window.innerWidth / 2, // horizontal center
          y: window.innerHeight / 2, // vertical center
        });
      }

      setShowEmojiBurst(true);
    },
  });

  /**
   * Shows the local burst animation at the button position.
   * This provides immediate visual feedback regardless of network throttling.
   * Always animates from the button location for own reactions.
   *
   * @param emoji - The emoji character to animate in the burst
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
   * Sends a room reaction to all participants (without throttling).
   * This is the base function that communicates with Ably Chat.
   * Will be wrapped by useThrottle to prevent excessive API calls.
   *
   * @param emoji - The emoji reaction to send to the room
   */
  const sendRoomReaction = useCallback(
    (emoji: string): void => {
      send({ name: emoji }).catch((error: unknown) => {
        console.error('Failed to send room reaction:', error);
      });
    },
    [send]
  );

  // Create throttled version of the send function to avoid excessive network calls
  // Limits to maximum 1 reaction per 200ms while preserving immediate visual feedback
  const throttledSendReaction = useThrottle(sendRoomReaction, 200);

  /**
   * Handles sending a room reaction with immediate visual feedback and throttled network call.
   * Shows local animation instantly, then sends throttled network request.
   * This pattern ensures responsive UX even with network throttling.
   *
   * @param emoji - The emoji reaction to send and animate
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
   * Handles clicking the reaction button (short press).
   * Sends the current default emoji reaction if this wasn't part of a long press.
   * Long press detection prevents accidental reactions when opening emoji wheel.
   */
  const handleReactionClick = useCallback(() => {
    // Only send reaction if this wasn't a long press
    if (!isLongPressRef.current) {
      sendReaction(defaultEmoji);
    }
    // Reset long press flag for next interaction
    isLongPressRef.current = false;
  }, [sendReaction, defaultEmoji]);

  /**
   * Handles starting a potential long press interaction.
   * Sets up timer to detect long press (500ms threshold).
   * When timer completes, opens emoji wheel at button position.
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

        // Add haptic feedback if available (mobile devices)
        navigator.vibrate(50);
      }
    }, 500); // 500ms threshold for long press detection
  }, []);

  /**
   * Handles ending a potential long press interaction.
   * Clears the long press timer to prevent wheel from opening.
   * Called on mouse up, mouse leave, touch end events.
   */
  const handleMouseUp = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = undefined;
    }
  }, []);

  /**
   * Handles touch start for mobile long press detection.
   * Delegates to mouse down handler for unified behavior.
   */
  const handleTouchStart = useCallback(() => {
    handleMouseDown();
  }, [handleMouseDown]);

  /**
   * Handles touch end for mobile long press detection.
   * Delegates to mouse up handler for unified behavior.
   */
  const handleTouchEnd = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);

  /**
   * Handles emoji selection from the emoji wheel.
   * Updates the default emoji for future quick reactions and sends the selected emoji.
   * Closes the wheel after selection completes.
   *
   * @param emoji - The emoji selected from the wheel
   */
  const handleEmojiSelect = useCallback(
    (emoji: string) => {
      setShowEmojiWheel(false);
      setDefaultEmoji(emoji); // Update default emoji for future quick reactions
      sendReaction(emoji);
    },
    [sendReaction]
  );

  /**
   * Handles closing the emoji wheel without selecting an emoji.
   * Called when clicking outside the wheel or pressing escape.
   */
  const handleEmojiWheelClose = useCallback(() => {
    setShowEmojiWheel(false);
  }, []);

  /**
   * Updates the emoji wheel position when the window is resized
   * Ensures the wheel stays properly positioned relative to the button
   */
  useEffect(() => {
    if (!showEmojiWheel) return;

    const handleResize = () => {
      const button = reactionButtonRef.current;
      if (button) {
        const rect = button.getBoundingClientRect();
        setEmojiWheelPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [showEmojiWheel]);

  /**
   * Callback when the emoji burst animation completes.
   * Hides the animation component to clean up the UI.
   */
  const handleEmojiBurstComplete = useCallback(() => {
    setShowEmojiBurst(false);
  }, []);

  return (
    <div className={clsx('px-4 py-4', className)}>
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
        <span className="text-xl" aria-hidden="true">
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
