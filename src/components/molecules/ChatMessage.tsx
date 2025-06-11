import React, { useState, useRef } from 'react';
import { Avatar } from '../atoms';
import { TextInput } from '../atoms';
import { Button } from '../atoms';
import { Icon } from '../atoms';
import { MessageActions } from './MessageActions';
import { MessageReactions } from './MessageReactions';
import { EmojiPicker } from './EmojiPicker';
import { AvatarEditor } from './AvatarEditor';
import { ConfirmDialog } from './ConfirmDialog';
import { Message } from '@ably/chat';
import { AvatarData } from '../atoms';
import { useUserAvatar } from '../../hooks';
import clsx from 'clsx';
import { Tooltip } from '../atoms';

/**
 * Props for the ChatMessage component
 */
export interface ChatMessageProps {
  /**
   * The Ably Chat message object used to display the message content.
   */
  message: Message;

  /**
   * Client ID of the currently active user.
   * Used to determine message ownership for edit/delete permissions and UI styling.
   */
  currentClientId: string;

  /**
   * Optional callback triggered when the user saves an edited message.
   * Only called for messages owned by the current user.
   * @param message - The original message object being edited
   * @param newText - The updated message text after editing
   */
  onEdit?: (message: Message, newText: string) => void;

  /**
   * Optional callback triggered when the user confirms message deletion.
   * Only called for messages owned by the current user after confirmation dialog.
   * @param message - The message object to be deleted
   */
  onDelete?: (message: Message) => void;

  /**
   * Optional callback triggered when a user adds an emoji reaction to the message.
   * Can be called by any user, not just the message owner.
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
export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  currentClientId,
  onEdit,
  onDelete,
  onReactionAdd,
  onReactionRemove,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text || '');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState({ top: 0, left: 0 });

  // Avatar hover tooltip state
  const [showAvatarTooltip, setShowAvatarTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<'above' | 'below'>('above');

  // Avatar editor state
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);

  // Confirm dialog state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const messageRef = useRef<HTMLDivElement>(null);
  const messageBubbleRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const isOwn = message.clientId === currentClientId;

  const { userAvatar, setUserAvatar } = useUserAvatar({ clientId: message.clientId });

  /**
   * Formats a timestamp into a readable time string (HH:MM)
   *
   * @param timestamp - The timestamp to format (milliseconds since epoch)
   * @returns Formatted time string in HH:MM format
   */
  const formatTime = (timestamp?: number) => {
    if (!timestamp)
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
   * Opens the emoji picker and positions it relative to the message bubble
   * Calculates optimal position to ensure it's visible within the viewport
   */
  const handleAddReaction = () => {
    const bubbleRect = messageBubbleRef.current?.getBoundingClientRect();
    if (!bubbleRect) return;

    const pickerWidth = 250;
    const pickerHeight = 200; // Approximate height of the picker
    let left: number;
    let top: number;

    // Always position the picker above the message bubble, centered horizontally
    left = bubbleRect.left + bubbleRect.width / 2 - pickerWidth / 2;

    // Check if there's enough room above the bubble for the picker
    const spaceAbove = bubbleRect.top;
    const requiredSpaceAbove = pickerHeight + 40; // picker height + some margin

    if (spaceAbove >= requiredSpaceAbove) {
      // Position above the bubble
      top = bubbleRect.top - pickerHeight - 20;
    } else {
      // Position below the bubble
      top = bubbleRect.bottom + 20;
    }

    // Ensure picker stays within viewport bounds horizontally
    const maxLeft = window.innerWidth - pickerWidth - 20;
    const minLeft = 20;

    if (left < minLeft) {
      left = minLeft;
    } else if (left > maxLeft) {
      left = maxLeft;
    }

    setEmojiPickerPosition({ top, left });
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

  /**
   * Toggles a reaction on a message when clicking an existing reaction
   * If the user has already reacted with this emoji, it removes the reaction
   * Otherwise, it adds the reaction
   *
   * @param emoji - The emoji to toggle
   */
  const handleReactionClick = (emoji: string) => {
    const distinct = message.reactions?.distinct ?? {};
    const hasUserReacted = distinct[emoji]?.clientIds.includes(currentClientId) ?? false;

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

  /**
   * Handles mouse enter event on the avatar
   * Calculates optimal tooltip position and shows tooltip with user's clientId
   *
   * @param event - The mouse enter event
   */
  const handleAvatarMouseEnter = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const tooltipHeight = 40; // Approximate tooltip height
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;

    // Position above if there's enough space, otherwise below
    if (spaceAbove >= tooltipHeight + 10) {
      setTooltipPosition('above');
    } else if (spaceBelow >= tooltipHeight + 10) {
      setTooltipPosition('below');
    } else {
      // If neither has enough space, use the side with more space
      setTooltipPosition(spaceAbove > spaceBelow ? 'above' : 'below');
    }

    setShowAvatarTooltip(true);
  };

  /**
   * Handles mouse leave event on the avatar
   * Hides the tooltip
   */
  const handleAvatarMouseLeave = () => {
    setShowAvatarTooltip(false);
  };

  /**
   * Handles click on the avatar (only for own messages)
   * Opens the avatar editor modal
   *
   * @param event - The click event
   */
  const handleAvatarClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (isOwn) {
      setShowAvatarEditor(true);
    }
  };

  /**
   * Handles avatar changes from the AvatarEditor
   * Updates the user avatar in the AvatarContext
   *
   * @param avatarData - Partial avatar data to update
   */
  const handleAvatarSave = (avatarData: Partial<AvatarData>) => {
    setUserAvatar(avatarData);
    setShowAvatarEditor(false);
  };

  /**
   * Calculates tooltip position based on avatar location and viewport constraints
   *
   * @returns Object containing top and left positioning values, or null if refs are unavailable
   */
  const calculateTooltipPosition = () => {
    const avatarRect = avatarRef.current?.getBoundingClientRect();

    if (!avatarRect) return null;

    // Approximate tooltip height (padding + text + arrow)
    const tooltipHeight = 40;
    const spacing = 8; // Space between avatar and tooltip

    // Calculate vertical position with proper spacing
    const tooltipY =
      tooltipPosition === 'above'
        ? avatarRect.top - tooltipHeight - spacing
        : avatarRect.bottom + spacing;

    // Calculate horizontal position - center on avatar
    const avatarCenter = (avatarRect.left + avatarRect.right) / 2;

    return {
      top: tooltipY,
      left: avatarCenter,
    };
  };

  return (
    <div
      ref={messageRef}
      className={clsx(
        'relative flex items-start gap-2 mb-4',
        isOwn ? 'flex-row-reverse' : 'flex-row',
        className
      )}
      role="article"
      aria-label={`Message from ${message.clientId}${message.isDeleted ? ' (deleted)' : ''}${message.isUpdated ? ' (edited)' : ''}`}
    >
      {/* Avatar with hover tooltip and click functionality */}
      <div className="relative">
        <div
          ref={avatarRef}
          className={`relative ${isOwn ? 'cursor-pointer' : ''}`}
          onMouseEnter={handleAvatarMouseEnter}
          onMouseLeave={handleAvatarMouseLeave}
          onClick={handleAvatarClick}
          role={isOwn ? 'button' : undefined}
          aria-label={isOwn ? 'Click to edit your avatar' : `Avatar for ${message.clientId}`}
          tabIndex={isOwn ? 0 : undefined}
          onKeyDown={
            isOwn
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleAvatarClick(e as unknown as React.MouseEvent);
                  }
                }
              : undefined
          }
        >
          <Avatar
            alt={userAvatar?.displayName}
            src={userAvatar?.src}
            color={userAvatar?.color}
            size="sm"
            initials={userAvatar?.initials}
          />

