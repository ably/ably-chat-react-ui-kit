import React from 'react';

/**
 * Props for the ChatWindowHeader component
 */
interface ChatWindowHeaderProps {
  /** Content to display in the header */
  children: React.ReactNode;
}

/**
 * ChatWindowHeader component provides the header layout for the chat window
 *
 * Features:
 * - Consistent header styling and layout
 * - Accepts children for flexible content composition
 * - Proper border and background theming
 * - Positioned at the top of the chat area
 */
const ChatWindowHeader: React.FC<ChatWindowHeaderProps> = ({ children }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      {children}
    </div>
  );
};

export default ChatWindowHeader; 