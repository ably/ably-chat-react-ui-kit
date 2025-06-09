import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TypingIndicators } from '../molecules';
import { ChatMessageList } from '../molecules';
import { ChatWindowHeader } from './ChatWindowHeader';
import { ChatWindowFooter } from './ChatWindowFooter';
import { useChatClient, useMessages, usePresence, useRoom } from '@ably/chat/react';
import {
  ChatMessageEvent,
  ChatMessageEventType,
  ErrorInfo,
  Message,
  MessageReactionSummaryEvent,
  MessageReactionType,
  PaginatedResult,
} from '@ably/chat';
import { MessageInput } from '../molecules';

/**
 * Interface representing the props for the ChatWindow component.
 *
 * @property roomId - A unique identifier for the chat room. This is a required property.
 * @property customHeaderContent - Optional custom content to render in the header of the chat window. Accepts a ReactNode.
 * @property customFooterContent - Optional custom content to render in the footer of the chat window. Accepts a ReactNode.
 * @property initialHistoryLimit - Optional initial limit for the number of messages to fetch when the chat window loads. Defaults to 20 messages. Set to 0 to disable initial history loading.
 */
export interface ChatWindowProps {
  roomId: string;
  customHeaderContent?: React.ReactNode;
  customFooterContent?: React.ReactNode;
  initialHistoryLimit?: number;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  roomId,
  customHeaderContent,
  customFooterContent,
  initialHistoryLimit = 20,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasBackfilled, setHasBackfilled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const messageSerialsRef = useRef<Set<string>>(new Set());
  const oldestMessageRef = useRef<Message | undefined>();
  const { clientId } = useChatClient();
  const { room } = useRoom();
  usePresence();

  // Ensure room is re-attaches if not already attached, and the state is reset when roomId changes.
  useEffect(() => {
    room?.attach();
    // Clear messages and reset state when room changes
    setMessages([]);
    setLoading(true);
    setLoadingHistory(false);
    setHasMoreHistory(true);
    setHasBackfilled(false);
    // Clear message serials to prevent memory leaks when room changes
    messageSerialsRef.current.clear();
  }, [room]); // Only room dependency

  // Binary search to find message index by serial (since messages are sorted)
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

  // Binary search to find insertion position for a new message
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

  // Handle adding/updating messages
  // TODO: Identify further optimizations for performance at larger scales 2000+ messages
  const handleMessageUpdates = useCallback(
    (newMessages: Message[], prepend = false) => {
      if (newMessages.length === 0) return;

      setMessages((prevMessages) => {
        // Auto-clear: if messages array is empty, clear the Set
        if (prevMessages.length === 0 && messageSerialsRef.current.size > 0) {
          messageSerialsRef.current.clear();
        }

        let updatedMessages = [...prevMessages];
        let hasChanges = false;

        for (const newMessage of newMessages) {
          // Fast existence check with Set
          const exists = messageSerialsRef.current.has(newMessage.serial);

          if (!exists) {
            // Case 1: New message - find insertion position with binary search
            if (prepend && newMessage.before(updatedMessages[0])) {
              // For prepend (history loading), messages are already in correct order
              // from historyBeforeSubscribe (reversed from newest-to-oldest to oldest-to-newest)
              // and fetched up to the oldest message we have, so just prepend them
              updatedMessages.unshift(newMessage);
            } else {
              // For append, or if prepend message is no longer the oldest due to race conditions
              // (new messages arrived while history was loading), find proper insertion position
              const insertIndex = findInsertionIndex(updatedMessages, newMessage);
              updatedMessages = [
                ...updatedMessages.slice(0, insertIndex),
                newMessage,
                ...updatedMessages.slice(insertIndex),
              ];
            }
            // Add to set after successful state creation
            messageSerialsRef.current.add(newMessage.serial);
            hasChanges = true;
          } else {
            // Case 2.1: Message exists - but the new message is not an update/delete
            if (newMessage.action === 'message.create') {
              continue; // No-op if it's a create action but already exists
            }

            // Case 2.2: Message exists - find it with binary search to see if it needs updating
            const existingIndex = findMessageIndex(updatedMessages, newMessage.serial);

            if (existingIndex === -1) {
              console.error('Message exists in set but not in array:', newMessage.serial);
              continue;
            }

            const existingMessage = updatedMessages[existingIndex];
            const updatedMessage = existingMessage.with(newMessage);

            // if no change, do nothing
            if (existingMessage === updatedMessage) {
              continue;
            }
            updatedMessages[existingIndex] = updatedMessage;
            hasChanges = true;
          }
        }
        // If no changes were made, return the previous messages array
        if (!hasChanges) {
          return prevMessages;
        }
        // Update oldest message reference
        if (updatedMessages.length > 0) {
          oldestMessageRef.current = updatedMessages[0];
        }
        return updatedMessages;
      });
    },
    [findMessageIndex, findInsertionIndex]
  );

