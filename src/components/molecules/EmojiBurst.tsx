import React, { useEffect, useState } from 'react';

/**
 * Props for the EmojiBurst component
 */
interface EmojiBurstProps {
  /** Whether the burst animation is currently active */
  isActive: boolean;
  /** The position where the burst should originate from */
  position: { x: number; y: number };
  /** Callback function called when the animation completes */
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
 * - Creates a circular burst of thumbs-up emojis with different skin tones
 * - Animates emojis with physics-based motion (velocity, gravity, rotation)
 * - Automatically fades out and cleans up after animation completes
 * - Non-interactive visual effect (pointer-events-none)
 */
const EmojiBurst: React.FC<EmojiBurstProps> = ({ isActive, position, onComplete }) => {
  const [emojis, setEmojis] = useState<FlyingEmoji[]>([]);

  useEffect(() => {
    if (!isActive) return;

    // Create burst of emojis
    const newEmojis: FlyingEmoji[] = [];
    const emojiVariants = ['👍', '👍🏻', '👍🏽', '👍🏿'];

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const speed = 3 + Math.random() * 4;

      newEmojis.push({
        id: i,
        emoji: emojiVariants[Math.floor(Math.random() * emojiVariants.length)],
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
    const duration = 2000; // 2 seconds

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
  }, [isActive, position, onComplete]);

  if (!isActive || emojis.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50" aria-hidden="true" role="presentation">
      {emojis.map((emoji) => (
        <div
          key={emoji.id}
          className="absolute text-2xl select-none"
          style={{
            left: emoji.x - 12,
            top: emoji.y - 12,
            transform: `rotate(${emoji.rotation}deg) scale(${emoji.scale})`,
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

export default EmojiBurst;
