import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChatMessageList, MessageInput, TypingIndicators } from '../molecules';
import { useChatClient, useMessages, usePresence } from '@ably/chat/react';
import { useChatSettings } from '../../context';
import {
  ChatMessageAction,
  ChatMessageEvent,
  ChatMessageEventType,
  ErrorInfo,
  Message,
  MessageReactionSummaryEvent,
  MessageReactionType,
  PaginatedResult,
} from '@ably/chat';
import clsx from 'clsx';
import { ActiveChatWindowFooter } from './ActiveChatWindowFooter.tsx';
import { ActiveChatWindowHeader } from './ActiveChatWindowHeader.tsx';

/**
 * Props for the ChatWindow component
 */
export interface ActiveChatWindowProps {
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
   * Initial number of messages to load when entering the room.
   * Controls the first batch of message history fetched from the server.
   *
   * Performance considerations:
   * - Higher values provide more context but increase initial load time
   * - Lower values load faster but may require more pagination
   * - Set to 0 to disable automatic history loading entirely
   *
   * @default 20
   *
   * @example
   * // Load more history for important rooms
   * initialHistoryLimit={50}
   *
   * @example
   * // Disable auto-loading for performance
   * initialHistoryLimit={0}
   */
  initialHistoryLimit?: number;

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
 *
 * @example
 * // Basic usage
 * <ChatWindow roomName="general" />
 *
 * @example
 * // With custom header and footer
 * <ChatWindow
 *   roomName="support"
 *   customHeaderContent={<RoomInfo />}
 *   customFooterContent={<ReactionPicker />}
 * />
 */
export const ActiveChatWindow: React.FC<ActiveChatWindowProps> = ({
  roomName,
  customHeaderContent,
  customFooterContent,
  initialHistoryLimit = 20,
  className,
}) => {
  // Message state management
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasBackfilled, setHasBackfilled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);

  // Performance optimization refs
  const messageSerialsRef = useRef<Set<string>>(new Set());
  const oldestMessageRef = useRef<Message | undefined>();

  // Ably Chat hooks
  const { clientId } = useChatClient();
  usePresence(); // Enter presence on mount

  /**
   * Binary search to find message index by serial for O(log n) performance
   * Messages are kept sorted by serial for efficient lookups
   *
   * @param messages - Sorted array of messages to search
   * @param targetSerial - The serial number to find
   * @returns Index of the message, or -1 if not found
   */
  const findMessageIndex = useCallback((messages: Message[], targetSerial: string): number => {
    let left = 0;
    let right = messages.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midSerial = messages[mid].serial;

      if (midSerial === targetSerial) {
        return mid;
      } else if (midSerial < targetSerial) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return -1; // Not found
  }, []);

  /**
   * Binary search to find optimal insertion position for new messages
   * Maintains chronological order while providing O(log n) performance
   *
   * @param messages - Current sorted messages array
   * @param newMessage - Message to insert
   * @returns Index where the new message should be inserted
   */
  const findInsertionIndex = useCallback((messages: Message[], newMessage: Message): number => {
    let left = 0;
    let right = messages.length;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);

      if (newMessage.before(messages[mid])) {
        right = mid;
      } else {
        left = mid + 1;
      }
    }

