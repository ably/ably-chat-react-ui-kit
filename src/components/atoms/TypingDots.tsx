import React from 'react';
import clsx from 'clsx';

/**
 * Props for the TypingDots component
 */
interface TypingDotsProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Tailwind size utility classes for each dot
   * @default 'w-1.5 h-1.5'
   * @example 'w-2 h-2' for larger dots
   */
  dotSizeClassName?: string;

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
   * Color of the dots - uses CSS currentColor by default
   * @default 'bg-current' (inherits text color)
   */
  dotColor?: string;
}

/**
 * Animation delays for each of the three dots to create a wave effect
 */
const ANIMATION_DELAYS = ['0ms', '200ms', '400ms'] as const;

/**
 * TypingDots component displays an animated three-dot indicator commonly used to show typing activity
 *
 * Features:
 * - Three dots with staggered bounce animation
 * - Customizable size, color, and animation timing
 * - Accessible with proper ARIA labels
 * - Responsive and theme-aware
 *
 * @example
 * // Basic usage
 * <TypingDots />
 *
 * @example
 * // Custom styling
 * <TypingDots
 *   dotSizeClassName="w-2 h-2"
 *   dotColor="bg-blue-500"
 *   className="gap-1"
 * />
 *
 * @example
 * // With custom animation
 * <TypingDots animationDuration="0.8s" />
 */
const TypingDots: React.FC<TypingDotsProps> = ({
  dotSizeClassName = 'w-1.5 h-1.5',
  className,
  dotClassName,
  animationDuration = '1s',
  dotColor = 'bg-current',
  'aria-label': ariaLabel = 'Typing indicator',
  ...rest
}) => (
  <div
    className={clsx('flex gap-0.5', className)}
    role="status"
    aria-label={ariaLabel}
    aria-live="polite"
    {...rest}
  >
    {ANIMATION_DELAYS.map((delay, index) => (
      <div
        key={delay}
        className={clsx(dotSizeClassName, 'rounded-full animate-bounce', dotColor, dotClassName)}
        style={{
          animationDelay: delay,
          animationDuration,
          // Ensure animation doesn't interfere with reduced motion preferences
          ...(typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches && {
              animation: 'none',
              opacity: 0.7,
            }),
        }}
        aria-hidden="true"
      />
    ))}
  </div>
);

export default TypingDots;
