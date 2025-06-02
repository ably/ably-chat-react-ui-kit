import React, { useEffect, useState } from 'react';

interface EmojiBurstProps {
  isActive: boolean;
  position: { x: number; y: number };
  onComplete: () => void;
}

interface FlyingEmoji {
  id: number;
  emoji: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  scale: number;
}

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
    let startTime = Date.now();
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
    <div className="fixed inset-0 pointer-events-none z-50">
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
        >
          {emoji.emoji}
        </div>
      ))}
    </div>
  );
};

export default EmojiBurst;
