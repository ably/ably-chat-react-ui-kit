import { clsx } from 'clsx';
import React from 'react';

/**
 * Props for the TypingDots component
 */
export interface TypingDotsProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Size of the dots
   * @default 'default'
   */
  size?: 'sm' | 'default' | 'md' | 'lg';

  /**
   * Custom classes for the container div that wraps all dots
   */
  className?: string;

  /**
   * Custom classes applied to each individual dot
   */
  dotClassName?: string;

  /**
   * Animation duration for the bounce effect
   * @default '1s'
   */
  animationDuration?: string;

  /**
   * Color of the dots
   * @default 'current' (inherits text color)
   */
  dotColor?: 'current' | 'blue' | 'gray' | 'green';

  /**
   * Gap between dots
   * @default 'tight'
   */
  gap?: 'tight' | 'normal' | 'wide';
}

/**
 * Animation delays for each of the three dots to create a wave effect
 */
const ANIMATION_DELAYS = ['0ms', '200ms', '400ms'];

/**
 * TypingDots component displays an animated three-dot indicator commonly used to show typing activity
 *
 * Features:
 * - Three dots with staggered bounce animation
 * - Customizable size, color, and animation timing
 * - Respects reduced motion preferences
 * - Basic ARIA support (role, aria-label, aria-live)
 *
 * @example
 * // Basic usage
 * <TypingDots />
 *
 * @example
 * // Custom styling
 * <TypingDots
 *   size="md"
 *   dotColor="blue"
 *   gap="normal"
 * />
 *
 * @example
 * // With custom animation
 * <TypingDots animationDuration="0.8s" />
 */
export const TypingDots = ({
  size = 'default',
  className,
  dotClassName,
  animationDuration = '1s',
  dotColor = 'current',
  gap = 'tight',
  ...rest
}: TypingDotsProps) => {
  const containerClasses = clsx('ably-typing-dots', `ably-typing-dots--gap-${gap}`, className);

  const dotClasses = clsx(
    'ably-typing-dots__dot',
    `ably-typing-dots__dot--${size}`,
    `ably-typing-dots__dot--${dotColor}`,
    dotClassName
  );

  return (
    <div className={containerClasses} {...rest}>
      {ANIMATION_DELAYS.map((delay) => (
        <div
          key={delay}
          className={dotClasses}
          style={{
            animationDelay: delay,
            animationDuration,
          }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
};
