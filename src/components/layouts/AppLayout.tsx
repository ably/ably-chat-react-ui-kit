import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import clsx from 'clsx';

/**
 * Props for the AppLayout component
 */
export interface AppLayoutProps {
  /** Sidebar content */
  sidebar?: ReactNode;
  /** Main content area */
  children: ReactNode;
  /** Width of the entire app container */
  width?: string | number;
  /** Height of the entire app container */
  height?: string | number;
  /** Width of the sidebar when expanded */
  sidebarWidth?: string | number;
  /** Width of the sidebar when collapsed */
  collapsedSidebarWidth?: string | number;
  /** Initial collapsed state */
  initialSidebarCollapsed?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** ARIA label for the layout container */
  'aria-label'?: string;
  /** ARIA role for the layout container */
  role?: string;
  /** Callback when sidebar collapse state changes */
  onSidebarCollapseChange?: (isCollapsed: boolean) => void;
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
  ({
    sidebar,
    children,
    width = '70vw',
    height = '70vh',
    sidebarWidth = '20rem',
    collapsedSidebarWidth = '4rem',
    initialSidebarCollapsed = false,
    className = '',
    'aria-label': ariaLabel,
    role = 'main',
    onSidebarCollapseChange,
  }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(initialSidebarCollapsed);

    const handleToggleSidebar = useCallback(() => {
      const newCollapsed = !isSidebarCollapsed;
      setIsSidebarCollapsed(newCollapsed);
      onSidebarCollapseChange?.(newCollapsed);
    }, [isSidebarCollapsed, onSidebarCollapseChange]);

    // Memoize the container style
    const containerStyle = useMemo(
      () => ({
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }),
      [width, height]
    );

    // Memoize the sidebar style
    const sidebarStyle = useMemo(
      () => ({
        width: isSidebarCollapsed
          ? typeof collapsedSidebarWidth === 'number'
            ? `${collapsedSidebarWidth}px`
            : collapsedSidebarWidth
          : typeof sidebarWidth === 'number'
            ? `${sidebarWidth}px`
            : sidebarWidth,
        transition: 'width 0.3s ease-in-out',
      }),
      [isSidebarCollapsed, sidebarWidth, collapsedSidebarWidth]
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
        {/* Sidebar */}
        {sidebar && (
          <div style={sidebarStyle} className="flex-shrink-0">
            {React.cloneElement(sidebar as React.ReactElement, {
              isCollapsed: isSidebarCollapsed,
              onToggleCollapse: handleToggleSidebar,
            })}
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    );
  }
);

AppLayout.displayName = 'AppLayout';
