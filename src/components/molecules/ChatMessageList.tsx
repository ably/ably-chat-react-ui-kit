import React, { useEffect, useRef, forwardRef, useState, useCallback } from 'react';
import { ChatMessage } from './ChatMessage';
import { Message } from '@ably/chat';
import clsx from 'clsx';

export interface ChatMessageListProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Array of messages to render */
  messages: Message[];
  /** Current user ID for determining message ownership */
  currentClientId: string;
  /** Callback to load more history when scrolling to top */
  onLoadMoreHistory?: () => void;
  /** Whether history is currently being loaded and we should display a loading screen */
  isLoading?: boolean;
  /** Whether there is more history available to load */
  hasMoreHistory?: boolean;
  /** Handler for editing messages */
  onEdit: (message: Message, newText: string) => void;
  /** Handler for deleting messages */
  onDelete: (message: Message) => void;
  /** Handler for adding reactions */
  onReactionAdd: (message: Message, emoji: string) => void;
  /** Handler for removing reactions */
  onReactionRemove: (message: Message, emoji: string) => void;
  /** Additional components to render after messages (e.g., TypingIndicators) */
  children?: React.ReactNode;
  /** Whether to automatically scroll to bottom when messages change */
  autoScroll?: boolean;
  /** Distance from top in pixels to trigger history loading */
  loadMoreThreshold?: number;
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
      currentClientId,
      onLoadMoreHistory,
      isLoading = false,
      hasMoreHistory = false,
      onEdit,
      onDelete,
      onReactionAdd,
      onReactionRemove,
      children,
      autoScroll = true,
      loadMoreThreshold = 100,
      className = '',
      ...rest
    },
    ref
  ) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesRef = useRef(messages);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const previousScrollHeight = useRef<number>(0);
    const shouldMaintainPosition = useRef<boolean>(false);
    // Memoize the checkIfAtBottom function
    const checkIfAtBottom = useCallback(() => {
      if (!containerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isBottom = scrollHeight - scrollTop - clientHeight < 10;
      setIsAtBottom(isBottom);
    }, []);

    // Check if user is near the top and should load more history
    const checkIfNearTop = useCallback(() => {
      if (!containerRef.current || !onLoadMoreHistory || isLoading || !hasMoreHistory) {
        return;
      }

      const { scrollTop } = containerRef.current;
      if (scrollTop < loadMoreThreshold) {
        previousScrollHeight.current = containerRef.current.scrollHeight;
        shouldMaintainPosition.current = true;
        onLoadMoreHistory();
      }
    }, [onLoadMoreHistory, isLoading, hasMoreHistory, loadMoreThreshold]);

    // Maintain scroll position when new history is loaded
    useEffect(() => {
      if (shouldMaintainPosition.current && containerRef.current) {
        const newScrollHeight = containerRef.current.scrollHeight;
        const heightDifference = newScrollHeight - previousScrollHeight.current;

        if (heightDifference > 0) {
          containerRef.current.scrollTop += heightDifference;
        }

        shouldMaintainPosition.current = false;
      }
    }, [messages]);

    const handleScroll = useCallback(() => {
      checkIfAtBottom();
      checkIfNearTop();
    }, [checkIfAtBottom, checkIfNearTop]);

    // Add scroll event listener to track if user is at bottom
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;
      // Check initial position
      checkIfAtBottom();
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }, [checkIfAtBottom, handleScroll]);

    // Check scroll position when messages change
    useEffect(() => {
      checkIfAtBottom();
    }, [checkIfAtBottom, messages]);

    // Auto scroll with each new message, only if user is at the bottom
    useEffect(() => {
      if (
        autoScroll &&
        messages !== messagesRef.current &&
        isAtBottom &&
        !shouldMaintainPosition.current
      ) {
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
        {/* Loading indicator for history */}
        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Loading messages...</div>
          </div>
        )}

        {/* No more history indicator */}
        {!hasMoreHistory && messages.length > 0 && (
          <div className="flex justify-center py-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">No more messages to load</div>
          </div>
        )}

        {/* Render messages automatically */}
        {messages.map((msg) => (
          <ChatMessage
            key={msg.serial}
            message={msg}
            currentClientId={currentClientId}
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
