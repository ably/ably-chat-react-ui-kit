import React from 'react';

/**
 * Props for the ChatWindowHeader component
 */
interface ChatWindowHeaderProps {
  /** Content to display in the header */
  children?: React.ReactNode;
}

/**
 * ChatWindowHeader component provides the header layout for the chat window
 *
 * Features:
 * - Consistent header styling and layout
 * - Proper border and background theming
 * - Conditionally renders based on whether children are provided
 */
const ChatWindowHeader: React.FC<ChatWindowHeaderProps> = ({ children }) => {
  // Don't render anything if no children are provided
  if (!children) {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      {children}
    </div>
  );
};

export default ChatWindowHeader;
