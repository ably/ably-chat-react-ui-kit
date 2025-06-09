import React from 'react';

/**
 * Props for the ChatWindowFooter component
 */
export interface ChatWindowFooterProps {
  /** Content to display in the footer */
  children?: React.ReactNode;
}

/**
 * ChatWindowFooter component provides the footer layout for the chat window
 *
 * Features:
 * - Consistent footer styling and layout
 * - Proper border and background theming
 * - Conditionally renders based on whether children are provided
 * - Positioned at the bottom of the chat area
 */
export const ChatWindowFooter: React.FC<ChatWindowFooterProps> = ({ children }) => {
  // Don't render anything if no children are provided
  if (!children) {
    return null;
  }
  return (
    <div className="flex items-center bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      {children}
    </div>
  );
};
