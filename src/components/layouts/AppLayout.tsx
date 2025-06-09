import React, { ReactNode, useMemo } from 'react';
import clsx from 'clsx';

/**
 * Props for the AppLayout component
 */
export interface AppLayoutProps {
  /**
   * Content to be rendered within the layout container
   */
  children: ReactNode;

  /**
   * Width of the layout container
   * - String values (e.g., "100%", "50vw") for relative sizing
   * - Number values for pixel dimensions
   * @default "50vw"
   */
  width?: string | number;

  /**
   * Height of the layout container
   * - String values (e.g., "100%", "50vh") for relative sizing
   * - Number values for pixel dimensions
   * @default "50vh"
   */
  height?: string | number;

  /**
   * Additional CSS classes to apply to the layout container
   */
  className?: string;

  /**
   * Optional ARIA label for the layout container
   */
  'aria-label'?: string;

  /**
   * Optional ARIA role for the layout container
   * @default "main"
   */
  role?: string;
}

/**
 * AppLayout component provides a styled container layout for the entire application
 *
 * Features:
 * - Customizable dimensions with responsive defaults
 * - Dark mode support with automatic theme switching
 * - Memoized for performance optimization
 * - Basic ARIA support (role, aria-label)
 * - Consistent styling with shadows and borders
 * - Uses standard gray color palette for theming
 * - Rounded corners with consistent border radius
 * - Drop shadow for visual elevation
 * - Responsive spacing with viewport-based defaults
 *
 *
 * TODO: Add support for:
 * - Breakpoint-specific sizing
 * - Custom theme variants beyond dark/light
 * - Animation transitions for theme switching
 * - Error boundary integration
 *
 * @example
 * // Basic usage with default dimensions
 * <AppLayout>
 *   <YourAppContent />
 * </AppLayout>
 *
 * @example
 * // Custom dimensions
 * <AppLayout width="800px" height="600px">
 *   <YourAppContent />
 * </AppLayout>
 *
 * @example
 * // Responsive with custom styling
 * <AppLayout
 *   width="90vw"
 *   height="90vh"
 *   className="max-w-6xl"
 *   aria-label="Chat application interface"
 * >
 *   <YourAppContent />
 * </AppLayout>
 */
export const AppLayout = React.memo<AppLayoutProps>(
  ({ children, width, height, className = '', 'aria-label': ariaLabel, role = 'main' }) => {
    const layoutWidth = width ?? '50vw';
    const layoutHeight = height ?? '50vh';

    // Memoize the style object to prevent unnecessary re-renders
    const containerStyle = useMemo(
      () => ({
        width: typeof layoutWidth === 'number' ? `${layoutWidth}px` : layoutWidth,
        height: typeof layoutHeight === 'number' ? `${layoutHeight}px` : layoutHeight,
      }),
      [layoutWidth, layoutHeight]
    );

    return (
      <div
        className={clsx(
          // Layout fundamentals
          'flex',
          // Theme and colors
          'bg-gray-50 dark:bg-gray-950',
          'text-gray-900 dark:text-gray-100',
          // Positioning and overflow
          'overflow-hidden',
          // Visual styling
          'border border-gray-200 dark:border-gray-700',
          'rounded-lg shadow-lg',
          // Centering
          'mx-auto my-8',
          // Custom classes
          className
        )}
        style={containerStyle}
        role={role}
        aria-label={ariaLabel}
      >
        {children}
      </div>
    );
  }
);

// Set display name for better debugging experience
AppLayout.displayName = 'AppLayout';
