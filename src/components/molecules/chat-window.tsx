import { ErrorInfo, Message, MessageReactionType } from '@ably/chat';
import { useMessages, usePresence } from '@ably/chat/react';
import { clsx } from 'clsx';
import React, { useCallback } from 'react';

import { useMessageWindow } from '../../hooks/use-message-window.tsx';
import { ChatMessageList } from './chat-message-list.tsx';
import { ChatWindowFooter } from './chat-window-footer.tsx';
import { ChatWindowHeader } from './chat-window-header.tsx';
import { MessageInput } from './message-input.tsx';

/**
 * Props for the ChatWindow component
 */
export interface ChatWindowProps {
  /**
   * Unique identifier for the chat room.
   * Used for room-specific settings lookup and display customization.
   * Must be a valid room name as defined by your chat service.
   */
  roomName: string;

  /**
   * Optional custom content for the header area of the chat window.
   * Typically contains room information, participant counts, settings buttons,
   * or other room-specific controls and metadata display.
   *
   * Content is rendered within the ChatWindowHeader component and inherits
   * the header's styling and layout constraints.
   *
   * @example
   * customHeaderContent={
   *   <div className="flex items-center gap-2">
   *     <RoomInfo roomName={roomName} />
   *     <ParticipantCount />
   *     <RoomSettingsButton />
   *   </div>
   * }
   */
  customHeaderContent?: React.ReactNode;

  /**
   * Optional custom content for the footer area of the chat window.
   * Typically contains additional input controls like reaction pickers,
   * file upload buttons, formatting tools, or other message composition aids.
   *
   * Content is rendered alongside the MessageInput within the ChatWindowFooter
   * and should be designed to complement the primary input functionality.
   *
   * @example
   * customFooterContent={
   *   <div className="flex items-center gap-2">
   *     <EmojiPickerButton />
   *     <FileUploadButton />
   *     <VoiceRecordButton />
   *   </div>
   * }
   */
  customFooterContent?: React.ReactNode;

  /**
   * Whether to show typing indicators in the chat window.
   * When enabled, shows indicators when other users are typing.
   *
   * @default true
   *
   * @example
   * // Disable typing indicators for performance in large rooms
   * enableTypingIndicators={false}
   */
  enableTypingIndicators?: boolean;

  /**
   * When `true` (default) the user is put into the room's presence set
   * immediately.  Set to `false` if you need to
   * join later (e.g. after showing a “Join chat” button).
   *
   * @default true
   */
  autoEnterPresence?: boolean;

  /**
   * Controls the window size for rendering messages in UI. A larger window size will
   * produce a smoother scrolling experience, but at the cost of increased memory usage.
   * Too high a value may lead to significant performance issues.
   *
   * @default 200
   * windowSize={200}
   */
  windowSize?: number;

  /**
   * Additional CSS class names to apply to the root container.
   * Useful for custom styling, layout adjustments, theme variations,
   * or integration with external design systems.
   *
   * Applied to the outermost div element and combined with default styling.
   */
  className?: string;

