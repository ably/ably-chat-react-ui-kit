import React, { useEffect, useRef, forwardRef } from 'react';
import ChatMessage from './ChatMessage';
import { Message } from '@ably/chat';
import clsx from 'clsx';

interface ChatMessageListProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Array of messages to render */
  messages: Message[];
  /** Current user ID for determining message ownership */
  currentUserId: string;
  /** Handler for editing messages */
  onEdit: (messageSerial: string, newText: string) => void;
  /** Handler for deleting messages */
  onDelete: (messageSerial: string) => void;
  /** Handler for adding reactions */
  onReactionAdd: (messageSerial: string, emoji: string) => void;
  /** Handler for removing reactions */
  onReactionRemove: (messageSerial: string, emoji: string) => void;
  /** Additional components to render after messages (e.g., TypingIndicators) */
  children?: React.ReactNode;
  /** Whether to automatically scroll to bottom when messages change */
  autoScroll?: boolean;
  /** Additional CSS classes to apply */
  className?: string;
}

/**
 * ChatMessageList component provides a scrollable container for chat messages
 *
 * Features:
 * - Renders ChatMessage components automatically from messages array
 * - Scrollable message container with proper styling
 * - Accessibility attributes for screen readers
 * - Auto-scroll to bottom functionality
 * - Accepts additional components as children (e.g., TypingIndicators)
 * - Rest props support for additional customization
 */
export const ChatMessageList = forwardRef<HTMLDivElement, ChatMessageListProps>(
  (
    {
      messages,
      currentUserId,
      onEdit,
      onDelete,
      onReactionAdd,
      onReactionRemove,
      children,
      autoScroll = true,
      className = '',
      ...rest
    },
    ref
  ) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesRef = useRef(messages);

    // TODO: Auto scroll with each new message, only if user is at the bottom
    // Track messages changes for auto-scroll
    useEffect(() => {
      if (autoScroll && messages !== messagesRef.current) {
        messagesRef.current = messages;
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }, [messages, autoScroll]);

    const combinedClassName = clsx(
      'flex-1 overflow-y-auto pt-10 px-6 pb-6 space-y-6 bg-gray-50 dark:bg-gray-950',
      className
    );

    return (
      <div
        ref={ref}
        className={combinedClassName}
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        {...rest}
      >
        {/* Render messages automatically */}
        {messages.map((msg) => (
          <ChatMessage
            key={msg.serial}
            message={msg}
            isOwn={msg.clientId === currentUserId}
            currentUserId={currentUserId}
            onEdit={onEdit}
            onDelete={onDelete}
            onReactionAdd={onReactionAdd}
            onReactionRemove={onReactionRemove}
          />
        ))}

        {/* Render additional components passed as children */}
        {children}

        <div ref={messagesEndRef} />
      </div>
    );
  }
);

ChatMessageList.displayName = 'ChatMessageList';
