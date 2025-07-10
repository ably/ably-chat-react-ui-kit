import { clsx } from 'clsx';
import React from 'react';

/**
 * Props for the ChatWindowHeader component
 */
export interface ChatWindowHeaderProps {
  /** Content to be rendered within the header */
  children?: React.ReactNode;
  /** Additional CSS classes to apply to the header container */
  className?: string;
  /** Optional ARIA label for the header */
  'aria-label'?: string;
}

/**
 * ChatWindowHeader component provides a consistent header area for chat windows
 *
 * Features:
 * - Flexible content slot for custom header components
 * - Consistent styling with dark mode support
 * - Accessible design with proper semantic structure
 * - Fixed positioning to maintain header visibility during scroll
 *
 * @example
 * // Basic usage with room info
 * <ChatWindowHeader>
 *   <RoomInfo roomName="general" />
 * </ChatWindowHeader>
 *
 * @example
 * // With custom content and styling
 * <ChatWindowHeader
 *   className="bg-blue-100"
 *   aria-label="Chat room header for general discussion"
 * >
 *   <div>
 *     <h2>General Discussion</h2>
 *     <span>5 participants online</span>
 *   </div>
 * </ChatWindowHeader>
 *
 * @example
 * // Empty header (spacer only)
 * <ChatWindowHeader />
 */
export const ChatWindowHeader = ({
  children,
  className = '',
  'aria-label': ariaLabel,
}: ChatWindowHeaderProps) => {
  // Combine base classes with custom className
  return (
    <div
      className={clsx(
        // Layout
        'px-6 py-4',
        // Borders and theme
        'border-b border-gray-200 dark:border-gray-700',
        'bg-white dark:bg-gray-900',
        // Custom classes
        className
      )}
      role="banner"
      aria-label={ariaLabel || 'Chat window header'}
    >
      {children}
    </div>
  );
};

ChatWindowHeader.displayName = 'ChatWindowHeader';
