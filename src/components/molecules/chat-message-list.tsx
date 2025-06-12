import { Message } from '@ably/chat';
import clsx from 'clsx';
import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';

import { ChatMessage } from './chat-message.tsx';

export interface ChatMessageListProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Array of Ably Chat Message objects to render in chronological order.
   * Each message contains content, metadata, reactions, and status information.
   */
  messages: Message[];

  /**
   * Client ID of the currently authenticated user.
   * Used by individual ChatMessage components to determine ownership and permissions.
   */
  currentClientId: string;

  /**
   * Optional callback triggered when user scrolls near the top of the message list.
   * Called automatically when scroll position is within loadMoreThreshold pixels from top.
   * Use this to fetch and prepend older messages to the messages array.
   */
  onLoadMoreHistory?: () => void;

  /**
   * Whether a history loading operation is currently in progress.
   * When true, displays a "Loading messages..." indicator at the top of the list.
   */
  isLoading?: boolean;

  /**
   * Whether there are more historical messages available to load.
   * When false, displays "No more messages to load" indicator instead of loading spinner.
   */
  hasMoreHistory?: boolean;

  /**
   * Callback triggered when a user saves an edited message.
   * Passed through to individual ChatMessage components.
   * @param message - The original message being edited
   * @param newText - The updated message content
   */
  onEdit?: (message: Message, newText: string) => void;

  /**
   * Callback triggered when a user confirms deletion of their message.
   * Passed through to individual ChatMessage components.
   * @param message - The message to be deleted
   */
  onDelete?: (message: Message) => void;

  /**
   * Callback triggered when a user adds an emoji reaction to any message.
   * Passed through to individual ChatMessage components.
   * @param message - The message receiving the reaction
   * @param emoji - The emoji character being added
   */
  onReactionAdd?: (message: Message, emoji: string) => void;

  /**
   * Callback triggered when a user removes their emoji reaction from a message.
   * Passed through to individual ChatMessage components.
   * @param message - The message losing the reaction
   * @param emoji - The emoji character being removed
   */
  onReactionRemove?: (message: Message, emoji: string) => void;

  /**
   * Optional React elements to render after all messages (e.g., TypingIndicators).
   * Commonly used for typing indicators, system messages, or loading states.
   */
  children?: React.ReactNode;

  /**
   * Whether to automatically scroll to bottom when new messages arrive.
   * Only scrolls if user is already at/near the bottom to avoid interrupting reading.
   * @default true
   */
  autoScroll?: boolean;

  /**
   * Distance in pixels from the top edge that triggers onLoadMoreHistory callback.
   * Lower values require more precise scrolling, higher values load history earlier.
   * @default 100
   */
  loadMoreThreshold?: number;

  /**
   * Additional CSS classes to apply to the message list container.
   * Merged with default styling classes using clsx.
   */
  className?: string;
}

/**
 * ChatMessageList component provides a scrollable, virtualized container for chat messages
 *
 * Features:
 * - Infinite scroll with lazy loading of message history
 * - Smart auto-scroll that respects user's current position
 * - Loading states and indicators for history fetching
 * - Maintains scroll position when prepending historical messages
 * - Full accessibility support with ARIA labels
 * - Forward ref support for external scroll control
 *
 * @example
 * // Basic usage
 * <ChatMessageList
 *   messages={messages}
 *   currentClientId="user123"
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   onReactionAdd={handleReactionAdd}
 *   onReactionRemove={handleReactionRemove}
 * />
 *
 * @example
 * // With history loading
 * <ChatMessageList
 *   messages={messages}
 *   currentClientId="user123"
 *   onLoadMoreHistory={loadMoreHistory}
 *   isLoading={isLoadingHistory}
 *   hasMoreHistory={hasMore}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   onReactionAdd={handleReactionAdd}
 *   onReactionRemove={handleReactionRemove}
 * >
 *   <TypingIndicator />
 * </ChatMessageList>
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
        className={clsx(
          'flex-1 overflow-y-auto pt-10 px-6 pb-6 space-y-6 bg-gray-50 dark:bg-gray-950 ably-scrollbar',
          className
        )}
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        aria-busy={isLoading}
        aria-describedby={isLoading ? 'loading-status' : undefined}
        {...rest}
      >
        {isLoading && (
          <div className="flex justify-center py-4" role="status" aria-live="polite">
            <div
              className="text-sm text-gray-500 dark:text-gray-400"
              aria-label="Loading older messages"
            >
              Loading messages...
            </div>
          </div>
        )}
        {!hasMoreHistory && messages.length > 0 && (
          <div className="flex justify-center py-4" role="status">
            <div
              className="text-sm text-gray-500 dark:text-gray-400"
              aria-label="End of message history"
            >
              No more messages to load
            </div>
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

ChatMessageList.displayName = 'ChatMessageList';