    return left;
  }, []);

  /**
   * Efficiently handles adding and updating messages with deduplication
   * Optimized for performance with large message sets using binary search
   *
   * Algorithm Features:
   * - O(1) duplicate detection using Set
   * - O(log n) insertion position finding
   * - Batch processing for multiple messages
   * - Automatic state cleanup and consistency
   *
   * @param newMessages - Array of messages to add or update
   * @param prepend - Whether to prepend messages (for history loading)
   */
  const handleMessageUpdates = useCallback(
    (newMessages: Message[], prepend = false) => {
      if (newMessages.length === 0) return;

      setMessages((prevMessages) => {
        // Auto-clear: if messages array is empty, clear the Set for consistency
        if (prevMessages.length === 0 && messageSerialsRef.current.size > 0) {
          messageSerialsRef.current.clear();
        }

        let updatedMessages = [...prevMessages];
        let hasChanges = false;

        for (const newMessage of newMessages) {
          // Fast O(1) existence check using Set
          const exists = messageSerialsRef.current.has(newMessage.serial);

          if (!exists) {
            // Case 1: New message - find optimal insertion position
            if (prepend && newMessage.before(updatedMessages[0])) {
              // For prepend (history loading), messages are pre-sorted
              // Just prepend for efficiency since they're already ordered
              updatedMessages.unshift(newMessage);
            } else {
              // For append or race condition scenarios, use binary search
              const insertIndex = findInsertionIndex(updatedMessages, newMessage);
              updatedMessages = [
                ...updatedMessages.slice(0, insertIndex),
                newMessage,
                ...updatedMessages.slice(insertIndex),
              ];
            }
            // Track message serial for future duplicate detection
            messageSerialsRef.current.add(newMessage.serial);
            hasChanges = true;
          } else {
            // Case 2.1: Message exists but this is not an update operation
            if (newMessage.action === ChatMessageAction.MessageCreate) {
              continue; // Skip - no-op for duplicate creates
            }

            // Case 2.2: Message exists and needs updating (edit/delete/etc.)
            const existingIndex = findMessageIndex(updatedMessages, newMessage.serial);

            if (existingIndex === -1) {
              console.error('Message exists in tracking set but not in array:', newMessage.serial);
              continue;
            }

            const existingMessage = updatedMessages[existingIndex];
            const updatedMessage = existingMessage.with(newMessage);

            // Skip update if no actual change occurred
            if (existingMessage === updatedMessage) {
              continue;
            }

            updatedMessages[existingIndex] = updatedMessage;
            hasChanges = true;
          }
        }

        // Optimization: return same reference if no changes to prevent re-renders
        if (!hasChanges) {
          return prevMessages;
        }

        // Update oldest message reference for pagination
        if (updatedMessages.length > 0) {
          oldestMessageRef.current = updatedMessages[0];
        }

        return updatedMessages;
      });
    },
    [findMessageIndex, findInsertionIndex]
  );

  /**
   * Handles real-time reaction updates for messages
   * Uses binary search for efficient message lookup and updates
   *
   * @param reaction - The reaction summary event from Ably
   */
  const handleReactionUpdate = useCallback(
    (reaction: MessageReactionSummaryEvent) => {
      setMessages((prevMessages) => {
        const messageSerial = reaction.summary.messageSerial;

        // Quick existence check before expensive operations
        const exists = messageSerialsRef.current.has(messageSerial);
        if (!exists) {
          return prevMessages; // Message not found, no-op
        }

        // Use binary search to find the target message
        const existingIndex = findMessageIndex(prevMessages, messageSerial);
        if (existingIndex === -1) {
          console.error('Message exists in tracking set but not in array:', messageSerial);
          return prevMessages;
        }

        const existingMessage = prevMessages[existingIndex];
        const updatedMessage = existingMessage.with(reaction);

        // Skip update if no actual change occurred
        if (updatedMessage === existingMessage) {
          return prevMessages;
        }

        const updatedArray = [...prevMessages];
        updatedArray[existingIndex] = updatedMessage;
        return updatedArray;
      });
    },
    [findMessageIndex]
  );

  // Initialize Ably Chat messages hook with event listeners
  const {
    send,
    deleteMessage,
    update,
    sendReaction,
    deleteReaction,
    historyBeforeSubscribe,
    history,
  } = useMessages({
    /**
     * Real-time message event listener
     * Handles create, update, and delete events from other users
     */
    listener: (event: ChatMessageEvent) => {
      const message = event.message;
      switch (event.type) {
        case ChatMessageEventType.Created:
        case ChatMessageEventType.Updated:
        case ChatMessageEventType.Deleted:
          handleMessageUpdates([message]);
          break;
        default:
          console.error('Unknown message event type:', event);
      }
    },
    /**
     * Real-time reaction event listener
     * Handles emoji reactions added/removed by other users
     */
    reactionsListener: handleReactionUpdate,
    /**
     * Discontinuity recovery handler
     * Triggered when connection is restored after interruption
     */
    onDiscontinuity: () => {
      console.warn('Discontinuity detected - starting message recovery');
      // Clear all state and restart message loading
      setMessages([]);
      setHasBackfilled(false);
      setLoading(true);
      messageSerialsRef.current.clear();
      // Restart history backfill process
      backfillPreviousMessages(historyBeforeSubscribe, initialHistoryLimit);
    },
  });

  /**
   * Loads initial message history when joining a room
   * Called once per room to establish initial context
   *
   * @param historyBeforeSubscribe - Ably function to fetch pre-subscription history
   * @param limit - Number of messages to fetch
   */
  const backfillPreviousMessages = useCallback(
    (
      historyBeforeSubscribe: ReturnType<typeof useMessages>['historyBeforeSubscribe'],
      limit: number = initialHistoryLimit
    ) => {
      if (historyBeforeSubscribe) {
        historyBeforeSubscribe({ limit })
          .then((result: PaginatedResult<Message>) => {
            // Reverse messages to maintain chronological order (oldest first)
            const reversedMessages = result.items.reverse();
            handleMessageUpdates(reversedMessages);
            setHasMoreHistory(result.hasNext());
            setLoading(false);
          })
          .catch((error: ErrorInfo) => {
            console.error(`Failed to backfill previous messages: ${error.toString()}`, error);
            setLoading(false);
          });
      }
    },
    [initialHistoryLimit, handleMessageUpdates]
  );

  /**
   * Loads additional message history for infinite scroll
   * Triggered by user scrolling to top of message list
   */
  const loadMoreHistory = useCallback(async () => {
    if (!history || loadingHistory || !hasMoreHistory) {
      return;
    }

    setLoadingHistory(true);

    try {
      // Get timestamp of oldest message for pagination
      const oldestTimestamp = oldestMessageRef.current?.createdAt?.getTime();

      // Fetch additional history before the oldest message
      const result = await history({
        end: oldestTimestamp,
        limit: 50, // Load in reasonable chunks
      });

      if (result.items.length === 0) {
        setHasMoreHistory(false);
      } else {
        // Reverse and prepend new messages
        const reversedMessages = result.items.reverse();
        handleMessageUpdates(reversedMessages, true);
        setHasMoreHistory(result.hasNext());
      }
    } catch (error) {
      console.error('Failed to load more history:', error);
    } finally {
      setLoadingHistory(false);
    }
  }, [loadingHistory, hasMoreHistory, history, handleMessageUpdates]);

  /**
   * Effect to trigger initial history loading
   * Ensures history is loaded exactly once per room
   */
  useEffect(() => {
    if (historyBeforeSubscribe && !hasBackfilled && loading) {
      backfillPreviousMessages(historyBeforeSubscribe);
      setHasBackfilled(true);
    }
  }, [historyBeforeSubscribe, backfillPreviousMessages, hasBackfilled, loading]);

  /**
   * Handles local message updates from REST operations
   * Used for optimistic updates after edit/delete operations
   *
   * @param updatedMessage - The updated message from the server
   */
  const handleRESTMessageUpdate = useCallback(
    (updatedMessage: Message) => {
      handleMessageUpdates([updatedMessage]);
    },
    [handleMessageUpdates]
  );

  /**
   * Handles message editing operations
   * Performs optimistic update and syncs with server
   *
   * @param message - Original message to edit
   * @param newText - New text content
   */
  const handleMessageEdit = useCallback(
    async (message: Message, newText: string) => {
      try {
        const updatedMessage = message.copy({
          text: newText,
          metadata: message.metadata,
          headers: message.headers,
        });

        const result = await update(message.serial, updatedMessage);
        if (result) {
          handleRESTMessageUpdate(result);
        }
      } catch (error) {
        console.error('Failed to edit message:', error);
        // TODO: Show user-friendly error notification
      }
    },
    [update, handleRESTMessageUpdate]
  );

  /**
   * Handles message deletion operations
   * Performs soft delete with metadata preservation
   *
   * @param message - Message to delete
   */
  const handleMessageDelete = useCallback(
    async (message: Message) => {
      try {
        const result = await deleteMessage(message, {
          description: 'deleted by user',
        });
        if (result) {
          handleRESTMessageUpdate(result);
        }
      } catch (error) {
        console.error('Failed to delete message:', error);
        // TODO: Show user-friendly error notification
      }
    },
    [deleteMessage, handleRESTMessageUpdate]
  );

  /**
   * Handles adding emoji reactions to messages
   *
   * @param message - Target message for reaction
   * @param emoji - Emoji character to add
   */
  const handleReactionAdd = useCallback(
    async (message: Message, emoji: string) => {
      try {
        await sendReaction(message, {
          type: MessageReactionType.Distinct,
          name: emoji,
        });
      } catch (error) {
        console.error('Failed to add reaction:', error);
        // TODO: Show user-friendly error notification
      }
    },
    [sendReaction]
  );

  /**
   * Handles removing emoji reactions from messages
   *
   * @param message - Target message for reaction removal
   * @param emoji - Emoji character to remove
   */
  const handleReactionRemove = useCallback(
    async (message: Message, emoji: string) => {
      try {
        await deleteReaction(message, {
          type: MessageReactionType.Distinct,
          name: emoji,
        });
      } catch (error) {
        console.error('Failed to remove reaction:', error);
        // TODO: Show user-friendly error notification
      }
    },
    [deleteReaction]
  );

  /**
   * Handles sending new messages to the room
   *
   * @param text - Message text content
   */
  const handleSendMessage = useCallback(
    async (text: string) => {
      try {
        await send({ text: text.trim() });
      } catch (error) {
        console.error('Failed to send message:', error);
        // TODO: Show user-friendly error notification
      }
    },
    [send]
  );

  // Get room-specific chat settings from context
  const { getEffectiveSettings } = useChatSettings();
  const settings = getEffectiveSettings(roomName);

  return (
    <div
      className={clsx('flex flex-col h-full bg-white dark:bg-gray-900 flex-1', className)}
      role="main"
      aria-label={`Chat room: ${roomName}`}
    >
      {/* Chat Header */}
      <ActiveChatWindowHeader>{customHeaderContent}</ActiveChatWindowHeader>

      {/* Message List with Typing Indicators */}
      <ChatMessageList
        messages={messages}
        currentClientId={clientId}
        isLoading={loading}
        onLoadMoreHistory={loadMoreHistory}
        hasMoreHistory={hasMoreHistory}
        onEdit={settings.allowMessageEdits ? handleMessageEdit : undefined}
        onDelete={settings.allowMessageDeletes ? handleMessageDelete : undefined}
        onReactionAdd={settings.allowMessageReactions ? handleReactionAdd : undefined}
        onReactionRemove={settings.allowMessageReactions ? handleReactionRemove : undefined}
      >
        <TypingIndicators className="px-4 py-2" />
      </ChatMessageList>

      {/* Chat Footer with Message Input */}
      <ActiveChatWindowFooter>
        <div className="flex-1">
          <MessageInput
            onSend={handleSendMessage}
            placeholder={`Message ${roomName}...`}
            aria-label={`Send message to ${roomName}`}
          />
        </div>
        {customFooterContent}
      </ActiveChatWindowFooter>
    </div>
  );
};

// Set display name for better debugging experience
ActiveChatWindow.displayName = 'ActiveChatWindow';
