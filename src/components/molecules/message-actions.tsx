import { useRoom } from '@ably/chat/react';
import { clsx } from 'clsx';
import React from 'react';

import { useChatSettings } from '../../hooks/use-chat-settings.tsx';
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
   * onReactionButtonClicked={() => {
   *   setEmojiPickerPosition(getMessagePosition());
   *   setShowEmojiPicker(true);
   * }}
   * ```
   */
  onReactionButtonClicked?: () => void;

  /**
   * Callback function triggered when the edit button is clicked.
   * Should initiate edit mode for the message, typically replacing the message
   * content with an editable input field or editor component.
   * Displayed when:
   * - The message is owned by the current user and allowMessageUpdatesOwn is true, or allowMessageUpdatesAny is true
   *
   * @example
   * ```tsx
   * onEditButtonClicked={() => {
   *   setEditingMessageId(message.id);
   *   setEditText(message.text);
   *   setIsEditing(true);
   * }}
   * ```
   */
  onEditButtonClicked?: () => void;

  /**
   * Callback function triggered when the delete button is clicked.
   * Should handle message deletion, typically with confirmation dialog.
   * Displayed when:
   * - The message is owned by the current user and allowMessageDeletesOwn is true, or allowMessageDeletesAny is true
   *
   * @example
   * ```tsx
   * onDeleteButtonClicked={() => {
   *   setDeleteTarget(message.id);
   *   setShowDeleteConfirm(true);
   * }}
   * ```
   */
  onDeleteButtonClicked?: () => void;

  /**
   * Whether the message belongs to the current user.
   * Used in combination with chat settings to determine if edit and delete buttons are shown.
   *
   * @example
   * ```tsx
   * // Basic ownership check
   * isOwn={message.senderId === currentUser.id}
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
 *     {actionsVisible && (<MessageActions
 *       isOwn={message.senderId === currentUser.id}
 *       onReaction={() => setShowEmojiPicker(true)}
 *       onEdit={() => handleEditMessage(message.id)}
 *       onDelete={() => handleDeleteMessage(message.id)}
 *     />
 *   </div>)}
 * );
 *
 *
 */
export const MessageActions = ({
  onReactionButtonClicked,
  onEditButtonClicked,
  onDeleteButtonClicked,
  isOwn,
}: MessageActionsProps) => {
  // Get the current room name
  const { roomName } = useRoom();

  // Get chat settings for the current room
  const { getEffectiveSettings } = useChatSettings();
  const settings = getEffectiveSettings(roomName);

  const {
    allowMessageUpdatesOwn,
    allowMessageUpdatesAny,
    allowMessageDeletesOwn,
    allowMessageDeletesAny,
    allowMessageReactions,
  } = settings;

  // Check if there are any actions to display based on settings and permissions
  const hasReactionAction = allowMessageReactions && onReactionButtonClicked !== undefined;

  // Can edit if:
  // - User owns the message AND can edit own messages, OR
  // - User can edit any message
  const canEdit = (isOwn && allowMessageUpdatesOwn) || allowMessageUpdatesAny;
  const hasEditAction = canEdit && onEditButtonClicked !== undefined;

  // Can delete if:
  // - User owns the message AND can delete own messages, OR
  // - User can delete any message
  const canDelete = (isOwn && allowMessageDeletesOwn) || allowMessageDeletesAny;
  const hasDeleteAction = canDelete && onDeleteButtonClicked !== undefined;

  // If no actions are available, don't render anything
  if (!hasReactionAction && !hasEditAction && !hasDeleteAction) {
    return;
  }

  return (
    <div
      className="ably-message-actions"
      role="toolbar"
      aria-label="Message actions"
    >
      {hasReactionAction && (
        <Button
          variant="ghost"
          size="sm"
          className="ably-message-actions__button"
          onClick={onReactionButtonClicked}
          aria-label="Add reaction"
        >
          <Icon name="emoji" size="md" aria-hidden={true} />
        </Button>
      )}

      {hasEditAction && (
        <Button
          variant="ghost"
          size="sm"
          className="ably-message-actions__button"
          onClick={onEditButtonClicked}
          aria-label="Edit message"
        >
          <Icon name="edit" size="sm" aria-hidden={true} />
        </Button>
      )}

      {hasDeleteAction && (
        <Button
          variant="ghost"
          size="sm"
          className={clsx('ably-message-actions__button', 'ably-message-actions__button--delete')}
          onClick={onDeleteButtonClicked}
          aria-label="Delete message"
        >
          <Icon name="delete" size="sm" aria-hidden={true} />
        </Button>
      )}
    </div>
  );
};
