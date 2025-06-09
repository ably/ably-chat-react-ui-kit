import React, { useCallback, useEffect, useState, useRef } from 'react';
import TypingIndicators from '../molecules/TypingIndicators';
import { ChatMessageList } from '../molecules';
import ChatWindowHeader from './ChatWindowHeader';
import ChatWindowFooter from './ChatWindowFooter';
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
import MessageInput from '../molecules/MessageInput.tsx';

/**
 * Interface representing the props for the ChatWindow component.
 *
 * @property roomId - A unique identifier for the chat room. This is a required property.
 * @property customHeaderContent - Optional custom content to render in the header of the chat window. Accepts a ReactNode.
 * @property customFooterContent - Optional custom content to render in the footer of the chat window. Accepts a ReactNode.
 * @property initialHistoryLimit - Optional initial limit for the number of messages to fetch when the chat window loads. Defaults to 20 messages. Set to 0 to disable initial history loading.
 */
interface ChatWindowProps {
  roomId: string;
  customHeaderContent?: React.ReactNode;
  customFooterContent?: React.ReactNode;
  initialHistoryLimit?: number;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  roomId,
  customHeaderContent,
  customFooterContent,
  initialHistoryLimit = 10,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasBackfilled, setHasBackfilled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const messageSerialsRef = useRef<Set<string>>(new Set());
  const { clientId } = useChatClient();
  const { room } = useRoom();
  usePresence();

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

  // Handle adding/updating a single message
  const handleMessageUpdate = useCallback(
    (newMessage: Message) => {
      setMessages((prevMessages) => {
        // Auto-clear detection: if messages array is empty, clear the Set
        if (prevMessages.length === 0 && messageSerialsRef.current.size > 0) {
          console.log('Messages array is empty but Set has data, clearing Set');
          messageSerialsRef.current.clear();
        }

        // Fast existence check with Set
        const exists = messageSerialsRef.current.has(newMessage.serial);

        if (!exists) {
          // Case 1: New message - find insertion position with binary search
          const insertIndex = findInsertionIndex(prevMessages, newMessage);

          console.log('Adding new message', newMessage.serial, 'at index', insertIndex);

          const updatedMessages = [
            ...prevMessages.slice(0, insertIndex),
            newMessage,
            ...prevMessages.slice(insertIndex),
          ];

          // Add to set after successful state creation
          messageSerialsRef.current.add(newMessage.serial);

          return updatedMessages;
        }

        // Case 2: Message exists - find it with binary search
        const existingIndex = findMessageIndex(prevMessages, newMessage.serial);

        if (existingIndex === -1) {
          console.warn('Message exists in set but not in array:', newMessage.serial);
          return prevMessages;
        }

        const existingMessage = prevMessages[existingIndex];
        const updatedMessage = existingMessage.with(newMessage);

        if (updatedMessage === existingMessage) {
          return prevMessages;
        }

        const updatedMessages = [...prevMessages];
        updatedMessages[existingIndex] = updatedMessage;
        return updatedMessages;
      });
    },
    [findMessageIndex, findInsertionIndex]
  );

  // Handle adding multiple messages (for history loading)
  const handleBulkMessagesUpdate = useCallback((newMessages: Message[], prepend = false) => {
    setMessages((prevMessages) => {
      // Auto-clear detection: if messages array is empty, clear the Set
      if (prevMessages.length === 0 && messageSerialsRef.current.size > 0) {
        console.log('Messages array is empty but Set has data, clearing Set');
        messageSerialsRef.current.clear();
      }

      // Filter using Set for O(1) lookups
      const filteredNewMessages = newMessages.filter((newMsg) => {
        const exists = messageSerialsRef.current.has(newMsg.serial);
        if (exists) {
          console.log('Message already exists:', newMsg.serial);
        }
        return !exists;
      });

      if (filteredNewMessages.length === 0) {
        return prevMessages;
      }

      let updatedMessages: Message[];

      if (prepend) {
        updatedMessages = [...filteredNewMessages, ...prevMessages];
      } else {
        updatedMessages = [...prevMessages, ...filteredNewMessages];
        updatedMessages.sort((a, b) => (a.before(b) ? -1 : 1));
      }

      // Add new serials to set
      filteredNewMessages.forEach((msg) => {
        messageSerialsRef.current.add(msg.serial);
      });

      return updatedMessages;
    });
  }, []);

