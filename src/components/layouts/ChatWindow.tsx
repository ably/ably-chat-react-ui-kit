import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import ChatMessage from '../molecules/ChatMessage';
import TypingIndicators from '../molecules/TypingIndicators';
import MessageInput from '../molecules/MessageInput';
import { AvatarData } from '../atoms/Avatar';
import { useMessages, useChatClient, usePresence, useRoom } from '@ably/chat/react';
import {
  Message,
  ChatMessageEvent,
  ChatMessageEventType,
  MessageReactionType,
  MessageReactionSummaryEvent,
} from '@ably/chat';
import RoomReaction from '../molecules/RoomReaction';

interface ChatWindowProps {
  roomId: string;
  roomAvatar?: AvatarData;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ roomId, roomAvatar }) => {
  console.log('[RENDER] ChatWindow', { roomId });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const chatClient = useChatClient();
  const currentUserId = chatClient.clientId;
  const { room } = useRoom();
  usePresence(); // enter presence in the room

  useEffect(() => {
    // attach the room when the component renders
    // detaching and release is handled at the top app level for now
    // TODO: Remove once the ChatClientProvider has room reference counts implemented
    room?.attach();
  }, [room]);

  // Handle messages using the useMessages hook with proper event handling
  const { send, deleteMessage, update, sendReaction, deleteReaction } = useMessages({
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
      // TODO: Handle discontinuity in messages
      console.log('Discontinuity detected');
      setMessages([]);
    },
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  // Memoize the room name to prevent unnecessary recalculations
  const roomName = useMemo(() => {
    return roomId.replace(/^room-\d+-/, '').replace(/-/g, ' ');
  }, [roomId]);

  if (!roomId) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-950 flex-1">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Select a room to start chatting
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Choose a room from the sidebar to begin the conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Room: {roomName}
        </h2>
      </div>

      {/* Messages area */}
      <div
        ref={messagesEndRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {messages.map((message) => (
          <ChatMessage
            key={message.serial}
            message={message}
            isOwn={message.clientId === currentUserId}
            currentUserId={currentUserId}
            onEdit={handleMessageEdit}
            onDelete={handleMessageDelete}
            onReactionAdd={handleReactionAdd}
            onReactionRemove={handleReactionRemove}
          />
        ))}
        <TypingIndicators className="px-4 py-2" />
      </div>

      {/* Message Input and Room Reaction Container */}
      <div className="flex items-center bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="flex-1">
          <MessageInput onSend={handleSendMessage} placeholder={`Message ${roomName}...`} />
        </div>
        <div className="px-4 py-4">
          <RoomReaction />
        </div>
      </div>
    </div>
  );
};