  // Handle reaction updates
  const handleReactionUpdate = useCallback(
    (reaction: MessageReactionSummaryEvent) => {
      setMessages((prevMessages) => {
        // Check if the reaction summary exists in the current messages.
        const messageSerial = reaction.summary.messageSerial;
        const exists = messageSerialsRef.current.has(reaction.summary.messageSerial);
        if (!exists) {
          return prevMessages; // Message not found, no-op
        }
        // Use binary search to find the message
        const existingIndex = findMessageIndex(prevMessages, messageSerial);
        if (existingIndex === -1) {
          console.error('Message not found in messages array:', messageSerial);
          return prevMessages; // Message not found, no-op
        }
        const existingMessage = prevMessages[existingIndex];
        const updatedMessage = existingMessage.with(reaction);

        if (updatedMessage === existingMessage) {
          return prevMessages; // No change
        }

        const updatedArray = [...prevMessages];
        updatedArray[existingIndex] = updatedMessage;
        return updatedArray;
      });
    },
    [findMessageIndex]
  );

  const {
    send,
    deleteMessage,
    update,
    sendReaction,
    deleteReaction,
    historyBeforeSubscribe,
    history,
  } = useMessages({
    listener: (event: ChatMessageEvent) => {
      const message = event.message;
      switch (event.type) {
        case ChatMessageEventType.Created:
        case ChatMessageEventType.Updated:
        case ChatMessageEventType.Deleted:
          handleMessageUpdates([message]);
          break;
        default:
          console.error('Unknown message event', event);
      }
    },
    reactionsListener: handleReactionUpdate,
    onDiscontinuity: () => {
      console.warn('Discontinuity detected - starting message recovery');
      // clear all messages and reset state
      setMessages([]);
      // Reset backfill state
      setHasBackfilled(false);
      setLoading(true);
      // Reset history state
      backfillPreviousMessages(historyBeforeSubscribe, initialHistoryLimit);
    },
  });

  const backfillPreviousMessages = useCallback(
    (
      historyBeforeSubscribe: ReturnType<typeof useMessages>['historyBeforeSubscribe'],
      limit: number = initialHistoryLimit
    ) => {
      if (historyBeforeSubscribe) {
        historyBeforeSubscribe({ limit })
          .then((result: PaginatedResult<Message>) => {
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

  const loadMoreHistory = useCallback(async () => {
    if (!history || loadingHistory || !hasMoreHistory) {
      return;
    }
    setLoadingHistory(true);
    try {
      // Get the oldest message timestamp outside of setState
      const oldestTimestamp = oldestMessageRef.current?.createdAt?.getTime();
      // Perform the async operation
      const result = await history({
        end: oldestTimestamp,
        limit: 50,
      });
      if (result.items.length === 0) {
        setHasMoreHistory(false);
      } else {
        const reversedMessages = result.items.reverse();
        // Update messages with the new history
        handleMessageUpdates(reversedMessages, true);
        // Update hasMoreHistory based on whether there are more pages
        setHasMoreHistory(result.hasNext());
      }
    } catch (error) {
      console.error('Failed to load more history:', error);
    } finally {
      setLoadingHistory(false);
    }
  }, [loadingHistory, hasMoreHistory, history, handleMessageUpdates]);

  // Update the backfill effect to be more defensive:
  useEffect(() => {
    if (historyBeforeSubscribe && !hasBackfilled && loading) {
      backfillPreviousMessages(historyBeforeSubscribe);
      setHasBackfilled(true);
    }
  }, [historyBeforeSubscribe, backfillPreviousMessages, hasBackfilled, loading]);

  // Handle REST message updates from local operations
  const handleRESTMessageUpdate = useCallback(
    (updatedMessage: Message) => {
      handleMessageUpdates([updatedMessage]);
    },
    [handleMessageUpdates]
  );

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
      }
    },
    [update, handleRESTMessageUpdate]
  );

  const handleMessageDelete = useCallback(
    async (message: Message) => {
      try {
        const result = await deleteMessage(message, { description: 'deleted by user' });
        if (result) {
          handleRESTMessageUpdate(result);
        }
      } catch (error) {
        console.error('Failed to delete message:', error);
      }
    },
    [deleteMessage, handleRESTMessageUpdate]
  );

  const handleReactionAdd = useCallback(
    async (message: Message, emoji: string) => {
      try {
        await sendReaction(message, { type: MessageReactionType.Distinct, name: emoji });
      } catch (error) {
        console.error('Failed to add reaction:', error);
      }
    },
    [sendReaction]
  );

  const handleReactionRemove = useCallback(
    async (message: Message, emoji: string) => {
      try {
        await deleteReaction(message, { type: MessageReactionType.Distinct, name: emoji });
      } catch (error) {
        console.error('Failed to remove reaction:', error);
      }
    },
    [deleteReaction]
  );

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (text.trim()) {
        try {
          await send({ text: text.trim() });
        } catch (error) {
          console.error('Failed to send message:', error);
        }
      }
    },
    [send]
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 flex-1">
      <ChatWindowHeader>{customHeaderContent}</ChatWindowHeader>
      <ChatMessageList
        messages={messages}
        currentClientId={clientId}
        isLoading={loading}
        onLoadMoreHistory={loadMoreHistory}
        hasMoreHistory={hasMoreHistory}
        onEdit={handleMessageEdit}
        onDelete={handleMessageDelete}
        onReactionAdd={handleReactionAdd}
        onReactionRemove={handleReactionRemove}
      >
        <TypingIndicators className="px-4 py-2" />
      </ChatMessageList>
      <ChatWindowFooter>
        <div className="flex-1">
          <MessageInput onSend={handleSendMessage} placeholder={`Message ${roomId}...`} />
        </div>
        {customFooterContent}
      </ChatWindowFooter>
    </div>
  );
};
