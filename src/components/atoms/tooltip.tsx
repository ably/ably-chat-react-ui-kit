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
   * @default 'xs' (20rem)
   */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg';

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
   * @default '50'
   */
  zIndex?: '10' | '50' | '100';
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
 *   maxWidth="sm"
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
  maxWidth = 'xs',
  wrap = 'wrap',
  variant = 'dark',
  size = 'md',
  showArrow = true,
  zIndex = '50',
  spacing = 'default',
  role = 'tooltip',
  'aria-hidden': ariaHidden,
  ...rest
}: TooltipProps) => {
  // Build tooltip classes
  const isFixed = className?.includes('fixed');
  const tooltipClasses = clsx(
    !isFixed && 'ably-tooltip',
    'ably-tooltip--' + size,
    'ably-tooltip--' + variant,
    'ably-tooltip--' + position,
    'ably-tooltip--spacing-' + spacing,
    'ably-tooltip--' + wrap,
    'ably-tooltip--max-w-' + maxWidth,
    'ably-tooltip--z-' + zIndex,
    className
  );

  return (
    <div
      className={tooltipClasses}
      role={role}
      aria-hidden={ariaHidden}
      {...rest}
    >
      {children}

      {/* Arrow */}
      {showArrow && (
        <div
          className={clsx(
            'ably-tooltip__arrow',
            'ably-tooltip__arrow--' + position,
            'ably-tooltip__arrow--' + size,
            'ably-tooltip__arrow--' + variant
          )}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
