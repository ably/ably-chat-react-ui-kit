import React, { useState, useRef, useCallback } from 'react';
import { useRoomReactions } from '@ably/chat/react';
import Icon from '../atoms/Icon';
import EmojiBurst from './EmojiBurst';
import { RoomReactionEvent } from '@ably/chat';

/**
 * Props for the RoomReaction component
 */
interface RoomReactionProps {
  // No props needed - component is self-contained with useRoomReactions hook
}

/**
 * RoomReaction component provides quick reaction functionality for the chat room
 *
 * Features:
 * - Quick thumbs-up button with animation
 * - Emoji burst animation when reaction is sent or received
 * - Uses ephemeral room reactions (not stored messages)
 * - Positioned alongside the message input
 *
 * Room reactions are ephemeral and similar to typing indicators - they provide
 * momentary feedback without being persisted in the chat history.
 */
const RoomReaction: React.FC<RoomReactionProps> = () => {
  const [showEmojiBurst, setShowEmojiBurst] = useState(false);
  const [emojiBurstPosition, setEmojiBurstPosition] = useState({ x: 0, y: 0 });
  const [burstEmoji, setBurstEmoji] = useState('👍');
  const thumbsUpButtonRef = useRef<HTMLButtonElement>(null);

  // Use room reactions hook for ephemeral reactions
  const { send } = useRoomReactions({
    listener: (reaction: RoomReactionEvent) => {
      if (reaction.reaction.isSelf) {
        // If the reaction is from ourselves, we don't need to show the burst animation
        return;
      }
      // Set the emoji and show burst at a default position (could be enhanced to show at random positions)
      setBurstEmoji(reaction.reaction.type);
      // Show burst in the screens center for incoming reactions
      setEmojiBurstPosition({
        x: window.innerWidth / 2, // horizontal center
        y: window.innerHeight / 2, // vertical center
      });
      setShowEmojiBurst(true);
    },
  });

  /**
   * Handles clicking the thumbs-up button
   * Sends a room reaction and triggers the emoji burst animation at the button's position
   */
  const handleThumbsUpClick = useCallback(async () => {
    try {
      // Send an ephemeral room reaction
      await send({ type: '👍' });

      // Show the animation at the button's position for our own reaction
      const button = thumbsUpButtonRef.current;
      if (button) {
        const rect = button.getBoundingClientRect();
        setBurstEmoji('👍');
        setEmojiBurstPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
        setShowEmojiBurst(true);
      }
    } catch (error) {
      console.error('Failed to send room reaction:', error);
    }
  }, [send]);

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
        emoji={burstEmoji}
        onComplete={handleEmojiBurstComplete}
      />
    </>
  );
};

export default RoomReaction;
