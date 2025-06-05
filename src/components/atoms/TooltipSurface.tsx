import React from 'react';
import clsx from 'clsx';

/**
 * Position options for tooltip placement relative to its trigger element
 */
type TooltipPosition = 'above' | 'below';

/**
 * Props for the TooltipSurface component
 */
interface TooltipSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
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
   * Additional CSS classes to apply to the tooltip surface
   */
  className?: string;
  
  /**
   * Maximum width constraint for the tooltip
   * @default 'max-w-xs' (20rem)
   */
  maxWidth?: string;
  
  /**
   * Background color variant for the tooltip
   * @default 'dark' - dark background with light text
   */
  variant?: 'dark' | 'light';
  
  /**
   * Z-index for tooltip layering
   * @default 'z-50'
   */
  zIndex?: string;
}

/**
 * TooltipSurface component renders a positioned tooltip with customizable styling
 * 
 * Features:
 * - Automatic positioning (above/below trigger)
 * - Dark and light theme variants
 * - Responsive sizing with max-width constraints
 * - Proper accessibility attributes
 * - Smooth animations and shadows
 * 
 * @example
 * // Basic usage
 * <TooltipSurface position="above">
 *   This is a tooltip
 * </TooltipSurface>
 * 
 * @example
 * // Light variant with custom styling
 * <TooltipSurface 
 *   position="below" 
 *   variant="light"
 *   maxWidth="max-w-sm"
 * >
 *   <span>Custom tooltip content</span>
 * </TooltipSurface>
 * 
 * @example
 * // With custom z-index for layering
 * <TooltipSurface position="above" zIndex="z-[60]">
 *   High priority tooltip
 * </TooltipSurface>
 */
export const TooltipSurface: React.FC<TooltipSurfaceProps> = ({
  position,
  className,
  children,
  maxWidth = 'max-w-xs',
  variant = 'dark',
  zIndex = 'z-50',
  role = 'tooltip',
  'aria-hidden': ariaHidden,
  ...rest
}) => {
  // Variant-specific styling
  const variantClasses = {
    dark: 'bg-gray-900 dark:bg-gray-700 text-white',
    light: 'bg-white dark:bg-gray-100 text-gray-900 dark:text-gray-800 border border-gray-200 dark:border-gray-300'
  };

  // Position-specific classes
  const positionClasses = {
    above: 'bottom-full mb-2',
    below: 'top-full mt-2'
  };

  return (
    <div
      className={clsx(
        // Base positioning and layout
        'absolute left-1/2 transform -translate-x-1/2 px-3 py-2',
        // Styling and appearance
        'text-sm rounded-lg shadow-lg whitespace-nowrap',
        // Responsive sizing
        maxWidth,
        // Layering
        zIndex,
        // Variant styling
        variantClasses[variant],
        // Position-specific classes
        positionClasses[position],
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
    </div>
  );
};