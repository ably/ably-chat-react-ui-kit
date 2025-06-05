import React, { useState, useRef } from 'react';
import Avatar from '../atoms/Avatar';
import Icon from '../atoms/Icon';
import TextInput from '../atoms/TextInput';
import Button from '../atoms/Button';
import MessageActions from './MessageActions';
import MessageReactions from './MessageReactions';
import EmojiPicker from './EmojiPicker';
import { Message } from '@ably/chat';

/**
 * Props for the ChatMessage component
 */
interface ChatMessageProps {
  /** The message object from Ably */
  message: Message;
  /** Whether the current user is the author of the message */
  isOwn: boolean;
  /** ID of the current user */
  currentUserId: string;
  /** Callback when a message is edited */
  onEdit?: (messageSerial: string, newText: string) => void;
  /** Callback when a message is deleted */
  onDelete?: (messageSerial: string) => void;
  /** Callback when a reaction is added to a message */
  onReactionAdd?: (messageSerial: string, emoji: string) => void;
  /** Callback when a reaction is removed from a message */
  onReactionRemove?: (messageSerial: string, emoji: string) => void;
}

/**
 * ChatMessage component displays a single chat message with various interactive features
 * 
 * Features:
 * - Display message content with sender information
 * - Edit and delete messages (for own messages)
 * - Add and remove reactions
 * - Show message status (edited, deleted)
 * - Display timestamps
 */
const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isOwn,
  currentUserId,
  onEdit,
  onDelete,
  onReactionAdd,
  onReactionRemove,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text || '');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState({ top: 0, left: 0 });
  const messageRef = useRef<HTMLDivElement>(null);
  const messageBubbleRef = useRef<HTMLDivElement>(null);

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
   * Calls the onEdit callback with the message serial and new text
   */
  const handleSaveEdit = () => {
    if (editText.trim() && editText !== (message.text || '')) {
      onEdit?.(message.serial, editText.trim());
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
   * Handles message deletion after confirmation
   * 
   * TODO: Consider replacing the browser's confirm dialog with a custom modal
   * for better UX and styling consistency
   */
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this message?')) {
      onDelete?.(message.serial);
    }
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
    onReactionAdd?.(message.serial, emoji);
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
    const hasUserReacted = distinct[emoji]?.clientIds.includes(currentUserId) ?? false;

    if (hasUserReacted) {
      onReactionRemove?.(message.serial, emoji);
    } else {
      onReactionAdd?.(message.serial, emoji);
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
      className={`relative flex items-end gap-2 mb-4 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-label={`Message from ${message.clientId}${message.isDeleted ? ' (deleted)' : ''}${message.isUpdated ? ' (edited)' : ''}`}
    >
      <Avatar alt={message.clientId} color={undefined} src={undefined} size="sm" />
      <div
        className={`flex flex-col max-w-[85%] md:max-w-[80%] lg:max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}
      >
        <div className="relative">
          <div
            ref={messageBubbleRef}
            className={`relative px-4 py-2 rounded-2xl ${
              isOwn
                ? 'bg-gray-900 text-white rounded-br-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md'
            }`}
            aria-live={message.isUpdated ? "polite" : "off"}
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
              currentUserId={currentUserId}
            />
          )}

        <div className="flex items-center gap-2 mt-1 px-2">
          <span className="text-xs text-gray-500">
            {formatTime(message.createdAt.getTime())}
            {!message.isDeleted && message.isUpdated && message.updatedAt && (
              <span className="ml-1">• edited {formatTime(message.updatedAt.getTime())}</span>
            )}
          </span>
          {/* Removed non-functional thumbs-up icon */}
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
    </div>
  );
};

export default ChatMessage;
