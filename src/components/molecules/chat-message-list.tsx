import { Message } from '@ably/chat';
import clsx from 'clsx';
import React, { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

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
    const lastScrollCheckTime = useRef<number>(0);
    const pendingScrollToBottom = useRef<boolean>(false);


    const checkIfAtBottom = useCallback(() => {
      if (!containerRef.current) return false;

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const threshold = 50;
      const isBottom = scrollHeight - scrollTop - clientHeight < threshold;

      // Update state only if it changed to avoid unnecessary re-renders
      setIsAtBottom(prev => prev === isBottom ? prev : isBottom);

      return isBottom;
    }, []);

    // Throttled scroll check to avoid performance issues
    const handleScrollCheck = useCallback(() => {
      const now = Date.now();
      if (now - lastScrollCheckTime.current < 16) return; // ~60 FPS

      lastScrollCheckTime.current = now;
      checkIfAtBottom();
    }, [checkIfAtBottom]);

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
      handleScrollCheck();
      checkIfNearTop();
    }, [handleScrollCheck, checkIfNearTop]);


    const scrollToBottom = useCallback(() => {
      if (!containerRef.current) return;

      // Direct scroll to bottom - so even if we have child elements, we scroll to the end
      containerRef.current.scrollTop = containerRef.current.scrollHeight;

      // Update isAtBottom immediately since we just scrolled to bottom
      setIsAtBottom(true);
      pendingScrollToBottom.current = false;
    }, []);

    useEffect(() => {
      if (!containerRef.current) return;

      const resizeObserver = new ResizeObserver(() => {
        if (autoScroll && (isAtBottom || pendingScrollToBottom.current)) {
          // Use requestAnimationFrame to ensure layout is complete
          requestAnimationFrame(() => {
            scrollToBottom();
          });
        }
      });

      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }, [autoScroll, isAtBottom, scrollToBottom]);

    // Add scroll event listener
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      // Check initial position
      checkIfAtBottom();
      container.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }, [handleScroll, checkIfAtBottom]);

    // Auto scroll when new messages arrive
    useLayoutEffect(() => {
      if (
        autoScroll &&
        messages !== messagesRef.current &&
        !shouldMaintainPosition.current
      ) {
        const wasAtBottom = isAtBottom;
        messagesRef.current = messages;

        if (wasAtBottom) {
          pendingScrollToBottom.current = true;
          // Use requestAnimationFrame to ensure DOM is updated
          requestAnimationFrame(() => {
            scrollToBottom();
          });
        }
      } else {
        messagesRef.current = messages;
      }
    }, [messages, autoScroll, isAtBottom, scrollToBottom]);

    // Handle children changes
    useLayoutEffect(() => {
      if (
        autoScroll &&
        isAtBottom &&
        !shouldMaintainPosition.current
      ) {
        pendingScrollToBottom.current = true;
        requestAnimationFrame(() => {
          scrollToBottom();
        });
      }
    }, [children, autoScroll, isAtBottom, scrollToBottom]);

    // Combine refs to use both the forwarded ref and our container ref
    const setRefs = useCallback((element: HTMLDivElement | null) => {
      // Set the forwarded ref
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
      // Set our container ref
      containerRef.current = element;
    }, [ref]);

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

        {/* This element is used for auto-scrolling - must be after all content */}
        <div ref={messagesEndRef} />
      </div>
    );
  }
);

ChatMessageList.displayName = 'ChatMessageList';
