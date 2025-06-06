import React, { useEffect, useRef, forwardRef, useState } from 'react';
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
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);

    // Check if user is at the bottom of the chat
    const checkIfAtBottom = () => {
      if (!containerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      // Consider "at bottom" if within 10px of the bottom
      const isBottom = scrollHeight - scrollTop - clientHeight < 10;
      setIsAtBottom(isBottom);
    };

    // Add scroll event listener to track if user is at bottom
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const handleScroll = () => {
        checkIfAtBottom();
      };

      // Check initial position
      checkIfAtBottom();

      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }, []);

    // Check scroll position when messages change
    useEffect(() => {
      checkIfAtBottom();
    }, [messages]);

    // Auto scroll with each new message, only if user is at the bottom
    useEffect(() => {
      if (autoScroll && messages !== messagesRef.current && isAtBottom) {
        messagesRef.current = messages;
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        messagesRef.current = messages;
      }
    }, [messages, autoScroll, isAtBottom]);

    const combinedClassName = clsx(
      'flex-1 overflow-y-auto pt-10 px-6 pb-6 space-y-6 bg-gray-50 dark:bg-gray-950',
      className
    );

    // Combine refs to use both the forwarded ref and our container ref
    const setRefs = (element: HTMLDivElement | null) => {
      // Set the forwarded ref
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
      // Set our container ref
      containerRef.current = element;
    };

    return (
      <div
        ref={setRefs}
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
