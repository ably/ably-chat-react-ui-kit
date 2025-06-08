import React from 'react';
import clsx from 'clsx';

/**
 * Position options for tooltip arrow placement
 */
type TooltipArrowPosition = 'above' | 'below';

/**
 * Props for the TooltipArrow component
 */
interface TooltipArrowProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Position of the arrow relative to the tooltip
   * - 'above': Arrow points downward (tooltip is above trigger)
   * - 'below': Arrow points upward (tooltip is below trigger)
   */
  position: TooltipArrowPosition;

  /**
   * Additional CSS classes to apply to the arrow element
   */
  className?: string;

  /**
   * Size of the arrow
   * @default 'md' - 4px border width
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Color variant to match the tooltip surface
   * @default 'dark' - matches dark tooltip background
   */
  variant?: 'dark' | 'light';
}

/**
 * TooltipArrow component renders a triangular arrow that points from tooltip to its trigger
 *
 * This component is designed to be used in conjunction with TooltipSurface to create
 * a complete tooltip with visual connection to its trigger element.
 *
 * Features:
 * - Automatic color matching with tooltip variants
 * - Customizable arrow sizes
 * - Proper positioning for above/below tooltips
 * - CSS borders-based triangle for sharp edges
 *
 * @example
 * // Basic usage with dark tooltip
 * <TooltipArrow position="above" />
 *
 * @example
 * // Light variant arrow for light tooltips
 * <TooltipArrow position="below" variant="light" />
 *
 * @example
 * // Large arrow with custom styling
 * <TooltipArrow
 *   position="above"
 *   size="lg"
 *   className="ml-2"
 * />
 */
const TooltipArrow: React.FC<TooltipArrowProps> = ({
  position,
  className,
  size = 'md',
  variant = 'dark',
  ...rest
}) => {
  // Size configurations for arrow border widths
  const sizeClasses = {
    sm: 'border-l-2 border-r-2',
    md: 'border-l-4 border-r-4',
    lg: 'border-l-6 border-r-6',
  };

  // Arrow border configurations for each size
  const arrowBorders = {
    sm: {
      above: 'border-t-2',
      below: 'border-b-2',
    },
    md: {
      above: 'border-t-4',
      below: 'border-b-4',
    },
    lg: {
      above: 'border-t-6',
      below: 'border-b-6',
    },
  };

  // Color variants to match tooltip surfaces
  const variantColors = {
    dark: {
      above: 'border-t-gray-900 dark:border-t-gray-700',
      below: 'border-b-gray-900 dark:border-b-gray-700',
    },
    light: {
      above: 'border-t-white dark:border-t-gray-100',
      below: 'border-b-white dark:border-b-gray-100',
    },
  };

  return (
    <div
      className={clsx(
        // Base arrow positioning
        'absolute left-1/2 transform -translate-x-1/2 w-0 h-0',
        // Transparent side borders for triangle shape
        'border-transparent',
        // Size-specific border widths
        sizeClasses[size],
        // Position-specific placement
        position === 'above' ? 'top-full' : 'bottom-full',
        // Arrow direction and color
        arrowBorders[size][position],
        variantColors[variant][position],
        // Custom classes
        className
      )}
      aria-hidden="true"
      {...rest}
    />
  );
};

export default TooltipArrow;