  /**
   * Custom error handling configuration for chat operations.
   * Provides hooks for handling specific error scenarios instead of default console logging.
   * All handlers are optional and will fall back to console.error if not provided.
   *
   * @example
   * ```tsx
   * const onError = {
   *   onMessageUpdateError: (error, message) => {
   *     toast.error(`Failed to edit message: ${error.message}`);
   *     console.error('Edit error:', error);
   *   },
   *   onMessageDeleteError: (error, message) => {
   *     toast.error(`Failed to delete message: ${error.message}`);
   *   },
   *   onSendReactionError: (error, message, emoji) => {
   *     toast.error(`Failed to add ${emoji} reaction: ${error.message}`);
   *   },
   *   onMessageSendError: (error, text) => {
   *     toast.error(`Failed to send message: ${error.message}`);
   *   }
   * };
   *
   * <ChatWindow
   *   roomName="general"
   *   onError={onError}
   * />
   * ```
   */
  onError?: {
    /**
     * Called when message editing fails.
     * Provides the error object and the message that failed to edit.
     *
     * @param error - The error that occurred during message editing
     * @param message - The message that failed to edit
     */
    onMessageUpdateError?: (error: ErrorInfo, message: Message) => void;

    /**
     * Called when message deletion fails.
     * Provides the error object and the message that failed to delete.
     *
     * @param error - The error that occurred during message deletion
     * @param message - The message that failed to delete
     */
    onMessageDeleteError?: (error: ErrorInfo, message: Message) => void;

    /**
     * Called when adding a reaction to a message fails.
     * Provides the error object, the message, and the emoji that failed to add.
     *
     * @param error - The error that occurred during reaction addition
     * @param message - The message that failed to receive the reaction
     * @param emoji - The emoji that failed to be added as a reaction
     */
    onSendReactionError?: (error: ErrorInfo, message: Message, emoji: string) => void;

    /**
     * Called when removing a reaction from a message fails.
     * Provides the error object, the message, and the emoji that failed to remove.
     *
     * @param error - The error that occurred during reaction removal
     * @param message - The message that failed to have the reaction removed
     * @param emoji - The emoji that failed to be removed as a reaction
     */
    onRemoveReactionError?: (error: ErrorInfo, message: Message, emoji: string) => void;

    /**
     * Called when sending a message fails.
     * Provides the error object and the text that failed to send.
     *
     * @param error - The error that occurred during message sending
     * @param text - The text that failed to send
     */
    onMessageSendError?: (error: ErrorInfo, text: string) => void;
  };
}

/**
 * ChatWindow component provides the main chat interface for a room.
 *
 * Features:
 * - Message display with history loading
 * - Message editing, deletion, and reactions
 * - Typing indicators and presence
 * - Custom header and footer content
 * - Discontinuity recovery on reconnection
 * - Active chat window management to control which messages are rendered in the UI.
 * - History loading with infinite scroll support
 * - Custom error handling for all chat operations
 *
 * The enableTypingIndicators prop controls both the display of typing indicators in the
 * message list and whether the message input triggers typing events on keystroke.
 *
 * @example
 * // Basic usage
 * <ChatRoomProvider
 *   key={'general'}
 *   name={'general'}
 * >
 *   <ChatWindow
 *     roomName={'general'}
 *   />
 * </ChatRoomProvider>
 *
 * @example
 * // With custom header and footer
 * <ChatRoomProvider
 *   key={'general'}
 *   name={'general'}
 * >
 *   <ChatWindow
 *     roomName={'general'}
 *     customHeaderContent={<RoomInfo />}
 *     customFooterContent={<RoomReaction />}
 *   />
 * </ChatRoomProvider>
 *
 * @example
 * // With typing indicators disabled
 * <ChatRoomProvider
 *   key={'general'}
 *   name={'general'}
 * >
 *   <ChatWindow
 *     roomName={'general'}
 *     enableTypingIndicators={false}
 *   />
 * </ChatRoomProvider>
 *
 * @example
 * // With custom error handling
 * const onError = {
 *   onMessageUpdateError: (error, message) => {
 *     toast.error(`Failed to edit message: ${error.message}`);
 *     console.error('Edit failed:', error);
 *   },
 *   onMessageDeleteError: (error, message) => {
 *     toast.error(`Failed to delete message: ${error.message}`);
 *   },
 *   onSendReactionError: (error, message, emoji) => {
 *     toast.error(`Failed to add ${emoji} reaction: ${error.message}`);
 *   },
 *   onRemoveReactionError: (error, message, emoji) => {
 *     toast.error(`Failed to remove ${emoji} reaction: ${error.message}`);
 *   },
 *   onMessageSendError: (error, text) => {
 *     toast.error(`Failed to send message: ${error.message}`);
 *   }
 * };
 *
 * <ChatRoomProvider
 *   key={'general'}
 *   name={'general'}
 * >
 *   <ChatWindow
 *     roomName={'general'}
 *     onError={onError}
 *   />
 * </ChatRoomProvider>
 */