  // Handle reaction updates
  // TODO: Add existence check for reaction summary
  const handleReactionUpdate = useCallback(
    (reaction: MessageReactionSummaryEvent) => {
      setMessages((prevMessages) => {
        const messageSerial = reaction.summary.messageSerial;

        // Use binary search to find the message
        const existingIndex = findMessageIndex(prevMessages, messageSerial);

        if (existingIndex === -1) {
          console.warn('Reaction update for non-existent message:', messageSerial);
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

  const { send, deleteMessage, update, sendReaction, deleteReaction, historyBeforeSubscribe } =
    useMessages({
      listener: (event: ChatMessageEvent) => {
        const message = event.message;
        switch (event.type) {
          case ChatMessageEventType.Created:
          case ChatMessageEventType.Updated:
          case ChatMessageEventType.Deleted:
            handleMessageUpdate(message);
            break;
          default:
            console.error('Unknown message event', event);
        }
      },
      reactionsListener: handleReactionUpdate,
      onDiscontinuity: () => {
        console.log('Discontinuity detected');
        handleDiscontinuity();
      },
    });

  useEffect(() => {
    room?.attach();
  }, [room]);

  // If you want the logging, add it to the first effect:
  useEffect(() => {
    console.log('ChatWindow: Room ID changed to', roomId);
    // Clear messages and reset state when roomId changes
    setMessages([]);
    setLoading(true);
    setLoadingHistory(false);
    setHasMoreHistory(true);
    setHasBackfilled(false);
  }, [roomId]); // Only roomId dependency

  const backfillPreviousMessages = useCallback(
    (
      historyBeforeSubscribe: ReturnType<typeof useMessages>['historyBeforeSubscribe'],
      limit: number = initialHistoryLimit
    ) => {
      if (historyBeforeSubscribe) {
        historyBeforeSubscribe({ limit })
          .then((result: PaginatedResult<Message>) => {
            console.log('Backfilling previous messages:', result.items.length);
            console.log('Has next:', result.hasNext());
            const reversedMessages = result.items.reverse();
            handleBulkMessagesUpdate(reversedMessages, false);
            setHasMoreHistory(result.hasNext());
            setLoading(false);
          })
          .catch((error: ErrorInfo) => {
            console.error(`Failed to backfill previous messages: ${error.toString()}`, error);
            setLoading(false);
          });
      }
    },
    [initialHistoryLimit, handleBulkMessagesUpdate]
  );

  const loadMoreHistory = useCallback(async () => {
    if (!historyBeforeSubscribe || loadingHistory || !hasMoreHistory) {
      return;
    }

    setLoadingHistory(true);

    // Use current messages state safely
    setMessages((currentMessages) => {
      const oldestMessage = currentMessages.length > 0 ? currentMessages[0] : undefined;

      console.log(oldestMessage?.timestamp?.getTime());
      // Perform the async operation
      historyBeforeSubscribe({
        limit: 50,
        end: oldestMessage?.timestamp?.getTime(),
      })
        .then((result: PaginatedResult<Message>) => {
          if (result.items.length === 0) {
            console.log('No more history to load');
            setHasMoreHistory(false);
            return currentMessages; // Return unchanged messages
          } else {
            const reversedMessages = result.items.reverse();
            console.log('Has next:', result.hasNext());
            handleBulkMessagesUpdate(reversedMessages, true);
          }
        })
        .catch((error) => {
          console.error('Failed to load more history:', error);
        })
        .finally(() => {
          setLoadingHistory(false);
        });

      // Return unchanged messages
      return currentMessages;
    });
  }, [historyBeforeSubscribe, loadingHistory, hasMoreHistory, handleBulkMessagesUpdate]);

  // TODO: We have to load all messages and check their versions, as history will return the latest version,
  // so it's not enough to just check the serials.
  const handleDiscontinuity = useCallback(async () => {
    if (!historyBeforeSubscribe) {
      setMessages([]);
      backfillPreviousMessages(historyBeforeSubscribe);
      return;
    }

    setMessages((currentMessages) => {
      if (currentMessages.length === 0) {
        backfillPreviousMessages(historyBeforeSubscribe);
        return currentMessages;
      }

      // Perform async recovery
      const latestMessage = currentMessages[currentMessages.length - 1];
      const missedMessages: Message[] = [];

      const recoverMessages = async () => {
        try {
          let hasMore = true;
          let startFrom = latestMessage.timestamp;

          while (hasMore) {
            const result = await historyBeforeSubscribe({
              start: startFrom?.getTime(),
              limit: 100,
            });

            if (result.items.length === 0) {
              hasMore = false;
              break;
            }

            // Filter out messages we already have using Set
            const newMessages = result.items.filter(
              (msg) => !messageSerialsRef.current.has(msg.serial)
            );

            missedMessages.unshift(...newMessages);
            hasMore = result.hasNext();

            if (hasMore && result.items.length > 0) {
              startFrom = result.items[0].timestamp;
            }
          }

          if (missedMessages.length > 0) {
            handleBulkMessagesUpdate(missedMessages, false);
          }
        } catch (error) {
          console.error('Failed to recover missed messages:', error);
          setMessages([]);
          backfillPreviousMessages(historyBeforeSubscribe);
        }
      };

      recoverMessages();
      return currentMessages;
    });
  }, [historyBeforeSubscribe, backfillPreviousMessages, handleBulkMessagesUpdate]);

  // Update the backfill effect to be more defensive:
  useEffect(() => {
    // Add a small delay to ensure state has settled
    if (historyBeforeSubscribe && !hasBackfilled && loading) {
      console.log('Starting backfill, hasBackfilled:', hasBackfilled);
      backfillPreviousMessages(historyBeforeSubscribe);
      setHasBackfilled(true);
    }
  }, [historyBeforeSubscribe, backfillPreviousMessages, hasBackfilled, loading]);

  // Rest of the handlers remain the same...
  const handleRESTMessageUpdate = useCallback(
    (updatedMessage: Message) => {
      handleMessageUpdate(updatedMessage);
    },
    [handleMessageUpdate]
  );

  const handleMessageEdit = useCallback(
    async (messageSerial: string, newText: string) => {
      try {
        // Find message using binary search
        const existingIndex = findMessageIndex(messages, messageSerial);
        if (existingIndex === -1) return;

        const message = messages[existingIndex];
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
    [messages, update, handleRESTMessageUpdate, findMessageIndex]
  );

  const handleMessageDelete = useCallback(
    async (messageSerial: string) => {
      try {
        // Find message using binary search
        const existingIndex = findMessageIndex(messages, messageSerial);
        if (existingIndex === -1) return;

        const message = messages[existingIndex];
        const result = await deleteMessage(message, { description: 'deleted by user' });
        if (result) {
          handleRESTMessageUpdate(result);
        }
      } catch (error) {
        console.error('Failed to delete message:', error);
      }
    },
    [messages, deleteMessage, handleRESTMessageUpdate, findMessageIndex]
  );

  const handleReactionAdd = useCallback(
    async (messageSerial: string, emoji: string) => {
      try {
        // Find message using binary search
        const existingIndex = findMessageIndex(messages, messageSerial);
        if (existingIndex === -1) return;

        const message = messages[existingIndex];
        await sendReaction(message, { type: MessageReactionType.Distinct, name: emoji });
      } catch (error) {
        console.error('Failed to add reaction:', error);
      }
    },
    [messages, sendReaction, findMessageIndex]
  );

  const handleReactionRemove = useCallback(
    async (messageSerial: string, emoji: string) => {
      try {
        // Find message using binary search
        const existingIndex = findMessageIndex(messages, messageSerial);
        if (existingIndex === -1) return;

        const message = messages[existingIndex];
        await deleteReaction(message, { type: MessageReactionType.Distinct, name: emoji });
      } catch (error) {
        console.error('Failed to remove reaction:', error);
      }
    },
    [messages, deleteReaction, findMessageIndex]
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
