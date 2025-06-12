import React from 'react';

import { Button } from '../atoms/button.tsx';
import { Icon } from '../atoms/icon.tsx';

/**
 * Props for the MessageActions component
 */
export interface MessageActionsProps {
  /**
   * Callback function triggered when the reaction button is clicked.
   * Typically opens an emoji picker or emoji wheel for users to select reactions.
   * Should handle the display of reaction UI components.
   *
   *
   * @example
   * ```tsx
   * onReaction={() => {
   *   setEmojiPickerPosition(getMessagePosition());
   *   setShowEmojiPicker(true);
   * }}
   * ```
   */
  onReaction?: () => void;

  /**
   * Callback function triggered when the edit button is clicked.
   * Should initiate edit mode for the message, typically replacing the message
   * content with an editable input field or editor component.
   * Only displayed when isOwn is true.
   *
   *
   * @example
   * ```tsx
   * onEdit={() => {
   *   setEditingMessageId(message.id);
   *   setEditText(message.text);
   *   setIsEditing(true);
   * }}
   * ```
   */
  onEdit?: () => void;

  /**
   * Callback function triggered when the delete button is clicked.
   * Should handle message deletion, typically with confirmation dialog.
   * Only displayed when isOwn is true.
   *
   *
   * @example
   * ```tsx
   * onDelete={() => {
   *   setDeleteTarget(message.id);
   *   setShowDeleteConfirm(true);
   * }}
   * ```
   */
  onDelete?: () => void;

  /**
   * Whether the action buttons should be visible and interactive.
   * Typically controlled by hover state, focus, or explicit user action.
   * When false, the component returns null and renders nothing.
   *
   * - Mouse hover over message bubble
   * - Focus on message for keyboard users
   * - Explicit toggle for persistent display
   *
   * @example
   * ```tsx
   * // Hover-based visibility
   * const [isVisible, setIsVisible] = useState(false);
   *
   * <div
   *   onMouseEnter={() => setIsVisible(true)}
   *   onMouseLeave={() => setIsVisible(false)}
   * >
   *   <MessageActions isVisible={isVisible} {...otherProps} />
   * </div>
   * ```
   */
  isVisible: boolean;

  /**
   * Whether the message belongs to the current user.
   * Determines if edit and delete buttons are shown.
   * When false, only the reaction button is displayed.
   *
   * - Own messages: Show all actions (reaction, edit, delete)
   * - Other messages: Show only reaction button
   *
   * @example
   * ```tsx
   * // Basic ownership check
   * isOwn={message.senderId === currentUser.id}
   *
   * ```
   */
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
 * - Accessible toolbar with proper ARIA attributes
 * - Responsive to theme changes (light/dark)
 * - Smooth hover transitions and visual feedback
 *
 * @example
 * // Basic usage in a chat message component
 * const [actionsVisible, setActionsVisible] = useState(false);
 * const [showEmojiPicker, setShowEmojiPicker] = useState(false);
 *
 * return (
 *   <div
 *     className="message-bubble"
 *     onMouseEnter={() => setActionsVisible(true)}
 *     onMouseLeave={() => setActionsVisible(false)}
 *   >
 *     <div className="message-content">{message.text}</div>
 *
 *     <MessageActions
 *       isVisible={actionsVisible}
 *       isOwn={message.senderId === currentUser.id}
 *       onReaction={() => setShowEmojiPicker(true)}
 *       onEdit={() => handleEditMessage(message.id)}
 *       onDelete={() => handleDeleteMessage(message.id)}
 *     />
 *   </div>
 * );
 *
 *
 */
export const MessageActions: React.FC<MessageActionsProps> = ({
  onReaction,
  onEdit,
  onDelete,
  isVisible,
  isOwn,
}) => {
  // Get chat settings from context
  if (!isVisible) return;

  // Check if there are any actions to display
  const hasReactionAction = onReaction !== undefined;
  const hasEditAction = isOwn && onEdit !== undefined;
  const hasDeleteAction = isOwn && onDelete !== undefined;

  // If no actions are available, don't render anything
  if (!hasReactionAction && !hasEditAction && !hasDeleteAction) {
    return;
  }

  return (
    <div
      className="absolute -top-10 right-0 z-10 flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-md p-1"
      role="toolbar"
      aria-label="Message actions"
    >
      {hasReactionAction && (
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={onReaction}
          aria-label="Add reaction"
        >
          <Icon name="emoji" size="md" aria-hidden={true} />
        </Button>
      )}

      {hasEditAction && (
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={onEdit}
          aria-label="Edit message"
        >
          <Icon name="edit" size="sm" aria-hidden={true} />
        </Button>
      )}

      {hasDeleteAction && (
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
          onClick={onDelete}
          aria-label="Delete message"
        >
          <Icon name="delete" size="sm" aria-hidden={true} />
        </Button>
      )}
    </div>
  );
};
