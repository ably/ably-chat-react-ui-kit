import { clsx } from 'clsx';
import React from 'react';

/**
 * Available icon names in the icon library
 */
type IconName =
  | 'send'
  | 'info'
  | 'moon'
  | 'sun'
  | 'phone'
  | 'video'
  | 'more'
  | 'attachment'
  | 'emoji'
  | 'thumbsup'
  | 'edit'
  | 'delete'
  | 'close'
  | 'chevronleft'
  | 'chevronright'
  | 'upload';

/**
 * Size options for icons
 */
type IconSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Props for the Icon component
 */
export interface IconProps {
  /**
   * Name of the icon to display
   * Must be one of the predefined icon names in the icon library
   */
  name: IconName;

  /**
   * Size of the icon
   * - 'sm': 16px (w-4 h-4)
   * - 'md': 20px (w-5 h-5) - default
   * - 'lg': 24px (w-6 h-6)
   * - 'xl': 32px (w-8 h-8)
   * @default 'md'
   */
  size?: IconSize;

  /**
   * Additional CSS classes to apply to the icon
   */
  className?: string;

  /**
   * Accessible label for the icon
   * Required for interactive icons, optional for decorative icons
   */
  'aria-label'?: string;

  /**
   * Whether the icon is decorative only (hidden from screen readers)
   * @default false
   */
  'aria-hidden'?: boolean;

  /**
   * Color variant for the icon
   * @default 'current' - inherits current text color
   */
  color?: 'current' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';

  /**
   * Click handler for interactive icons
   */
  onClick?: (event: React.MouseEvent<SVGSVGElement> | React.KeyboardEvent<SVGSVGElement>) => void;

  /**
   * Additional props to pass to the SVG element
   */
  svgProps?: React.SVGAttributes<SVGSVGElement>;
}

/**
 * Icon component renders SVG icons from a predefined icon library
 *
 * Features:
 * - Predefined icon library with common UI icons
 * - Multiple size options (sm, md, lg, xl)
 * - Accessibility support with proper ARIA attributes
 * - Interactive support with click handlers and keyboard navigation
 * - Consistent stroke-based design

 *
 * @example
 * // Basic usage
 * <Icon name="send" />
 *
 * @example
 * // Large icon with custom color
 * <Icon
 *   name="heart"
 *   size="lg"
 *   color="error"
 *   aria-label="Like this post"
 * />
 *
 * @example
 * // Interactive icon with click handler
 * <Icon
 *   name="close"
 *   onClick={() => setModalOpen(false)}
 *   aria-label="Close modal"
 *   className="cursor-pointer hover:text-red-500"
 * />
 *
 * @example
 * // Decorative icon (hidden from screen readers)
 * <Icon name="star" aria-hidden />
 */
export const Icon = ({
  name,
  size = 'md',
  className = '',
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden = false,
  color = 'current',
  onClick,
  svgProps,
}: IconProps) => {
  // Size class mappings
  const sizeClasses: Record<IconSize, string> = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  // Color class mappings
  const colorClasses = {
    current: 'text-current',
    primary: 'text-blue-600 dark:text-blue-400',
    secondary: 'text-gray-600 dark:text-gray-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400',
  };

  /**
   * SVG path definitions for each icon
   * All icons are designed for a 24x24 viewBox with stroke-based rendering
   */
  const iconPaths: Record<IconName, string> = {
    send: 'M12 19l9-7-9-7v4l-9 3 9 3v4z',
    info: 'M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z',
    moon: 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z',
    sun: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
    phone:
      'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
    video:
      'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    more: 'M12 5v.01M12 12v.01M12 19v.01',
    attachment:
      'M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13',
    emoji:
      'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01',
    thumbsup:
      'M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5',
    edit: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
    delete:
      'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    close: 'M6 18L18 6M6 6l12 12',
    chevronleft: 'M15 18l-6-6 6-6',
    chevronright: 'M9 18l6-6-6-6',
    upload: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
  };

  // Get the path for the requested icon
  const iconPath = iconPaths[name];

  // Handle missing icons gracefully
  if (!iconPath) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `Icon "${name}" not found. Available icons: ${Object.keys(iconPaths).join(', ')}`
      );
    }

    return (
      <div
        className={`${sizeClasses[size]} ${className} flex items-center justify-center bg-gray-200 rounded text-gray-500 text-xs`}
        title={`Missing icon: ${name}`}
        aria-label={ariaLabel || `Missing icon: ${name}`}
        role="img"
      >
        ?
      </div>
    );
  }
  // Determine accessibility attributes
  const isInteractive = !!onClick;
  const shouldHideFromScreenReader = ariaHidden || (!ariaLabel && !isInteractive);

  return (
    <svg
      className={clsx(
        sizeClasses[size],
        isInteractive && 'cursor-pointer',
        colorClasses[color],
        className
      )}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={ariaLabel}
      aria-hidden={shouldHideFromScreenReader}
      onClick={onClick}
      role={isInteractive ? 'button' : 'img'}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e);
              }
            }
          : undefined
      }
      {...svgProps}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
    </svg>
  );
};
