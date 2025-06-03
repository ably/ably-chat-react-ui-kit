import React, { useEffect, useRef, useState, useCallback } from 'react';
import ChatMessage from '../molecules/ChatMessage';
import TypingIndicators from '../molecules/TypingIndicators';
import MessageInput from '../molecules/MessageInput';
import RoomParticipants from '../molecules/RoomParticipants';
import PresenceIndicators from '../molecules/PresenceIndicators';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import { useMessages, useChatClient, usePresence } from '@ably/chat/react';
import {
  Message,
  MessageEvent,
  MessageEvents,
  MessageReactionType,
  MessageReactionSummaryEvent,
} from '@ably/chat';

interface ChatWindowProps {
  roomId: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ roomId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const chatClient = useChatClient();
  const currentUserId = chatClient.clientId;
  usePresence(); // enter presence in the room

  // Handle messages using the useMessages hook with proper event handling
  const { send, deleteMessage, update, addReaction, deleteReaction } = useMessages({
    listener: (event: MessageEvent) => {
      const message = event.message;
      switch (event.type) {
        case MessageEvents.Created: {
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
        case MessageEvents.Updated:
        case MessageEvents.Deleted: {
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
      setMessages([]);
    },
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  // Handle REST message updates for optimistic UI updates
  const handleRESTMessageUpdate = (updatedMessage: Message) => {
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
  };

  // Message operation handlers
  const handleMessageEdit = async (messageSerial: string, newText: string) => {
    try {
      const message = messages.find((m) => m.serial === messageSerial);
      if (!message) return;

      const updatedMessage = message.copy({
        text: newText,
        metadata: message.metadata,
        headers: message.headers,
      });

      const result = await update(updatedMessage);

      // Apply optimistic update
      if (result) {
        handleRESTMessageUpdate(result);
      }
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const handleMessageDelete = async (messageSerial: string) => {
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
  };

  const handleReactionAdd = async (messageSerial: string, emoji: string) => {
    try {
      const message = messages.find((m) => m.serial === messageSerial);
      if (!message) return;

      await addReaction(message, { type: MessageReactionType.Distinct, name: emoji });
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const handleReactionRemove = async (messageSerial: string, emoji: string) => {
    try {
      const message = messages.find((m) => m.serial === messageSerial);
      if (!message) return;

      await deleteReaction(message, { type: MessageReactionType.Distinct, name: emoji });
    } catch (error) {
      console.error('Failed to remove reaction:', error);
    }
  };

  // Handle sending messages
  const handleSendMessage = async (text: string) => {
    if (text.trim()) {
      try {
        await send({ text: text.trim() });
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  const getRoomName = () => {
    return roomId.replace(/^room-\d+-/, '').replace(/-/g, ' ');
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 flex-1">
      {/* Room Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-3">
          {/* Room participants component*/}
          <RoomParticipants
            roomAvatar={undefined}
            roomName={getRoomName()}
            isOpen={showParticipants}
            onToggle={() => setShowParticipants(!showParticipants)}
          />

          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">{roomId}</h2>
            <div className="flex items-center gap-2">
              <PresenceIndicators />

              {/* Typing Indicators in Header */}
              <TypingIndicators currentUserId={currentUserId} className="text-xs" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Icon name="info" size="md" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pt-10 px-6 pb-6 space-y-6 bg-gray-50 dark:bg-gray-950">
        {messages.map((msg) => (
          <ChatMessage
            key={msg.serial}
            message={msg}
            isOwn={msg.clientId === currentUserId}
            currentUserId={currentUserId}
            onEdit={handleMessageEdit}
            onDelete={handleMessageDelete}
            onReactionAdd={handleReactionAdd}
            onReactionRemove={handleReactionRemove}
          />
        ))}

        {/* Typing Indicators in Chat Area */}
        <TypingIndicators currentUserId={currentUserId} className="px-4 py-2" />

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput onSend={handleSendMessage} placeholder={`Message ${roomId}...`} />
    </div>
  );
};
