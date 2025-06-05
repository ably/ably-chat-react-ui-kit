import React from 'react';

/**
 * Props for the ChatWindowFooter component
 */
interface ChatWindowFooterProps {
  /** Content to display in the footer */
  children: React.ReactNode;
}

/**
 * ChatWindowFooter component provides the footer layout for the chat window
 *
 * Features:
 * - Consistent footer styling and layout
 * - Accepts children for flexible content composition
 * - Proper border and background theming
 * - Positioned at the bottom of the chat area
 * - Flex layout for message input and additional controls
 */
const ChatWindowFooter: React.FC<ChatWindowFooterProps> = ({ children }) => {
  return (
    <div className="flex items-center bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      {children}
    </div>
  );
};

export default ChatWindowFooter; 