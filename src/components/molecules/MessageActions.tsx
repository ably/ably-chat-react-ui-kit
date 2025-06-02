import React from 'react';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

interface MessageActionsProps {
  onReaction: (event: React.MouseEvent) => void;
  onEdit: () => void;
  onDelete: () => void;
  isVisible: boolean;
  isOwn: boolean;
}

const MessageActions: React.FC<MessageActionsProps> = ({
  onReaction,
  onEdit,
  onDelete,
  isVisible,
  isOwn,
}) => {
  if (!isVisible) return null;

  return (
    <div className="message-actions flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-md p-1">
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        onClick={onReaction}
      >
        <span className="text-sm">😊</span>
      </Button>

      {isOwn && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={onEdit}
          >
            <Icon name="edit" size="sm" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
            onClick={onDelete}
          >
            <Icon name="delete" size="sm" />
          </Button>
        </>
      )}
    </div>
  );
};

export default MessageActions;