export const ChatWindow = ({
  roomName,
  customHeaderContent,
  customFooterContent,
  windowSize = 200,
  enableTypingIndicators = true,
  autoEnterPresence = true,
  className,
  onError,
}: ChatWindowProps) => {
  // Initialize presence for the room,
  usePresence({ autoEnterLeave: autoEnterPresence });

  const { deleteMessage, updateMessage, sendReaction, deleteReaction } = useMessages();

  const {
    activeMessages,
    updateMessages,
    showLatestMessages,
    showMessagesAroundSerial,
    loadMoreHistory,
    hasMoreHistory,
    loading,
  } = useMessageWindow({ windowSize });

  const handleRESTMessageUpdate = useCallback(
    (updated: Message) => {
      updateMessages([updated]);
    },
    [updateMessages]
  );

  const handleMessageUpdate = useCallback(
    (msg: Message, newText: string) => {
      const updated = msg.copy({ text: newText, metadata: msg.metadata, headers: msg.headers });

      updateMessage(msg.serial, updated)
        .then(handleRESTMessageUpdate)
        .catch((error: unknown) => {
          if (onError?.onMessageUpdateError) {
            onError.onMessageUpdateError(error as ErrorInfo, msg);
          } else {
            console.error('Failed to update message:', error);
          }
        });
    },
    [updateMessage, handleRESTMessageUpdate, onError]
  );

  const handleMessageDelete = useCallback(
    (msg: Message) => {
      deleteMessage(msg.serial, { description: 'deleted by user' })
        .then(handleRESTMessageUpdate)
        .catch((error: unknown) => {
          if (onError?.onMessageDeleteError) {
            onError.onMessageDeleteError(error as ErrorInfo, msg);
          } else {
            console.error('Failed to delete message:', error);
          }
        });
    },
    [deleteMessage, handleRESTMessageUpdate, onError]
  );

  const handleReactionAdd = useCallback(
    (msg: Message, emoji: string) => {
      sendReaction(msg.serial, { type: MessageReactionType.Distinct, name: emoji }).catch(
        (error: unknown) => {
          if (onError?.onSendReactionError) {
            onError.onSendReactionError(error as ErrorInfo, msg, emoji);
          } else {
            console.error('Failed to add reaction:', error);
          }
        }
      );
    },
    [sendReaction, onError]
  );

  const handleReactionRemove = useCallback(
    (msg: Message, emoji: string) => {
      deleteReaction(msg.serial, { type: MessageReactionType.Distinct, name: emoji }).catch(
        (error: unknown) => {
          if (onError?.onRemoveReactionError) {
            onError.onRemoveReactionError(error as ErrorInfo, msg, emoji);
          } else {
            console.error('Failed to remove reaction:', error);
          }
        }
      );
    },
    [deleteReaction, onError]
  );

  return (
    <div
      className={clsx('flex flex-col h-full bg-white dark:bg-gray-900 flex-1', className)}
      role="main"
      aria-label={`Chat room: ${roomName}`}
    >
      {/* Header */}
      {customHeaderContent && <ChatWindowHeader>{customHeaderContent}</ChatWindowHeader>}

      {/* Messages */}
      <ChatMessageList
        messages={activeMessages}
        isLoading={loading}
        onLoadMoreHistory={() => {
          void loadMoreHistory();
        }}
        hasMoreHistory={hasMoreHistory}
        enableTypingIndicators={enableTypingIndicators}
        onEdit={handleMessageUpdate}
        onDelete={handleMessageDelete}
        onReactionAdd={handleReactionAdd}
        onReactionRemove={handleReactionRemove}
        onMessageInView={showMessagesAroundSerial}
        onViewLatest={showLatestMessages}
      ></ChatMessageList>

      {/* Footer */}
      <ChatWindowFooter>
        <div className="flex-1">
          <MessageInput
            onSent={(msg) => {
              updateMessages([msg]);
            }}
            placeholder={`Message ${roomName}...`}
            aria-label={`Send message to ${roomName}`}
            onSendError={onError?.onMessageSendError}
            enableTyping={enableTypingIndicators}
          />
        </div>
        {customFooterContent}
      </ChatWindowFooter>
    </div>
  );
};

ChatWindow.displayName = 'ChatWindow';
