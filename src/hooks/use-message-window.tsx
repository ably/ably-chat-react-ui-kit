import { ChatMessageEvent, ChatMessageEventType, Message, PaginatedResult } from '@ably/chat';
import { useMessages, useRoom } from '@ably/chat/react';
import { useCallback, useEffect, useRef, useState } from 'react';

/** Props for the useMessageWindow hook */
export interface UseMessageWindowProps {
  /** Number of rows kept mounted (ex‑overscan). Defaults to 200 */
  windowSize?: number;
  /** Extra rows rendered above & below the viewport. Defaults to 20 */
  overscan?: number;
  /** historyBatchSize - Number of messages to fetch in a single history request. Defaults to 300 */
  historyBatchSize?: number;
}

/** Response interface for the useMessageWindow hook */
export interface UseMessageWindowResponse {
  /** Messages that should be rendered in the UI */
  activeMessages: Message[];
  /** Add or update messages */
  updateMessages: (messages: Message[], prepend?: boolean) => void;
  /** Jump to the latest message */
  showLatestMessages: () => void;
  /** Scroll by ±delta rows (positive = newer) */
  scrollBy: (delta: number) => void;
  /** Centre the window on a specific message serial */
  showMessagesAroundSerial: (serial: string) => void;
  /** `true` while a history query is running */
  loading: boolean;
  /** `true` if their are more messages that can be fetched from history*/
  hasMoreHistory: boolean;
  /** Triggers another history fetch from the point of the earliest message*/
  loadMoreHistory: () => Promise<void>;
}

/**
 * A React hook to manage message windowing and history for chat.
 *
 * This hook manages a virtualized window of messages from a larger chat history, providing efficient
 * rendering for large conversations.
 *
 * - Must be used within a `ChatRoomProvider` component.
 *
 *
 * Features:
 * - *Virtualized Windowing*: Exposes a subset of the total messages in memory for efficient rendering
 * - *Realtime updates*: Automatically handles new messages, edits, deletions, and reactions.
 * - *History Pagination*: Loads older messages on demand with configurable batch sizes.
 * - *Discontinuity Recovery*: Automatically recovers missing messages after network disruptions.
 * - *Navigation Controls*: Jump to latest, scroll by delta, or center on specific messages
 *
 * @param opts - Configuration options for the message window
 * @returns Hook interface with message data and control methods
 *
 *
 * @example
 * // Basic usage
 * function AdvancedChatRoom() {
 *   const {
 *     activeMessages,
 *     updateMessages,
 *     scrollBy,
 *     showMessagesAroundSerial,
 *     loadMoreHistory,
 *     hasMoreHistory,
 *     loading
 *   } = useMessageWindow({
 *     windowSize: 100, // Smaller window for better performance
 *   });
 *
 *   const handleJumpToMessage = (messageSerial: string) => {
 *     showMessagesAroundSerial(messageSerial);
 *   };
 *
 *   const handleScrollUp = () => {
 *     scrollBy(-10); // Scroll 10 messages toward older
 *   };
 *
 *   const handleScrollDown = () => {
 *     scrollBy(10); // Scroll 10 messages toward newer
 *   };
 *
 *   return (
 *     <ChatRoomProvider roomId="support">
 *       <div>
 *         <div className="controls">
 *           <button onClick={handleScrollUp}>↑ Older</button>
 *           <button onClick={handleScrollDown}>↓ Newer</button>
 *           {hasMoreHistory && (
 *             <button onClick={loadMoreHistory} disabled={loading}>
 *               Load More History
 *             </button>
 *           )}
 *         </div>
 *
 *         <div className="messages">
 *           {activeMessages.map(msg => (
 *             <MessageComponent
 *               key={msg.serial}
 *               message={msg}
 *               onJumpTo={() => handleJumpToMessage(msg.serial)}
 *             />
 *           ))}
 *         </div>
 *       </div>
 *     </ChatRoomProvider>
 *   );
 * }
 *
 */
