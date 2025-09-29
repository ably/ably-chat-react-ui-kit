import { ChatMessageAction, Message } from '@ably/chat';
import { useChatClient } from '@ably/chat/react';
import { clsx } from 'clsx';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useUserAvatar } from '../../hooks/use-user-avatar.tsx';
import { Avatar } from '../atoms/avatar.tsx';
import { Button } from '../atoms/button.tsx';
import { Icon } from '../atoms/icon.tsx';
import { TextInput } from '../atoms/text-input.tsx';
import { Tooltip } from '../atoms/tooltip.tsx';
import { ConfirmDialog } from './confirm-dialog.tsx';
import { EmojiPicker } from './emoji-picker.tsx';
import { MessageActions } from './message-actions.tsx';
import { MessageReactions } from './message-reactions.tsx';

/**
 * Formats a timestamp into a readable time string
 * For today's dates: HH:MM format
 * For past dates: MM/DD/YYYY, HH:MM format
 *
 * @param timestamp - The timestamp to format (milliseconds since epoch)
 * @returns Formatted time string, e.g. "12:34" or "1/2/2023, 12:34". It will show the full date if the message is not from today.
 */
const formatTime = (timestamp?: number) => {
  if (!timestamp) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const messageDate = new Date(timestamp);
  const today = new Date();

  // Check if the message is from today
  const isToday =
    messageDate.getDate() === today.getDate() &&
    messageDate.getMonth() === today.getMonth() &&
    messageDate.getFullYear() === today.getFullYear();

  return isToday
    ? messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : messageDate.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' }) +
        ', ' +
        messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Props for the ChatMessage component
 */
export interface ChatMessageProps {
  /**
   * The Ably Chat message object used to display the message content.
   */
  message: Message;

  /**
   * Optional callback triggered when the user saves an edited message.
   * @param message - The original message object being edited
   * @param newText - The updated message text after editing
   */
  onEdit?: (message: Message, newText: string) => void;

  /**
   * Optional callback triggered when the user confirms message deletion.
   * @param message - The message object to be deleted
   */
  onDelete?: (message: Message) => void;

  /**
   * Optional callback triggered when a user adds an emoji reaction to the message.
   * @param message - The message object receiving the reaction
   * @param emoji - The emoji character being added as a reaction
   */
  onReactionAdd?: (message: Message, emoji: string) => void;

  /**
   * Optional callback triggered when a user removes their emoji reaction from the message.
   * Called when clicking an existing reaction the user has already added.
   * @param message - The message object losing the reaction
   * @param emoji - The emoji character being removed from reactions
   */
  onReactionRemove?: (message: Message, emoji: string) => void;

  /**
   * Additional CSS class names to apply to the message container
   * Useful for custom styling or theming
   */
  className?: string;
}

/**
 * ChatMessage component displays an individual chat message with interactive capabilities
 *
 * Core Features:
 * - Message content display with sender avatar
 * - Edit/delete functionality for own messages with confirmation dialogs
 * - Emoji reactions system with picker and toggle functionality
 * - Avatar editing for message senders (own messages only)
 * - Status indicators (edited, deleted)
 * - Basic ARIA support (role, aria-label)
 * - Hover tooltips showing sender information
 *
 * @example
 * <ChatMessage
 *   message={message}
 *   currentClientId="user123"
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   onReactionAdd={handleReactionAdd}
 *   onReactionRemove={handleReactionRemove}
 * />
 */
export const ChatMessage = ({
  message,
  onEdit,
  onDelete,
  onReactionAdd,
  onReactionRemove,
  className,
}: ChatMessageProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text || '');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState({ top: 0, left: 0 });

  // Confirm dialog state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const messageRef = useRef<HTMLDivElement>(null);
  const messageBubbleRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const { clientId } = useChatClient();
  const isOwn = message.clientId === clientId;

  const { userAvatar } = useUserAvatar({ clientId: message.clientId });

  /**
   * Enables edit mode for the message
   */
  const handleEdit = () => {
    setIsEditing(true);
  };

  /**
   * Saves the edited message text if it has changed
   * Calls the onEdit callback with the message and new text
   */
  const handleSaveEdit = () => {
    if (editText.trim() && editText !== (message.text || '')) {
      onEdit?.(message, editText.trim());
    }
    setIsEditing(false);
  };

  /**
   * Cancels the edit operation and resets the edit text
   */
  const handleCancelEdit = () => {
    setEditText(message.text || '');
    setIsEditing(false);
  };

  /**
   * Shows the delete confirmation dialog
   */
  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  /**
   * Handles confirmed message deletion
   */
  const handleConfirmDelete = () => {
    onDelete?.(message);
  };

  /**
   * Calculates the optimal position for the emoji picker
   * relative to the message bubble and viewport constraints
   */
  const calculateEmojiPickerPosition = () => {
    const bubbleRect = messageBubbleRef.current?.getBoundingClientRect();
    if (!bubbleRect) return { top: 0, left: 0 };

    // Use responsive width calculation
    const pickerWidth = Math.min(240, window.innerWidth - 40);
    const pickerHeight = Math.min(320, window.innerHeight - 40); // Responsive height
    let left: number;
    let top: number;

    // Position the picker centered horizontally relative to the message bubble
    left = bubbleRect.left + bubbleRect.width / 2 - pickerWidth / 2;

    // Check if there's enough room above the bubble for the picker
    const spaceAbove = bubbleRect.top;
    const requiredSpaceAbove = Math.min(pickerHeight, 120) + 40; // Use minimum height if space is limited

    // Determine initial top position
    top =
      spaceAbove >= requiredSpaceAbove
        ? bubbleRect.top - pickerHeight - 20
        : bubbleRect.bottom + 20;

    // Ensure picker stays within viewport bounds horizontally
    const maxLeft = window.innerWidth - pickerWidth - 20;
    const minLeft = 20;

    if (left < minLeft) {
      left = minLeft;
    } else if (left > maxLeft) {
      left = maxLeft;
    }

    // Ensure picker stays within viewport bounds vertically with a minimum gap
    const minGap = 20; // Minimum gap from screen edges
    const maxTop = window.innerHeight - pickerHeight - minGap;
    const minTop = minGap;

    if (top < minTop) {
      top = minTop;
    } else if (top > maxTop) {
      top = maxTop;
    }

    return { top, left };
  };

  /**
   * Opens the emoji picker and positions it relative to the message bubble
   * Calculates optimal position to ensure it's visible within the viewport
   */
  const handleAddReaction = () => {
    const position = calculateEmojiPickerPosition();
    setEmojiPickerPosition(position);
    setShowEmojiPicker(true);
  };

  /**
   * Handles emoji selection from the emoji picker
   * Adds the selected emoji as a reaction to the message
   *
   * @param emoji - The selected emoji
   */
  const handleEmojiSelect = (emoji: string) => {
    onReactionAdd?.(message, emoji);
    setShowEmojiPicker(false);
  };

  // Update emoji picker position when window is resized
  useEffect(() => {
    if (!showEmojiPicker) return;

    const handleResize = () => {
      const position = calculateEmojiPickerPosition();
      setEmojiPickerPosition(position);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [showEmojiPicker]);

  /**
   * Toggles a reaction on a message when clicking an existing reaction
   * If the user has already reacted with this emoji, it removes the reaction
   * Otherwise, it adds the reaction
   *
   * @param emoji - The emoji to toggle
   */
  const handleReactionClick = (emoji: string) => {
    if (!clientId) return;
    const distinct = message.reactions.distinct;
    const hasUserReacted = distinct[emoji]?.clientIds.includes(clientId);

    if (hasUserReacted) {
      onReactionRemove?.(message, emoji);
    } else {
      onReactionAdd?.(message, emoji);
    }
  };

  /**
   * Handles keyboard events in the edit message input
   * - Enter (without Shift) saves the edit
   * - Escape cancels the edit
   *
   * @param e - The keyboard event
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div
      ref={messageRef}
      className={clsx('ably-chat-message', isOwn && 'ably-chat-message--own', className)}
      role="article"
      aria-label={`Message from ${message.clientId}${message.action === ChatMessageAction.MessageDelete ? ' (deleted)' : ''}${message.action === ChatMessageAction.MessageUpdate ? ' (edited)' : ''}`}
    >
      {/* Avatar with hover tooltip functionality */}
      <div className="ably-chat-message__avatar-container">
        <Tooltip title={message.clientId}>
          <div
            ref={avatarRef}
            className="ably-chat-message__avatar-container"
            aria-label={`Avatar for ${message.clientId}`}
            tabIndex={isOwn ? 0 : undefined}
          >
            <Avatar
              alt={userAvatar?.displayName}
              src={userAvatar?.src}
              color={userAvatar?.color}
              size="sm"
              initials={userAvatar?.initials}
            />
          </div>
        </Tooltip>
      </div>

      <div
        className={clsx(
          'ably-chat-message__wrapper',
          isOwn ? 'ably-chat-message__wrapper--own' : 'ably-chat-message__wrapper--other'
        )}
      >
        <div
          className="ably-chat-message__content-container"
          onMouseEnter={() => {
            setIsHovered(true);
          }}
          onMouseLeave={() => {
            setIsHovered(false);
          }}
        >
          <div
            ref={messageBubbleRef}
            className={clsx(
              'ably-chat-message__bubble',
              isOwn ? 'ably-chat-message__bubble--own' : 'ably-chat-message__bubble--other'
            )}
            aria-live={message.action === ChatMessageAction.MessageUpdate ? 'polite' : 'off'}
          >
            {isEditing ? (
              <div className="ably-chat-message__edit-container">
                <TextInput
                  value={editText}
                  onChange={(e) => {
                    setEditText(e.target.value);
                  }}
                  onKeyDown={handleKeyPress}
                  placeholder="Edit message..."
                  className="ably-chat-message__edit-input"
                  autoFocus
                  aria-label="Edit message text"
                />
                <div className="ably-chat-message__edit-actions">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={!editText.trim()}
                  >
                    Save
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {message.action === ChatMessageAction.MessageDelete ? (
                  <p
                    className={clsx('ably-chat-message__text', 'ably-chat-message__text--deleted')}
                  >
                    Message deleted
                  </p>
                ) : (
                  <p className="ably-chat-message__text">
                    {message.text || ''}
                    {message.action === ChatMessageAction.MessageUpdate && (
                      <span className="ably-chat-message__edited">(edited)</span>
                    )}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Message Actions to update/delete/react */}
          {isHovered && !isEditing && message.action !== ChatMessageAction.MessageDelete && (
            <MessageActions
              isOwn={isOwn}
              onReactionButtonClicked={handleAddReaction}
              onEditButtonClicked={handleEdit}
              onDeleteButtonClicked={handleDelete}
            />
          )}
        </div>

        {/* Reactions will be rendered below the relevant message */}
        {message.action !== ChatMessageAction.MessageDelete &&
          Object.keys(message.reactions.distinct).length > 0 &&
          clientId && (
            <MessageReactions
              message={message}
              onReactionClick={handleReactionClick}
              currentClientId={clientId}
            />
          )}

        <div className="ably-chat-message__metadata">
          <span className="ably-chat-message__timestamp">
            {formatTime(message.timestamp.getTime())}
            {message.action === ChatMessageAction.MessageUpdate && (
              <span className="ably-chat-message__timestamp-separator">
                • edited {formatTime(message.version.timestamp.getTime())}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <EmojiPicker
          onClose={() => {
            setShowEmojiPicker(false);
          }}
          onEmojiSelect={handleEmojiSelect}
          position={emojiPickerPosition}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        icon={<Icon name="delete" size="lg" />}
      />
    </div>
  );
};
