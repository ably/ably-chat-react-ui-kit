import React, { useCallback, useEffect, useState } from 'react';
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
  initialHistoryLimit?: number; // Default to 20 messages
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  roomId,
  customHeaderContent,
  customFooterContent,
  initialHistoryLimit = 20,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const { clientId } = useChatClient();
  const { room } = useRoom();
  usePresence();

  useEffect(() => {
    // attach the room when the component renders
    // detaching and release is handled in the sidebar for now.
    // TODO: Remove once the ChatClientProvider has room reference counts implemented
    room?.attach();
  }, [room]);

  // Handle messages using the useMessages hook with proper event handling
  const { send, deleteMessage, update, sendReaction, deleteReaction, historyBeforeSubscribe } =
    useMessages({
      listener: (event: ChatMessageEvent) => {
        const message = event.message;
        switch (event.type) {
          case ChatMessageEventType.Created: {
            setMessages((prevMessages) => {
              // if already exists do nothing
              const index = prevMessages.findIndex((other) => message.isSameAs(other));
              if (index !== -1) {
                return prevMessages;
              }

              // if the message is not in the list, make a new list that contains it
              const newArray = [...prevMessages, message];

              // and put it at the right place
              newArray.sort((a, b) => (a.before(b) ? -1 : 1));

              return newArray;
            });
            break;
          }
          case ChatMessageEventType.Updated:
          case ChatMessageEventType.Deleted: {
            setMessages((prevMessages) => {
              const index = prevMessages.findIndex((other) => message.isSameAs(other));
              if (index === -1) {
                return prevMessages;
              }

              const newMessage = prevMessages[index].with(event);

              // if no change, do nothing
              if (newMessage === prevMessages[index]) {
                return prevMessages;
              }

              // copy array and replace the message
              const updatedArray = prevMessages.slice();
              updatedArray[index] = newMessage;
              return updatedArray;
            });
            break;
          }
          default: {
            console.error('Unknown message event', event);
          }
        }
      },
      reactionsListener: (reaction: MessageReactionSummaryEvent) => {
        const messageSerial = reaction.summary.messageSerial;
        setMessages((prevMessages) => {
          const index = prevMessages.findIndex((m) => m.serial === messageSerial);
          if (index === -1) {
            return prevMessages;
          }

          const newMessage = prevMessages[index].with(reaction);

          // if no change, do nothing
          if (newMessage === prevMessages[index]) {
            return prevMessages;
          }

          // copy array and replace the message
          const updatedArray = prevMessages.slice();
          updatedArray[index] = newMessage;
          return updatedArray;
        });
      },
      onDiscontinuity: () => {
        console.log('Discontinuity detected');
        handleDiscontinuity();
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
            setMessages(result.items.reverse());
            setLoading(false);
          })
          .catch((error: ErrorInfo) => {
            console.error(`Failed to backfill previous messages: ${error.toString()}`, error);
            setLoading(false);
          });
      }
    },
    [initialHistoryLimit]
  );

  const loadMoreHistory = useCallback(async () => {
    if (!historyBeforeSubscribe || loadingHistory || !hasMoreHistory) {
      return;
    }

    setLoadingHistory(true);

    // get the first message in the messages array to determine the oldest message serial
    const oldestMessage = messages.length > 0 ? messages[0] : undefined;

    try {
      const result = await historyBeforeSubscribe({
        limit: 50,
        // If we have messages, start from the oldest one we have
        start: oldestMessage?.timestamp?.getUTCDate(),
      });

      if (result.items.length === 0) {
        setHasMoreHistory(false);
      } else {
        const newMessages = result.items.reverse();

        setMessages((prevMessages) => {
          // Prepend new messages to the beginning
          return [...newMessages, ...prevMessages];
        });

        // Check if there are more pages
        setHasMoreHistory(result.hasNext());
      }
    } catch (error) {
      console.error('Failed to load more history:', error);
    } finally {
      setLoadingHistory(false);
    }
  }, [historyBeforeSubscribe, loadingHistory, hasMoreHistory, messages]);

  const handleDiscontinuity = useCallback(async () => {
    if (!historyBeforeSubscribe || messages.length === 0) {
      // If no previous messages or no history function, just clear and reload
      setMessages([]);
      backfillPreviousMessages(historyBeforeSubscribe);
      return;
    }

    try {
      // Get the latest message we have
      const latestMessage = messages[messages.length - 1];
      const missedMessages: Message[] = [];

      // Fetch missed messages in batches
      let hasMore = true;
      let startFrom = latestMessage.timestamp;

      while (hasMore) {
        const result = await historyBeforeSubscribe({
          start: startFrom.getUTCDate(),
          limit: 100,
        });

        if (result.items.length === 0) {
          hasMore = false;
          break;
        }

        // Filter out messages we already have
        const newMessages = result.items.filter(
          (msg) => !messages.some((existingMsg) => existingMsg.isSameAs(msg))
        );

        missedMessages.unshift(...newMessages);

        // Check if we have more pages
        hasMore = result.hasNext();
        if (hasMore && result.items.length > 0) {
          // Update startFrom to the earliest message in this batch
          startFrom = result.items[0].timestamp;
        }
      }

      if (missedMessages.length > 0) {
        // Add missed messages to the existing messages
        setMessages((prevMessages) => {
          const combinedMessages = [...prevMessages, ...missedMessages];
          // Sort to ensure proper order
          combinedMessages.sort((a, b) => (a.before(b) ? -1 : 1));
          return combinedMessages;
        });
      }
    } catch (error) {
      console.error('Failed to recover missed messages:', error);
      // Fallback: clear and reload all messages
      setMessages([]);
      backfillPreviousMessages(historyBeforeSubscribe);
    }
  }, [messages, historyBeforeSubscribe, backfillPreviousMessages]);

  // Initial backfill when component mounts
  useEffect(() => {
    if (historyBeforeSubscribe) {
      backfillPreviousMessages(historyBeforeSubscribe);
    }
  }, [historyBeforeSubscribe, backfillPreviousMessages]);

  // Handle REST message updates for optimistic UI updates
  const handleRESTMessageUpdate = useCallback((updatedMessage: Message) => {
    setMessages((prevMessages) => {
      const index = prevMessages.findIndex((m) => m.serial === updatedMessage.serial);
      if (index === -1) {
        return prevMessages;
      }
      if (updatedMessage.version <= prevMessages[index].version) {
        return prevMessages;
      }
      const updatedArray = prevMessages.slice();
      updatedArray[index] = updatedMessage;
      return updatedArray;
    });
  }, []);

  // Message operation handlers
  const handleMessageEdit = useCallback(
    async (messageSerial: string, newText: string) => {
      try {
        const message = messages.find((m) => m.serial === messageSerial);
        if (!message) return;

        const updatedMessage = message.copy({
          text: newText,
          metadata: message.metadata,
          headers: message.headers,
        });

        const result = await update(message.serial, updatedMessage);

        // Apply optimistic update
        if (result) {
          handleRESTMessageUpdate(result);
        }
      } catch (error) {
        console.error('Failed to edit message:', error);
      }
    },
    [messages, update, handleRESTMessageUpdate]
  );

  const handleMessageDelete = useCallback(
    async (messageSerial: string) => {
      try {
        const message = messages.find((m) => m.serial === messageSerial);
        if (!message) return;

        const result = await deleteMessage(message, { description: 'deleted by user' });

        // Apply optimistic update
        if (result) {
          handleRESTMessageUpdate(result);
        }
      } catch (error) {
        console.error('Failed to delete message:', error);
      }
    },
    [messages, deleteMessage, handleRESTMessageUpdate]
  );

  const handleReactionAdd = useCallback(
    async (messageSerial: string, emoji: string) => {
      try {
        const message = messages.find((m) => m.serial === messageSerial);
        if (!message) return;

        await sendReaction(message, { type: MessageReactionType.Distinct, name: emoji });
      } catch (error) {
        console.error('Failed to add reaction:', error);
      }
    },
    [messages, sendReaction]
  );

  const handleReactionRemove = useCallback(
    async (messageSerial: string, emoji: string) => {
      try {
        const message = messages.find((m) => m.serial === messageSerial);
        if (!message) return;

        await deleteReaction(message, { type: MessageReactionType.Distinct, name: emoji });
      } catch (error) {
        console.error('Failed to remove reaction:', error);
      }
    },
    [messages, deleteReaction]
  );

  // Handle sending messages
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
      {/* Chat Window Header */}
      <ChatWindowHeader>{customHeaderContent}</ChatWindowHeader>
      {/* Messages Area */}
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
        {/* Additional components passed as children */}
        <TypingIndicators className="px-4 py-2" />
      </ChatMessageList>

      {/* Chat Window Footer */}
      <ChatWindowFooter>
        <div className="flex-1">
          <MessageInput onSend={handleSendMessage} placeholder={`Message ${roomId}...`} />
        </div>
        {customFooterContent}
      </ChatWindowFooter>
    </div>
  );
};
