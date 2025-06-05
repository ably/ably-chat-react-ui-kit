import React from 'react';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

/**
 * Props for the MessageActions component
 */
interface MessageActionsProps {
  /** Callback function when the reaction button is clicked */
  onReaction: () => void;
  /** Callback function when the edit button is clicked */
  onEdit: () => void;
  /** Callback function when the delete button is clicked */
  onDelete: () => void;
  /** Whether the action buttons should be visible */
  isVisible: boolean;
  /** Whether the message belongs to the current user (determines if edit/delete are shown) */
  isOwn: boolean;
}

/**
 * MessageActions component displays a toolbar of action buttons for a chat message
 *
 * Features:
 * - Reaction button for adding emoji reactions to messages
 * - Edit and delete buttons for the message owner
 * - Positioned relative to the message bubble
 * - Conditionally rendered based on hover state
 */
const MessageActions: React.FC<MessageActionsProps> = ({
  onReaction,
  onEdit,
  onDelete,
  isVisible,
  isOwn,
}) => {
  if (!isVisible) return null;

  return (
    <div
      className="message-actions flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-md p-1"
      role="toolbar"
      aria-label="Message actions"
    >
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        onClick={onReaction}
        aria-label="Add reaction"
      >
        <span className="text-sm" aria-hidden="true">
          😊
        </span>
      </Button>

      {isOwn && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={onEdit}
            aria-label="Edit message"
          >
            <Icon name="edit" size="sm" aria-hidden="true" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
            onClick={onDelete}
            aria-label="Delete message"
          >
            <Icon name="delete" size="sm" aria-hidden="true" />
          </Button>
        </>
      )}
    </div>
  );
};

export default MessageActions;