export const useMessageWindow = ({
  windowSize = 200,
  overscan = 20,
  historyBatchSize = 300,
}: UseMessageWindowProps = {}): UseMessageWindowResponse => {
  const nextPageRef = useRef<undefined | (() => Promise<PaginatedResult<Message> | null>)>(
    undefined
  );
  const serialSetRef = useRef<Set<string>>(new Set());
  const initialHistoryLoadedRef = useRef<boolean>(false);
  const recoveringRef = useRef<boolean>(false);

  /** Entire message history, should not be used for UI display */
  const allMessagesRef = useRef<Message[]>([]);
  /** Current version of the message list, used to trigger re-renders */
  const [version, setVersion] = useState(0);
  /** Slice to render in UI, typically a couple 100 messages */
  const [activeMessages, setActiveMessages] = useState<Message[]>([]);
  /** Anchor row, used to maintain the window position (‑1==latest) */
  const [anchorIdx, setAnchorIdx] = useState<number>(-1);

  /** Loading state for history queries */
  const [loading, setLoading] = useState<boolean>(false);

  /** Access the current room context so we can reset state correctly when it changes */
  const { room } = useRoom();

  // Reset state when room changes.
  useEffect(() => {
    return () => {
      // Reset all state
      allMessagesRef.current = [];
      serialSetRef.current = new Set();
      nextPageRef.current = undefined;
      initialHistoryLoadedRef.current = false;
      recoveringRef.current = false;

      setVersion(0);
      setActiveMessages([]);
      setAnchorIdx(-1);
    };
  }, [room]);

  const { historyBeforeSubscribe } = useMessages({
    listener: (event: ChatMessageEvent) => {
      const { message, type } = event;
      switch (type) {
        case ChatMessageEventType.Created:
        case ChatMessageEventType.Updated:
        case ChatMessageEventType.Deleted: {
          updateMessages([message]);
          break;
        }
        default: {
          console.error('Unknown message event type:', type);
        }
      }
    },
    reactionsListener: (event) => {
      setVersion((prevVersion) => {
        const messageSerial = event.summary.messageSerial;
        let changed = false;

        // If we don't have the message for this reaction, we can't do anything
        if (serialSetRef.current.has(messageSerial)) {
          const idx = findMessageIndex(allMessagesRef.current, messageSerial);
          if (idx !== -1 && allMessagesRef.current[idx]) {
            const currentMessage = allMessagesRef.current[idx];
            const merged = currentMessage.with(event);
            if (merged !== currentMessage) {
              allMessagesRef.current[idx] = merged;
              changed = true;
            }
          }
        }

        return changed ? prevVersion + 1 : prevVersion; // Only increment if changed
      });
    },
    onDiscontinuity: () => {
      // Get the serial of the last message in the current window
      const messages = allMessagesRef.current;
      if (messages.length === 0) return;

      // eslint-disable-next-line unicorn/prefer-at
      const lastReceivedMessage = messages[messages.length - 1];
      if (!lastReceivedMessage) return;
      handleDiscontinuity(lastReceivedMessage.serial);
    },
  });

  const [hasMoreHistory, setHasMoreHistory] = useState<boolean>(Boolean(historyBeforeSubscribe));

  /**
   * Binary search to find message index by serial
   *
   * @param messages - Sorted array of messages to search
   * @param targetSerial - The serial number to find
   * @param reverse - Whether to search in reverse order. Defaults to false (ascending order), as this is the order in which messages are received.
   * @returns Index of the message, or -1 if not found
   */
  const findMessageIndex = useCallback(
    (messages: Message[], targetSerial: string, reverse = false): number => {
      // If no messages, return -1
      if (messages.length === 0) return -1;

      let left = 0;
      let right = messages.length - 1;

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const midMessage = messages[mid];

        if (!midMessage) return -1;

        const midSerial = midMessage.serial;

        if (midSerial === targetSerial) {
          return mid;
        }

        // If we are searching in reverse order, flip the comparison
        const shouldGoRight = reverse ? midSerial > targetSerial : midSerial < targetSerial;

        if (shouldGoRight) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }

      return -1; // Not found
    },
    []
  );

  /**
   * Binary search to find optimal insertion position for new messages
   *
   * @param messages - Current sorted messages array
   * @param newMessage - Message to insert
   * @returns Index where the new message should be inserted
   */
  const findInsertionIndex = useCallback((messages: Message[], newMessage: Message): number => {
    let left = 0;
    let right = messages.length;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      const midMessage = messages[mid];

      if (!midMessage) {
        return -1;
      }

      if (newMessage.before(midMessage)) {
        right = mid;
      } else {
        left = mid + 1;
      }
    }

    return left;
  }, []);

  // TODO: More optimizations may be needed here, but further load testing is required to determine.
  const updateMessages = useCallback(
    (msgs: Message[], prepend = false) => {
      if (msgs.length === 0) return;

      setVersion((prevVersion) => {
        if (prevVersion === 0 && allMessagesRef.current.length > 0) {
          // If this is the first update and we already have messages, we need to reset the state
          allMessagesRef.current = [];
          serialSetRef.current.clear();
        }
        let changed = false;
        let insertedBeforeAnchor = 0;
        const allMessages = allMessagesRef.current;
        for (const m of msgs) {
          // Handle existing messages
          if (serialSetRef.current.has(m.serial)) {
            const idx = findMessageIndex(allMessages, m.serial);
            const existingMessage = allMessagesRef.current[idx];
            const merged = existingMessage?.with(m);

            if (merged && merged !== existingMessage) {
              allMessagesRef.current[idx] = merged;
              changed = true;
            }
            continue;
          }

          // Handle new messages
          const firstMessage = allMessages[0];
          const lastMessage = allMessages.at(-1);

          // Prepend if requested and message is older than first
          if (prepend && (allMessages.length === 0 || (firstMessage && m.before(firstMessage)))) {
            allMessages.unshift(m);
            if (anchorIdx !== -1) insertedBeforeAnchor += 1;
          }
          // Append if message is newer than last
          else if (allMessages.length === 0 || (lastMessage && m.after(lastMessage))) {
            allMessages.push(m);
          }
          // Insert at correct position
          else {
            const insIdx = findInsertionIndex(allMessages, m);
            allMessages.splice(insIdx, 0, m);
            if (anchorIdx !== -1 && insIdx <= anchorIdx) insertedBeforeAnchor += 1;
          }

          serialSetRef.current.add(m.serial);
          changed = true;
        }

        if (changed && insertedBeforeAnchor) {
          setAnchorIdx((a) => (a === -1 ? a : a + insertedBeforeAnchor));
        }

        return changed ? prevVersion + 1 : prevVersion;
      });
    },
    [anchorIdx, findInsertionIndex, findMessageIndex]
  );

  const handleDiscontinuity = useCallback(
    (recoverFromSerial: string) => {
      // Nothing to do if we are already recovering or we have no history API
      if (recoveringRef.current || !historyBeforeSubscribe) return;

      recoveringRef.current = true;
      setLoading(true);

      void (async () => {
        try {
          let page = await historyBeforeSubscribe({ limit: historyBatchSize });
          for (;;) {
            updateMessages(page.items.reverse());
            // Binary search the sorted list in reverse order, since history is order descending
            if (findMessageIndex(page.items, recoverFromSerial, true) !== -1) {
              break;
            }

            if (page.hasNext()) {
              const nextPage = await page.next();
              if (!nextPage) break; // no more pages
              page = nextPage; // move further back in time
            } else {
              break; // no more pages
            }
          }
        } catch (error: unknown) {
          console.error('Discontinuity recovery failed', error);
        } finally {
          recoveringRef.current = false;
          setLoading(false);
        }
      })();
    },
    [findMessageIndex, historyBeforeSubscribe, updateMessages, historyBatchSize]
  );

  /* Reset initial load state when historyBeforeSubscribe changes */
  useEffect(() => {
    initialHistoryLoadedRef.current = false;
  }, [historyBeforeSubscribe]);

  /* Initial load */
  useEffect(() => {
    if (!historyBeforeSubscribe || initialHistoryLoadedRef.current) return;

    let cancelled = false;
    initialHistoryLoadedRef.current = true;

    const load = async () => {
      setLoading(true);
      try {
        // Load enough messages to fill more than the window size and overscan
        const page = await historyBeforeSubscribe({ limit: windowSize + overscan * 2 });
        if (cancelled) return;

        updateMessages(page.items, true); // prepend older msgs
        nextPageRef.current = page.hasNext() ? () => page.next() : undefined;
        setHasMoreHistory(page.hasNext());
      } catch (error) {
        console.error('History load failed', error);
        initialHistoryLoadedRef.current = false;
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [historyBeforeSubscribe, overscan, updateMessages, windowSize]);

  /* Load more history on demand */
  const loadMoreHistory = useCallback(async () => {
    if (loading || !hasMoreHistory || !nextPageRef.current) return;

    setLoading(true);
    try {
      const page = await nextPageRef.current();
      if (page) {
        updateMessages(page.items, true);
        nextPageRef.current = page.hasNext() ? () => page.next() : undefined;
        setHasMoreHistory(page.hasNext());
      } else {
        nextPageRef.current = undefined;
        setHasMoreHistory(false);
      }
    } catch (error) {
      console.error('History load failed', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMoreHistory, updateMessages]);

  const computeWindow = useCallback(
    (arr: Message[], anchor: number): Message[] => {
      if (arr.length === 0) return [];

      const latest = arr.length - 1;
      const idx = anchor === -1 ? latest : Math.max(0, Math.min(anchor, latest));
      const half = Math.floor(windowSize / 2);
      const start = Math.max(0, idx - half - overscan);
      const end = Math.min(arr.length, idx + half + overscan + 1);
      return arr.slice(start, end);
    },
    [windowSize, overscan]
  );

  // Effects depend on version instead of allMessages
  useEffect(() => {
    setActiveMessages(computeWindow(allMessagesRef.current, anchorIdx));
  }, [version, anchorIdx, computeWindow]);

  const showLatestMessages = useCallback(() => {
    setAnchorIdx(-1);
  }, []);

  const scrollBy = useCallback((delta: number) => {
    setAnchorIdx((prev) => {
      if (allMessagesRef.current.length === 0) return prev;
      const latest = allMessagesRef.current.length - 1;
      const base = prev === -1 ? latest : prev;
      const next = base + delta;
      if (next >= latest) return -1; // tail‑follow again
      if (next < 0) return 0;
      return next;
    });
  }, []);

  const showMessagesAroundSerial = useCallback(
    (serial: string) => {
      const idx = findMessageIndex(allMessagesRef.current, serial);
      if (idx !== -1) setAnchorIdx(idx);
    },
    [findMessageIndex]
  );

  return {
    activeMessages,
    updateMessages,
    showLatestMessages,
    scrollBy,
    showMessagesAroundSerial,
    loading,
    hasMoreHistory,
    loadMoreHistory,
  };
};
