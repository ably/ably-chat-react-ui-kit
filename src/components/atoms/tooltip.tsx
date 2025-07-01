import { clsx } from 'clsx';
import React from 'react';

/**
 * Position options for tooltip placement
 */
type TooltipPosition = 'above' | 'below';

/**
 * Props for the Tooltip component
 */
export interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Position of the tooltip relative to its trigger element
   * - 'above': Tooltip appears above the trigger
   * - 'below': Tooltip appears below the trigger
   */
  position: TooltipPosition;

  /**
   * Tooltip content - can be text or React elements
   */
  children: React.ReactNode;

  /**
   * Additional CSS classes to apply to the tooltip
   */
  className?: string;

  /**
   * Maximum width constraint for the tooltip
   * @default 'max-w-xs' (20rem)
   */
  maxWidth?: string;

  /**
   * Text wrapping behavior for tooltip content
   * @default 'wrap' - allows text to wrap within the tooltip
   */
  wrap?: 'wrap' | 'nowrap' | 'truncate';

  /**
   * Background color variant for the tooltip
   * @default 'dark' - dark background with light text
   */
  variant?: 'dark' | 'light';

  /**
   * Size of the tooltip and arrow
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether to show the pointing arrow
   * @default true
   */
  showArrow?: boolean;

  /**
   * Spacing from the trigger element
   * Set to 'none' when using fixed positioning with custom styles
   * @default 'default' - adds standard spacing (8px)
   */
  spacing?: 'none' | 'sm' | 'default' | 'lg';

  /**
   * Z-index for tooltip layering
   * @default 'z-50'
   */
  zIndex?: string;
}

/**
 * Tooltip component renders a complete tooltip with surface and optional arrow
 *
 * Features:
 * - Automatic positioning above or below trigger element
 * - Dark and light theme variants with matching arrows
 * - Multiple sizes with coordinated surface and arrow sizing
 * - Responsive sizing with max-width constraints
 * - Optional arrow with perfect color matching
 *
 * @example
 * // Basic usage
 * <Tooltip position="above">
 *   This is a tooltip
 * </Tooltip>
 *
 * @example
 * // Light variant with large size
 * <Tooltip
 *   position="below"
 *   variant="light"
 *   size="lg"
 *   maxWidth="max-w-sm"
 * >
 *   Custom tooltip content
 * </Tooltip>
 *
 * @example
 * // Without arrow
 * <Tooltip position="above" showArrow={false}>
 *   Simple tooltip without arrow
 * </Tooltip>
 */
export const Tooltip = ({
  position,
  children,
  className,
  maxWidth = 'max-w-xs',
  wrap = 'wrap',
  variant = 'dark',
  size = 'md',
  showArrow = true,
  zIndex = 'z-50',
  spacing = 'default',
  role = 'tooltip',
  'aria-hidden': ariaHidden,
  ...rest
}: TooltipProps) => {
  // Size configurations
  const sizeClasses = {
    sm: {
      surface: 'px-2 py-1 text-xs',
      arrow: {
        border: 'border-l-2 border-r-2',
        directional: { above: 'border-t-2', below: 'border-b-2' },
      },
    },
    md: {
      surface: 'px-3 py-2 text-sm',
      arrow: {
        border: 'border-l-4 border-r-4',
        directional: { above: 'border-t-4', below: 'border-b-4' },
      },
    },
    lg: {
      surface: 'px-4 py-3 text-base',
      arrow: {
        border: 'border-l-6 border-r-6',
        directional: { above: 'border-t-6', below: 'border-b-6' },
      },
    },
  };

  // Variant-specific styling
  const variantClasses = {
    dark: {
      surface: 'bg-gray-900 dark:bg-gray-700 text-white',
      arrow: {
        above: 'border-t-gray-900 dark:border-t-gray-700',
        below: 'border-b-gray-900 dark:border-b-gray-700',
      },
    },
    light: {
      surface:
        'bg-white dark:bg-gray-100 text-gray-900 dark:text-gray-800 border border-gray-200 dark:border-gray-300',
      arrow: {
        above: 'border-t-white dark:border-t-gray-100',
        below: 'border-b-white dark:border-b-gray-100',
      },
    },
  };

  // Position-specific classes
  const positionClasses = {
    above: 'bottom-full mb-2',
    below: 'top-full mt-2',
  };

  const wrapClasses = {
    wrap: 'whitespace-normal',
    nowrap: 'whitespace-nowrap',
    truncate: 'whitespace-nowrap overflow-hidden text-ellipsis',
  };

  const spacingClasses = {
    none: { above: 'bottom-full', below: 'top-full' },
    sm: { above: 'bottom-full mb-1', below: 'top-full mt-1' },
    default: { above: 'bottom-full mb-2', below: 'top-full mt-2' },
    lg: { above: 'bottom-full mb-4', below: 'top-full mt-4' },
  };

  return (
    <div
      className={clsx(
        // Base positioning and layout - only apply if not using fixed positioning
        !className?.includes('fixed') && 'absolute left-1/2 transform -translate-x-1/2',
        // Styling and appearance
        'rounded-lg shadow-lg',
        // Responsive sizing
        maxWidth,
        // Layering
        zIndex,
        // Position-specific classes with spacing - only apply if not using fixed positioning
        !className?.includes('fixed') && spacingClasses[spacing][position],
        // Size-specific padding and text
        sizeClasses[size].surface,
        // Text wrapping behavior
        wrapClasses[wrap],
        // Variant styling
        variantClasses[variant].surface,
        // Position-specific classes - only apply if not using fixed positioning
        !className?.includes('fixed') && positionClasses[position],
        // Animation and transitions
        'transition-opacity duration-200 ease-in-out',
        // Custom classes
        className
      )}
      role={role}
      aria-hidden={ariaHidden}
      {...rest}
    >
      {children}

      {/* Arrow */}
      {showArrow && (
        <div
          className={clsx(
            // Base arrow positioning - always centered on tooltip
            'absolute left-1/2 transform -translate-x-1/2 w-0 h-0',
            // Position relative to tooltip surface
            position === 'above' ? 'top-full' : 'bottom-full',
            // Transparent side borders for triangle shape
            'border-transparent',
            // Size-specific border widths
            sizeClasses[size].arrow.border,
            // Direction-specific border
            sizeClasses[size].arrow.directional[position],
            // Background color to match tooltip surface
            variantClasses[variant].arrow[position]
          )}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
