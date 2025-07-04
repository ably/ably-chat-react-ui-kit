import { Message } from '@ably/chat';
import { clsx } from 'clsx';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { ChatMessage } from './chat-message.tsx';
import { TypingIndicators } from './typing-indicators.tsx';

export interface ChatMessageListProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Array of Ably Chat Message objects to render in chronological order.
   * Each message contains content, metadata, reactions, and status information.
   */
  messages: Message[];

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
   * Callback triggered when the user scrolls to view a specific message.
   * @param messageSerial - The serial of the message currently in view
   */
  onMessageInView?: (messageSerial: string) => void;

  /**
   * Callback triggered when the user scrolls to the bottom of the message list.
   */
  onViewLatest?: () => void;

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
   * Whether to enable built-in typing indicators for other users.
   * Displays animated dots when other users are typing in the chat room.
   * @default true
   */
  enableTypingIndicators?: boolean;

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
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   onReactionAdd={handleReactionAdd}
 *   onReactionRemove={handleReactionRemove}
 * />
 *
 * @example
 * // Rendering children like typing indicators
 * <ChatMessageList
 *   messages={messages}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   onReactionAdd={handleReactionAdd}
 *   onReactionRemove={handleReactionRemove}
 * >
 *   <TypingIndicator />
 * </ChatMessageList>
 *
 */
export const ChatMessageList = forwardRef<HTMLDivElement, ChatMessageListProps>(
  (
    {
      messages,
      onLoadMoreHistory,
      isLoading = false,
      hasMoreHistory = false,
      onEdit,
      onDelete,
      onReactionAdd,
      onReactionRemove,
      onMessageInView,
      onViewLatest,
      autoScroll = true,
      loadMoreThreshold = 100,
      enableTypingIndicators = true,
      className = '',
      ...rest
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const lastScrollCheck = useRef(0);
    const shouldStickAfterPrepend = useRef(false);
    const prevScrollHeight = useRef(0);
    const messagesMapRef = useRef<Map<string, HTMLElement>>(new Map());

    const [isAtBottom, setIsAtBottom] = useState(true);
    const [centerSerial, setCenterSerial] = useState<string | undefined>();

    const isUserAtBottom = useCallback(() => {
      if (!containerRef.current) return false;
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      return scrollHeight - scrollTop - clientHeight < 50; // px threshold
    }, []);

    const updateIsAtBottom = useCallback(() => {
      setIsAtBottom((prev) => {
        const atBottom = isUserAtBottom();
        return prev === atBottom ? prev : atBottom;
      });
    }, [isUserAtBottom]);

    const maybeLoadHistory = useCallback(() => {
      if (!containerRef.current || !onLoadMoreHistory || !hasMoreHistory || isLoading) return;

      if (containerRef.current.scrollTop < loadMoreThreshold) {
        shouldStickAfterPrepend.current = true;
        prevScrollHeight.current = containerRef.current.scrollHeight;
        onLoadMoreHistory();
      }
    }, [onLoadMoreHistory, hasMoreHistory, isLoading, loadMoreThreshold]);

    /** Determine which message is closest to the viewport centre */
    const reportMessageInView = useCallback(() => {
      if (!containerRef.current || messages.length === 0) return;

      const rect = containerRef.current.getBoundingClientRect();
      const viewportCenter = rect.top + rect.height / 2;

      if (isUserAtBottom()) {
        if (centerSerial !== undefined) setCenterSerial(undefined);
        onViewLatest?.();
        return;
      }

      let best: { serial: string; dist: number } | undefined;
      for (const [serial, el] of messagesMapRef.current.entries()) {
        const { top, bottom } = el.getBoundingClientRect();
        const d = Math.abs((top + bottom) / 2 - viewportCenter);
        if (!best || d < best.dist) best = { serial, dist: d };
      }

      if (best && best.serial !== centerSerial) {
        setCenterSerial(best.serial);
        onMessageInView?.(best.serial);
      }
    }, [centerSerial, isUserAtBottom, messages.length, onMessageInView, onViewLatest]);

    const handleScroll = useCallback(() => {
      const now = performance.now();
      if (now - lastScrollCheck.current < 16) return; // ~60fps
      lastScrollCheck.current = now;

      updateIsAtBottom();
      maybeLoadHistory();
      reportMessageInView();
    }, [updateIsAtBottom, maybeLoadHistory, reportMessageInView]);

    const scrollToBottom = useCallback(() => {
      if (!containerRef.current) return;
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }, []);

    const handleTypingChange = useCallback(() => {
      if (autoScroll && isAtBottom) {
        // Small delay to ensure DOM is updated
        requestAnimationFrame(() => {
          scrollToBottom();
        });
      }
    }, [autoScroll, isAtBottom, scrollToBottom]);

    // After messages prepend, adjust scroll so content doesn't jump
    useLayoutEffect(() => {
      if (!shouldStickAfterPrepend.current || !containerRef.current) return;
      const delta = containerRef.current.scrollHeight - prevScrollHeight.current;
      containerRef.current.scrollTop += delta;
      shouldStickAfterPrepend.current = false;
    }, [messages]);

    // Auto‑scroll on new messages if user is at bottom
    useLayoutEffect(() => {
      if (autoScroll && isAtBottom) {
        scrollToBottom();
      }
    }, [messages, autoScroll, isAtBottom, scrollToBottom]);

    useEffect(() => {
      const node = containerRef.current;
      if (!node) return;

      // Set initial state
      updateIsAtBottom();
      reportMessageInView();

      node.addEventListener('scroll', handleScroll, { passive: true });
      const resizeObs = new ResizeObserver(() => {
        if (autoScroll && isUserAtBottom()) {
          scrollToBottom();
        }
      });
      resizeObs.observe(node);

      return () => {
        node.removeEventListener('scroll', handleScroll);
        resizeObs.disconnect();
      };
    }, [
      handleScroll,
      autoScroll,
      updateIsAtBottom,
      reportMessageInView,
      isUserAtBottom,
      scrollToBottom,
    ]);

    const setRefs = useCallback(
      (el: HTMLDivElement | null) => {
        if (typeof ref === 'function') {
          ref(el);
        } else if (ref) {
          ref.current = el;
        }
        containerRef.current = el;
      },
      [ref]
    );

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
            <span className="text-sm text-gray-500 dark:text-gray-400">Loading messages…</span>
          </div>
        )}

        {!hasMoreHistory && messages.length > 0 && (
          <div className="flex justify-center py-4" role="status">
            <span className="text-sm text-gray-500 dark:text-gray-400">No more messages</span>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => {
          const setEl = (el: HTMLElement | null) => {
            if (el) messagesMapRef.current.set(msg.serial, el);
            else messagesMapRef.current.delete(msg.serial);
          };
          return (
            <div key={msg.serial} ref={setEl}>
              <ChatMessage
                message={msg}
                onEdit={onEdit}
                onDelete={onDelete}
                onReactionAdd={onReactionAdd}
                onReactionRemove={onReactionRemove}
              />
            </div>
          );
        })}
        {enableTypingIndicators && (
          <TypingIndicators className="px-4" onTypingChange={handleTypingChange} />
        )}
      </div>
    );
  }
);

ChatMessageList.displayName = 'ChatMessageList';
