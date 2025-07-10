import React, { useEffect, useState } from 'react';

/**
 * Props for the EmojiBurst component
 */
export interface EmojiBurstProps {
  /**
   * Whether the burst animation is currently active.
   * When set to true, starts a new burst animation from the specified position.
   * Setting to false will not stop an ongoing animation - use onComplete for cleanup.
   */
  isActive: boolean;

  /**
   * The position where the burst should originate from, in viewport coordinates.
   * Typically obtained from element.getBoundingClientRect() or mouse event coordinates.
   *
   * @example
   * ```tsx
   * // From button center
   * const rect = buttonRef.current.getBoundingClientRect();
   * const position = {
   *   x: rect.left + rect.width / 2,
   *   y: rect.top + rect.height / 2
   * };
   *
   * // From mouse click
   * const position = { x: event.clientX, y: event.clientY };
   * ```
   */
  position: { x: number; y: number };

  /**
   * The emoji to display in the burst animation.
   * Special behavior: When set to '👍', automatically uses diverse skin tone variants.
   *
   * @default "👍"
   *
   * @example
   * ```tsx
   * emoji="🎉"  // Party celebration
   * emoji="❤️"  // Love reaction
   * emoji="😂"  // Laughter
   * emoji="👍"  // Uses skin tone variants: 👍, 👍🏻, 👍🏽, 👍🏿
   * ```
   */
  emoji?: string;

  /**
   * Duration of the burst animation in milliseconds.
   * Controls how long emojis remain visible before fading out completely.
   * Longer durations allow emojis to travel further and fade more gradually.
   *
   *
   * - Animation uses requestAnimationFrame for smooth 60fps performance
   * - Emojis begin fading after 2/3 of the duration
   */
  duration: number;

  /**
   * Callback function called when the animation completes and all emojis have faded out.
   * Use this to clean up state, typically by setting isActive to false.
   *
   * @example
   * ```tsx
   * onComplete={() => {
   *   setBurstActive(false);
   *   // Optional: trigger other effects
   *   playSound('burst-complete');
   * }}
   * ```
   */
  onComplete: () => void;
}

/**
 * Internal interface representing a single emoji in the burst animation
 */
interface FlyingEmoji {
  /** Unique identifier for the emoji */
  id: number;
  /** The emoji character to display */
  emoji: string;
  /** Current x-coordinate position */
  x: number;
  /** Current y-coordinate position */
  y: number;
  /** Velocity in the x direction */
  vx: number;
  /** Velocity in the y direction */
  vy: number;
  /** Current rotation angle in degrees */
  rotation: number;
  /** Speed of rotation */
  rotationSpeed: number;
  /** Current opacity value (0-1) */
  opacity: number;
  /** Current scale factor */
  scale: number;
}

/**
 * EmojiBurst component creates an animated burst of emoji characters
 *
 * Features:
 * - Creates a circular burst of emojis with different skin tones (for thumbs-up) or the specified emoji
 * - Animates emojis with physics-based motion (velocity, gravity, rotation)
 * - Automatically fades out and cleans up after animation completes
 * - Non-interactive visual effect (pointer-events-none)
 * - Randomized trajectories and rotation for natural movement
 * - Adaptive emoji variants for inclusive representation
 *
 * @example
 * // Basic reaction burst on button click
 * const [burstActive, setBurstActive] = useState(false);
 * const [burstPosition, setBurstPosition] = useState({ x: 0, y: 0 });
 * const [burstDuration] = useState(2000); // 2 seconds
 *
 * const handleReaction = (event: React.MouseEvent) => {
 *   const rect = event.currentTarget.getBoundingClientRect();
 *   setBurstPosition({
 *     x: rect.left + rect.width / 2,
 *     y: rect.top + rect.height / 2
 *   });
 *   setBurstActive(true);
 * };
 *
 * return (
 *   <>
 *     <button onClick={handleReaction}>👍 Like</button>
 *     <EmojiBurst
 *       isActive={burstActive}
 *       position={burstPosition}
 *       duration={burstDuration}
 *       onComplete={() => setBurstActive(false)}
 *     />
 *   </>
 * );
 *
 * @example
 * // Custom emoji with longer duration
 * <EmojiBurst
 *   isActive={showCelebration}
 *   position={{ x: window.innerWidth / 2, y: window.innerHeight / 2 }}
 *   emoji="🎉"
 *   duration={3000}
 *   onComplete={() => setShowCelebration(false)}
 * />
 *
 * @example
 * // Triggered from mouse coordinates
 * const handleEmojiReaction = (event: MouseEvent, selectedEmoji: string) => {
 *   setBurstPosition({ x: event.clientX, y: event.clientY });
 *   setBurstEmoji(selectedEmoji);
 *   setBurstActive(true);
 * };
 *
 * <EmojiBurst
 *   isActive={burstActive}
 *   position={burstPosition}
 *   emoji={burstEmoji}
 *   onComplete={() => setBurstActive(false)}
 * />
 */
export const EmojiBurst = ({
  isActive,
  position,
  emoji = '👍',
  duration,
  onComplete,
}: EmojiBurstProps) => {
  const [emojis, setEmojis] = useState<FlyingEmoji[]>([]);

  useEffect(() => {
    if (!isActive) return;

    // Create burst of emojis
    const newEmojis: FlyingEmoji[] = [];

    // Use skin tone variations for thumbs-up, otherwise use the provided emoji
    const emojiVariants = emoji === '👍' ? ['👍', '👍🏻', '👍🏽', '👍🏿'] : [emoji];

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const speed = 3 + Math.random() * 4;

      newEmojis.push({
        id: i,
        emoji: emojiVariants[Math.floor(Math.random() * emojiVariants.length)] || emoji,
        x: position.x,
        y: position.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2, // Slight upward bias
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 20,
        opacity: 1,
        scale: 0.8 + Math.random() * 0.4,
      });
    }

    setEmojis(newEmojis);

    // Animation loop
    let animationFrame: number;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        setEmojis([]);
        onComplete();
        return;
      }

      setEmojis((currentEmojis) =>
        currentEmojis.map((emoji) => ({
          ...emoji,
          x: emoji.x + emoji.vx,
          y: emoji.y + emoji.vy,
          vy: emoji.vy + 0.3, // Gravity
          rotation: emoji.rotation + emoji.rotationSpeed,
          opacity: Math.max(0, 1 - progress * 1.5), // Fade out
          scale: emoji.scale * (1 - progress * 0.3), // Shrink slightly
        }))
      );

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isActive, position, emoji, duration, onComplete]);

  if (!isActive || emojis.length === 0) return;

  return (
    <div className="fixed inset-0 pointer-events-none z-50" aria-hidden="true" role="presentation">
      {emojis.map((emoji) => (
        <div
          key={emoji.id}
          className="absolute text-2xl select-none"
          style={{
            left: emoji.x - 12,
            top: emoji.y - 12,
            transform: `rotate(${String(emoji.rotation)}deg) scale(${String(emoji.scale)})`,
            opacity: emoji.opacity,
            transition: 'none',
          }}
          aria-hidden="true"
        >
          {emoji.emoji}
        </div>
      ))}
    </div>
  );
};