          {/* Edit overlay for own avatar */}
          {isOwn && (
            <div
              className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer group"
              title="Edit avatar"
              aria-hidden="true"
            >
              {/* Semi-transparent overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full transition-all" />

              {/* Edit icon in center - smaller for sm avatar */}
              <div className="relative z-10 bg-black bg-opacity-60 rounded-full p-1 transform scale-0 group-hover:scale-100 transition-transform">
                <svg
                  className="w-2 h-2 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Avatar Hover Tooltip */}
        {showAvatarTooltip &&
          !showAvatarEditor &&
          (() => {
            const coords = calculateTooltipPosition();

            if (!coords) return null;

            return (
              <Tooltip
                position={tooltipPosition}
                className="fixed transform -translate-x-1/2"
                style={{ top: coords.top, left: coords.left }}
                spacing="none"
                role="tooltip"
                aria-live="polite"
              >
                <div className="text-center text-sm px-2 py-1">{message.clientId}</div>
              </Tooltip>
            );
          })()}
      </div>

      <div
        className={`flex flex-col max-w-[85%] md:max-w-[80%] lg:max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}
      >
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            ref={messageBubbleRef}
            className={`relative px-4 py-2 rounded-2xl ${
              isOwn
                ? 'bg-gray-900 text-white rounded-br-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md'
            }`}
            aria-live={message.isUpdated ? 'polite' : 'off'}
          >
            {isEditing ? (
              <div className="min-w-[200px]">
                <TextInput
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Edit message..."
                  className="text-sm mb-2"
                  autoFocus
                  aria-label="Edit message text"
                />
                <div className="flex gap-2">
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
                {message.isDeleted ? (
                  <p className="text-sm leading-relaxed break-words break-all whitespace-pre-wrap italic text-gray-500 dark:text-gray-400">
                    Message deleted
                  </p>
                ) : (
                  <p className="text-sm leading-relaxed break-words break-all whitespace-pre-wrap">
                    {message.text || ''}
                    {message.isUpdated && <span className="text-xs opacity-60 ml-2">(edited)</span>}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Message Actions to update/delete/react */}
          <MessageActions
            isVisible={isHovered && !isEditing && !message.isDeleted}
            isOwn={isOwn}
            onReaction={handleAddReaction}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {/* Reactions will be rendered below the relevant message */}
        {!message.isDeleted &&
          message.reactions &&
          Object.keys(message.reactions.distinct || {}).length > 0 && (
            <MessageReactions
              message={message}
              onReactionClick={handleReactionClick}
              currentClientId={currentClientId}
            />
          )}

        <div className="flex items-center gap-2 mt-1 px-2">
          <span className="text-xs text-gray-500">
            {formatTime(message.createdAt.getTime())}
            {!message.isDeleted && message.isUpdated && message.updatedAt && (
              <span className="ml-1">• edited {formatTime(message.updatedAt.getTime())}</span>
            )}
          </span>
        </div>
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <EmojiPicker
          isOpen={showEmojiPicker}
          onClose={() => setShowEmojiPicker(false)}
          onEmojiSelect={handleEmojiSelect}
          position={emojiPickerPosition}
        />
      )}

      {/* Avatar Editor Modal (only for own messages) */}
      {isOwn && showAvatarEditor && userAvatar && (
        <AvatarEditor
          isOpen={showAvatarEditor}
          onClose={() => setShowAvatarEditor(false)}
          onSave={handleAvatarSave}
          currentAvatar={userAvatar.src}
          currentColor={userAvatar.color}
          displayName={userAvatar.displayName}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
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
