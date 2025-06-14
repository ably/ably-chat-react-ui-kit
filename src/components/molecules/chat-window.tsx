import { Message, MessageReactionType } from '@ably/chat';
import { useChatClient, useMessages, usePresence } from '@ably/chat/react';
import clsx from 'clsx';
import React, { useCallback } from 'react';

import { useChatSettings } from '../../hooks/use-chat-settings.tsx';
import { useMessageWindow } from '../../hooks/use-message-window.tsx';
import { ChatMessageList } from './chat-message-list.tsx';
import { ChatWindowFooter } from './chat-window-footer.tsx';
import { ChatWindowHeader } from './chat-window-header.tsx';
import { MessageInput } from './message-input.tsx';
import { TypingIndicators } from './typing-indicators.tsx';

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
 */
export const ChatWindow: React.FC<ChatWindowProps> = ({
  roomName,
  customHeaderContent,
  customFooterContent,
  windowSize = 200,
  enableTypingIndicators = true,
  className,
}) => {
  const { clientId } = useChatClient();
  usePresence(); // enter presence on mount
  const { getEffectiveSettings } = useChatSettings();
  const settings = getEffectiveSettings(roomName);

  const {
    send,
    deleteMessage,
    update: updateMessageRemote,
    sendReaction,
    deleteReaction,
  } = useMessages();

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

  const handleMessageEdit = useCallback(
    (msg: Message, newText: string) => {
      const updated = msg.copy({ text: newText, metadata: msg.metadata, headers: msg.headers });

      updateMessageRemote(msg.serial, updated)
        .then(handleRESTMessageUpdate)
        .catch((error: unknown) => {
          console.error('Failed to update message:', error);
        });
    },
    [updateMessageRemote, handleRESTMessageUpdate]
  );

  const handleMessageDelete = useCallback(
    (msg: Message) => {
      deleteMessage(msg, { description: 'deleted by user' })
        .then(handleRESTMessageUpdate)
        .catch((error: unknown) => {
          console.error('Failed to delete message:', error);
        });
    },
    [deleteMessage, handleRESTMessageUpdate]
  );

  const handleReactionAdd = useCallback(
    (msg: Message, emoji: string) => {
      sendReaction(msg, { type: MessageReactionType.Distinct, name: emoji }).catch(
        (error: unknown) => {
          console.error('Failed to add reaction:', error);
        }
      );
    },
    [sendReaction]
  );

  const handleReactionRemove = useCallback(
    (msg: Message, emoji: string) => {
      deleteReaction(msg, { type: MessageReactionType.Distinct, name: emoji }).catch(
        (error: unknown) => {
          console.error('Failed to remove reaction:', error);
        }
      );
    },
    [deleteReaction]
  );

  const handleSendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      send({ text: trimmed }).catch((error: unknown) => {
        console.error('Failed to send message:', error);
      });
    },
    [send]
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
        currentClientId={clientId}
        isLoading={loading}
        onLoadMoreHistory={() => {
          void loadMoreHistory();
        }}
        hasMoreHistory={hasMoreHistory}
        onEdit={settings.allowMessageEdits ? handleMessageEdit : undefined}
        onDelete={settings.allowMessageDeletes ? handleMessageDelete : undefined}
        onReactionAdd={settings.allowMessageReactions ? handleReactionAdd : undefined}
        onReactionRemove={settings.allowMessageReactions ? handleReactionRemove : undefined}
        onMessageInView={showMessagesAroundSerial}
        onViewLatest={showLatestMessages}
      >
        {enableTypingIndicators && <TypingIndicators className="px-4" />}
      </ChatMessageList>

      {/* Footer */}
      <ChatWindowFooter>
        <div className="flex-1">
          <MessageInput
            onSend={handleSendMessage}
            placeholder={`Message ${roomName}...`}
            aria-label={`Send message to ${roomName}`}
          />
        </div>
        {customFooterContent}
      </ChatWindowFooter>
    </div>
  );
};

ChatWindow.displayName = 'ChatWindow';
