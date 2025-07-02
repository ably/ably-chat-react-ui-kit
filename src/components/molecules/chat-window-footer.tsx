import { clsx } from 'clsx';
import React from 'react';

/**
 * Props for the ChatWindowFooter component
 */
export interface ChatWindowFooterProps {
  /** Content to display in the footer */
  children?: React.ReactNode;
  /** Additional CSS classes to apply to the footer container */
  className?: string;
  /** Optional ARIA label for the footer */
  'aria-label'?: string;
}

/**
 * ChatWindowFooter component provides the footer layout for the chat window
 * Features:
 * - Consistent footer styling with dark mode support
 * - Conditionally renders based on children
 * - Positioned at the bottom of the chat area
 *
 * @example
 * // Basic usage with message input
 * <ChatWindowFooter>
 *   <MessageInput onSend={handleSend} />
 * </ChatWindowFooter>
 *
 * @example
 * // With custom styling
 * <ChatWindowFooter className="p-6">
 *   <CustomFooterContent />
 * </ChatWindowFooter>
 */
export const ChatWindowFooter = ({
  children,
  className,
  'aria-label': ariaLabel,
}: ChatWindowFooterProps) => {
  return (
    <div
      className={clsx(
        // Layout
        'flex items-center',
        // Theme and borders
        'bg-white dark:bg-gray-900',
        'border-t border-gray-200 dark:border-gray-700',
        // Custom classes
        className
      )}
      role="contentinfo"
      aria-label={ariaLabel || 'Chat window footer'}
    >
      {children}
    </div>
  );
};

ChatWindowFooter.displayName = 'ChatWindowFooter';
