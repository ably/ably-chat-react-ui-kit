import '@testing-library/jest-dom';

import {
  ChatMessageAction,
  ConnectionStatus,
  DiscontinuityListener,
  ErrorInfo,
  Message,
  MessageReactionEventType,
  MessageReactionListener,
  MessageReactionSummaryEvent,
  PaginatedResult,
  RoomStatus,
} from '@ably/chat';
import {
  useMessages,
  type UseMessagesParams,
  type UseMessagesResponse,
  useRoom,
  type UseRoomResponse,
} from '@ably/chat/react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useMessageWindow } from '../../hooks/use-message-window.tsx';

vi.mock('@ably/chat/react', () => ({
  useMessages: vi.fn(),
  useRoom: vi.fn(),
}));

// Utility to generate a unique serial for messages -> 01726585978590-001@abcdefghij:001
export const getSerial = (
  timestamp?: number,
  counter = '001',
  seriesId = 'abcdefghij',
  index = '001'
): string => {
  const ts = timestamp ?? Date.now();
  return `${ts.toString().padStart(14, '0')}-${counter}@${seriesId}:${index}`;
};

const createMockMessage = (overrides: Partial<Message> = {}): Message => {
  const serial = overrides.serial ?? getSerial();
  const clientId = overrides.clientId ?? 'mock-user';
  const text = overrides.text ?? 'my chat message';
  const timestamp = overrides.timestamp ?? new Date();
  const metadata = overrides.metadata ?? {};
  const headers = overrides.headers ?? {};
  const action = overrides.action ?? ChatMessageAction.MessageCreate;
  const version = overrides.version ?? { serial: getSerial() };
  const reactions = overrides.reactions ?? {
    distinct: {},
    unique: {},
    multiple: {},
  };

  const combinedArgs: Partial<Message> = {
    serial,
    clientId,
    text,
    timestamp,
    metadata,
    headers,
    action,
    version,
    reactions,
    isUpdated: overrides.isUpdated ?? false,
    isDeleted: overrides.isDeleted ?? false,
    deletedBy: overrides.deletedBy,
    updatedBy: overrides.updatedBy,
    updatedAt: overrides.updatedAt,
    deletedAt: overrides.deletedAt,
  };

  const combinedFuncs: Partial<Message> = {
    before: vi.fn((other: Message) => serial < other.serial),
    equal: vi.fn((other: Message) => serial === other.serial),
    after: vi.fn((other: Message) => serial > other.serial),
    isSameAs: vi.fn(),
    isOlderVersionOf: vi.fn(),
    isNewerVersionOf: vi.fn(),
    isSameVersionAs: vi.fn(),
    with: vi.fn((event: Message | MessageReactionSummaryEvent) => {
      if ('serial' in event) {
        return {
          ...event,
        };
      }
      return {
        ...combinedArgs,
        reactions: {
          unique: event.summary.unique,
          distinct: event.summary.distinct,
          multiple: event.summary.multiple,
        },
      } as Message;
    }),
    copy: vi.fn(),
  };

  return { ...combinedArgs, ...combinedFuncs } as Message;
};

const createMockPaginatedResult = (
  args: Partial<PaginatedResult<Message>>
): PaginatedResult<Message> => {
  const hasNextMock = vi.fn().mockReturnValue(false);
  const nextMock = vi.fn().mockResolvedValue(null);
  const items = args.items ?? [];
  return {
    items,
    hasNext: args.hasNext ?? hasNextMock,
    isLast: args.isLast ?? vi.fn().mockReturnValue(true),
    next: args.next ?? nextMock,
    first: args.first ?? vi.fn().mockResolvedValue({ items, hasNext: hasNextMock, next: nextMock }),
    current:
      args.current ?? vi.fn().mockResolvedValue({ items, hasNext: hasNextMock, next: nextMock }),
  };
};

const createMockUseMessagesResponse = (
  overrides: Partial<UseMessagesResponse> = {}
): UseMessagesResponse => ({
  sendMessage: vi.fn(),
  updateMessage: vi.fn(),
  history: vi.fn(),
  deleteMessage: vi.fn(),
  sendReaction: vi.fn(),
  deleteReaction: vi.fn(),
  historyBeforeSubscribe: vi.fn(),
  roomStatus: RoomStatus.Attached,
  connectionStatus: ConnectionStatus.Connected,
  getMessage: vi.fn(),
  ...overrides,
});

const createMockUseRoomResponse = (overrides: Partial<UseRoomResponse> = {}): UseRoomResponse => ({
  roomStatus: RoomStatus.Attached,
  connectionStatus: ConnectionStatus.Connected,
  roomName: 'test-room',
  attach: vi.fn(),
  detach: vi.fn(),
  ...overrides,
});

describe('useMessageWindow Hook', () => {
  const mockMessages = [
    createMockMessage({
      serial: getSerial(Date.now() - 1000 * 60 * 5),
      clientId: 'user1',
      text: 'Message 1',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    }),
    createMockMessage({
      serial: getSerial(Date.now() - 1000 * 60 * 10),
      clientId: 'user2',
      text: 'Message 2',
      timestamp: new Date(Date.now() - 1000 * 60 * 4),
    }),
    createMockMessage({
      serial: getSerial(Date.now() - 1000 * 60 * 3),
      clientId: 'user1',
      text: 'Message 3',
      timestamp: new Date(Date.now() - 1000 * 60 * 3),
    }),
  ];

  const mockRoomName = 'test-room';

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useRoom).mockReturnValue(
      createMockUseRoomResponse({
        roomName: mockRoomName,
      })
    );

    const mockHistoryBeforeSubscribe = vi
      .fn()
      .mockResolvedValue(createMockPaginatedResult({ items: mockMessages }));

    vi.mocked(useMessages).mockReturnValue(
      createMockUseMessagesResponse({
        historyBeforeSubscribe: mockHistoryBeforeSubscribe,
        history: vi.fn().mockResolvedValue(createMockPaginatedResult({ items: mockMessages })),
      })
    );
  });

  it('should initialize with empty messages', () => {
    vi.mocked(useMessages).mockReturnValue(
      createMockUseMessagesResponse({
        historyBeforeSubscribe: undefined,
      })
    );

    const { result } = renderHook(() => useMessageWindow());

    expect(result.current.activeMessages).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(typeof result.current.hasMoreHistory).toBe('boolean');
  });

  it('should update messages when new messages arrive', async () => {
    const { result } = renderHook(() => useMessageWindow());

    await waitFor(() => {
      expect(result.current.activeMessages.length).toBe(3);
    });

    const newMsgSerial = getSerial(Date.now());
    // Simulate a new message
    const newMessage = createMockMessage({
      serial: newMsgSerial,
      clientId: 'user2',
      text: 'Message 4',
      timestamp: new Date(),
    });

    act(() => {
      result.current.updateMessages([newMessage]);
    });

    // Check that the new message was added
    expect(result.current.activeMessages.length).toBe(4);
    expect(result.current.activeMessages[3]?.serial).toBe(newMsgSerial);
  });

  it('should handle message window navigation', async () => {
    const navigationMessages = Array.from({ length: 20 }, (_, i) =>
      createMockMessage({
        serial: getSerial(Date.now() - 1000 * 60 * (20 - i)),
        clientId: `user${String((i % 3) + 1)}`,
        text: `Navigation test message ${String(i + 1)}`,
        timestamp: new Date(Date.now() - 1000 * 60 * (20 - i)),
      })
    );

    const stableHistoryBeforeSubscribe = vi.fn().mockResolvedValue(
      createMockPaginatedResult({
        items: navigationMessages,
        hasNext: vi.fn().mockReturnValue(false),
      })
    );

    const stableMockResponse = createMockUseMessagesResponse({
      historyBeforeSubscribe: stableHistoryBeforeSubscribe,
    });

    vi.mocked(useMessages).mockReturnValue(stableMockResponse);

    const { result } = renderHook(() =>
      useMessageWindow({
        windowSize: 10, // Small window to test navigation
        overscan: 2,
      })
    );

    // Ensure we load the initial messages
    await waitFor(() => {
      expect(result.current.activeMessages.length).toBeGreaterThan(0);
    });

    // Capture initial state - should be showing latest messages
    const initialSerials = result.current.activeMessages.map((m) => m.serial);

    // scroll toward older messages
    act(() => {
      result.current.scrollBy(-10);
    });

    await waitFor(() => {
      const newActiveMessages = result.current.activeMessages;
      const newSerials = newActiveMessages.map((m) => m.serial);
      expect(newSerials).not.toEqual(initialSerials);
    });

    act(() => {
      result.current.showLatestMessages();
    });

    // Should be showing the newest message again
    await waitFor(() => {
      const latestActiveMessages = result.current.activeMessages;
      const latestSerials = latestActiveMessages.map((m) => m.serial);
      // Should have a serial with the latest timestamp
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(latestSerials).toContain(navigationMessages[19]!.serial);
    });

    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      result.current.showMessagesAroundSerial(navigationMessages[4]!.serial);
    });

    // Should center on a specific message
    await waitFor(() => {
      const messageSerials = result.current.activeMessages.map((m) => m.serial);
      // Should contain the serial we centered on
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(messageSerials).toContain(navigationMessages[4]!.serial);
    });

    // Now scroll down to newer messages
    const beforeScrollSerials = result.current.activeMessages.map((m) => m.serial);

    act(() => {
      result.current.scrollBy(5);
    });

    await waitFor(() => {
      const newSerials = result.current.activeMessages.map((m) => m.serial);
      expect(newSerials).not.toEqual(beforeScrollSerials);
    });

    // Check that the active messages are still within the window size + overscan (idx inclusive)
    expect(result.current.activeMessages.length).toBeLessThanOrEqual(15); // windowSize + 2 * overscan
  });

  it('should handle loading more history', async () => {
    // Setup mock for pagination
    const mockNextPage = createMockPaginatedResult({
      items: [
        createMockMessage({
          serial: 'msg_0',
          clientId: 'user3',
          text: 'Earlier message',
          timestamp: new Date(Date.now() - 1000 * 60 * 10),
        }),
      ],
    });

    const mockHistoryBeforeSubscribe = vi.fn().mockResolvedValue({
      ...createMockPaginatedResult({
        items: mockMessages,
        hasNext: () => true,
        next: () => Promise.resolve(mockNextPage),
      }),
    });

    vi.mocked(useMessages).mockReturnValue(
      createMockUseMessagesResponse({
        historyBeforeSubscribe: mockHistoryBeforeSubscribe,
      })
    );

    const { result } = renderHook(() => useMessageWindow());

    // Wait for the initial load to complete
    await waitFor(() => {
      expect(result.current.activeMessages.length).toBe(3);
      expect(result.current.hasMoreHistory).toBe(true);
    });

    // Load more history
    await act(async () => {
      await result.current.loadMoreHistory();
    });

    // Check that the earlier message was added
    await waitFor(() => {
      expect(result.current.activeMessages.length).toBe(4);
    });
  });

  it('should handle updates to messages already in local state', async () => {
    const msgSerial = getSerial(Date.now());
    const msgSerial2 = getSerial(Date.now() + 1);
    const msgSerial3 = getSerial(Date.now() + 2);

    const msg1 = createMockMessage({
      serial: msgSerial,
      clientId: 'user1',
      text: 'First message',
      timestamp: new Date(Date.now()),
    });

    const msg2 = createMockMessage({
      serial: msgSerial2,
      clientId: 'user2',
      text: 'Second message',
      timestamp: new Date(Date.now()),
    });

    const msg3 = createMockMessage({
      serial: msgSerial3,
      clientId: 'user1',
      text: 'Third message',
      timestamp: new Date(Date.now()),
    });

    vi.mocked(useMessages).mockReturnValue(
      createMockUseMessagesResponse({
        historyBeforeSubscribe: vi.fn().mockResolvedValue(
          createMockPaginatedResult({
            items: [msg1, msg2, msg3],
            hasNext: vi.fn().mockReturnValue(false),
          })
        ),
      })
    );

    const { result } = renderHook(() => useMessageWindow());

    // Wait for initial load - messages should be in order
    await waitFor(() => {
      expect(result.current.activeMessages).toHaveLength(3);
    });

    expect(result.current.activeMessages[0]?.serial).toBe(msgSerial);
    expect(result.current.activeMessages[1]?.serial).toBe(msgSerial2);
    expect(result.current.activeMessages[2]?.serial).toBe(msgSerial3);

    // Create an update message for msg_2
    const updateSerial = getSerial(Date.now() + 3);
    const updateMessage = createMockMessage({
      serial: msgSerial2,
      clientId: 'user2',
      text: 'Updated message 2',
      action: ChatMessageAction.MessageUpdate,
      version: { serial: updateSerial },
    });

    act(() => {
      result.current.updateMessages([updateMessage]);
    });

    // Check that msg_2 was updated
    expect(result.current.activeMessages).toHaveLength(3);
    expect(result.current.activeMessages[1]?.serial).toBe(msgSerial2);
    expect(result.current.activeMessages[1]?.text).toBe('Updated message 2');
    expect(result.current.activeMessages[1]?.version.serial).toBe(updateSerial);

    expect(msg2.with).toHaveBeenCalledWith(updateMessage);
  });

  it('should handle message reactions and ignore reactions for non-existent messages', async () => {
    let reactionsListener: MessageReactionListener | undefined;
    const msgSerial = getSerial(Date.now());

    // Create one message that will receive reactions
    const existingMessage = createMockMessage({
      serial: msgSerial,
      clientId: 'user1',
      text: 'This message will get reactions',
    });

    const stableHistoryBeforeSubscribe = vi.fn().mockResolvedValue(
      createMockPaginatedResult({
        items: [existingMessage],
        hasNext: vi.fn().mockReturnValue(false),
      })
    );

    const stableMockResponse = createMockUseMessagesResponse({
      historyBeforeSubscribe: stableHistoryBeforeSubscribe,
    });

    vi.mocked(useMessages).mockImplementation((params?: UseMessagesParams) => {
      reactionsListener = params?.reactionsListener;
      return stableMockResponse;
    });

    const { result } = renderHook(() => useMessageWindow());

    await waitFor(() => {
      expect(result.current.activeMessages).toHaveLength(1);
    });

    expect(result.current.activeMessages[0]?.serial).toBe(msgSerial);
    expect(result.current.activeMessages[0]?.text).toBe('This message will get reactions');
    expect(result.current.activeMessages[0]?.reactions).toEqual({
      distinct: {},
      unique: {},
      multiple: {},
    });

    // First reaction: Valid reaction for existing message
    act(() => {
      if (reactionsListener) {
        reactionsListener({
          type: MessageReactionEventType.Summary,
          summary: {
            messageSerial: msgSerial, // This message exists
            distinct: {
              '👍': { total: 1, clientIds: ['user1'] },
            },
            unique: {},
            multiple: {},
          },
        });
      }
    });

    await waitFor(() => {
      // The message should now have the reaction
      expect(result.current.activeMessages[0]?.reactions.distinct['👍']).toEqual({
        total: 1,
        clientIds: ['user1'],
      });
    });

    // Reaction for non-existent message
    act(() => {
      if (reactionsListener) {
        reactionsListener({
          type: MessageReactionEventType.Summary,
          summary: {
            messageSerial: getSerial(Date.now() + 1), // This message does not exist in local state so it should be discarded.
            distinct: {
              '❤️': { total: 1, clientIds: ['user2'] },
            },
            unique: {},
            multiple: {},
          },
        });
      }
    });

    // Double check that the active messages haven't changed
    expect(result.current.activeMessages).toHaveLength(1);
    expect(result.current.activeMessages[0]?.serial).toBe(msgSerial);

    // Verify the message still has the correct reactions
    const updatedMessage = result.current.activeMessages[0];
    expect(updatedMessage?.reactions.distinct['👍']).toEqual({
      total: 1,
      clientIds: ['user1'],
    });
    expect(updatedMessage?.reactions.distinct['❤️']).toBeUndefined();
  });

  it('should handle discontinuity recovery', async () => {
    let onDiscontinuityCallback: DiscontinuityListener | undefined;

    const stableHistoryBeforeSubscribe = vi.fn().mockResolvedValue(
      createMockPaginatedResult({
        items: mockMessages,
        hasNext: vi.fn().mockReturnValue(false),
      })
    );

    const stableMockResponse = createMockUseMessagesResponse({
      historyBeforeSubscribe: stableHistoryBeforeSubscribe,
    });

    vi.mocked(useMessages).mockImplementation((params?: UseMessagesParams) => {
      onDiscontinuityCallback = params?.onDiscontinuity;
      return stableMockResponse;
    });

    const { result } = renderHook(() => useMessageWindow());

    await waitFor(() => {
      expect(result.current.activeMessages.length).toBe(3);
    });

    // Simulate a discontinuity event
    act(() => {
      if (onDiscontinuityCallback) {
        onDiscontinuityCallback(new Error('Simulated discontinuity') as ErrorInfo);
      }
    });

    // The discontinuity should trigger a history fetch
    await waitFor(() => {
      expect(stableHistoryBeforeSubscribe).toHaveBeenCalled();
    });
  });

  it('should reset state when room changes', async () => {
    const { result, rerender } = renderHook(() => useMessageWindow());

    await waitFor(() => {
      expect(result.current.activeMessages.length).toBe(3);
    });

    vi.mocked(useRoom).mockReturnValue({
      roomStatus: 'attached' as RoomStatus,
      connectionStatus: 'connected' as ConnectionStatus,
      roomName: 'new-test-room',
      attach: vi.fn(),
      detach: vi.fn(),
    });

    rerender();

    // The state should be reset
    expect(result.current.activeMessages).toEqual([]);
  });

  describe('initial loading logic', () => {
    it('should initialize with empty messages when no history function is available', () => {
      vi.mocked(useMessages).mockReturnValue(
        createMockUseMessagesResponse({
          historyBeforeSubscribe: undefined, // Room not yet resolved, so no history function available
        })
      );

      const { result } = renderHook(() => useMessageWindow());

      expect(result.current.activeMessages).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.hasMoreHistory).toBe(false);
    });

    it('should start loading when history function is available', () => {
      const neverResolvingPromise = new Promise(() => {});
      const mockHistoryBeforeSubscribe = vi.fn().mockReturnValue(neverResolvingPromise);

      vi.mocked(useMessages).mockReturnValue(
        createMockUseMessagesResponse({
          historyBeforeSubscribe: mockHistoryBeforeSubscribe,
        })
      );

      const { result } = renderHook(() => useMessageWindow());

      expect(result.current.loading).toBe(true);
      expect(result.current.hasMoreHistory).toBe(true);
      expect(result.current.activeMessages).toEqual([]);
      expect(mockHistoryBeforeSubscribe).toHaveBeenCalledWith({ limit: 240 }); // windowSize (200) + overscan * 2 (40)
    });

    it('should handle successful history loading with messages', async () => {
      let resolveHistoryPromise: (value: PaginatedResult<Message>) => void;
      const historyPromise = new Promise((resolve) => {
        resolveHistoryPromise = resolve;
      });

      const mockHistoryBeforeSubscribe = vi.fn().mockReturnValue(historyPromise);

      vi.mocked(useMessages).mockReturnValue(
        createMockUseMessagesResponse({
          historyBeforeSubscribe: mockHistoryBeforeSubscribe,
        })
      );

      const { result } = renderHook(() => useMessageWindow());

      // Initially should be loading until the historyBeforeSubscribe has resolved
      expect(result.current.loading).toBe(true);
      expect(result.current.hasMoreHistory).toBe(true);
      expect(result.current.activeMessages).toEqual([]);

      const mockMessage1 = createMockMessage({ serial: getSerial(Date.now()), text: 'Hello' });
      const mockMessage2 = createMockMessage({ serial: getSerial(Date.now() + 1), text: 'World' });
      const mockPage = createMockPaginatedResult({
        items: [mockMessage1, mockMessage2],
        hasNext: () => false,
      });

      await waitFor(() => {
        resolveHistoryPromise(mockPage);
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.hasMoreHistory).toBe(false);
      expect(result.current.activeMessages).toHaveLength(2);
      expect(result.current.activeMessages[0]?.text).toBe('Hello');
      expect(result.current.activeMessages[1]?.text).toBe('World');
    });

    it('should handle successful history loading with more history', async () => {
      let resolveHistoryPromise: (value: PaginatedResult<Message>) => void;
      const historyPromise = new Promise((resolve) => {
        resolveHistoryPromise = resolve;
      });

      const mockHistoryBeforeSubscribe = vi.fn().mockReturnValue(historyPromise);

      vi.mocked(useMessages).mockReturnValue(
        createMockUseMessagesResponse({
          historyBeforeSubscribe: mockHistoryBeforeSubscribe,
        })
      );

      const { result } = renderHook(() => useMessageWindow());

      const mockMessage = createMockMessage({
        serial: getSerial(Date.now()),
        text: 'Only message',
      });
      const mockPage = createMockPaginatedResult({ items: [mockMessage], hasNext: () => true });

      await act(async () => {
        resolveHistoryPromise(mockPage);
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.hasMoreHistory).toBe(true);
      expect(result.current.activeMessages).toHaveLength(1);
      expect(result.current.activeMessages[0]?.text).toBe('Only message');
    });

    it('should handle history loading errors gracefully', async () => {
      const mockHistoryBeforeSubscribe = vi.fn().mockRejectedValue(new Error('Network error'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      vi.mocked(useMessages).mockReturnValue(
        createMockUseMessagesResponse({
          historyBeforeSubscribe: mockHistoryBeforeSubscribe,
        })
      );

      const { result } = renderHook(() => useMessageWindow());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Should stop loading and reset initial load state
      expect(result.current.loading).toBe(false);
      expect(result.current.activeMessages).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('History load failed', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should not load history multiple times for same historyBeforeSubscribe function', () => {
      const mockHistoryBeforeSubscribe = vi.fn().mockReturnValue(new Promise(() => {}));

      vi.mocked(useMessages).mockReturnValue(
        createMockUseMessagesResponse({
          historyBeforeSubscribe: mockHistoryBeforeSubscribe,
        })
      );

      const { rerender } = renderHook(() => useMessageWindow());

      expect(mockHistoryBeforeSubscribe).toHaveBeenCalledTimes(1);

      rerender();

      expect(mockHistoryBeforeSubscribe).toHaveBeenCalledTimes(1);
    });

    it('should reset and reload when historyBeforeSubscribe function changes', async () => {
      const firstHistoryFn = vi.fn().mockResolvedValue(createMockPaginatedResult({ items: [] }));
      const secondHistoryFn = vi.fn().mockResolvedValue(createMockPaginatedResult({ items: [] }));

      const { rerender } = renderHook(
        ({ historyFn }) => {
          vi.mocked(useMessages).mockReturnValue(
            createMockUseMessagesResponse({
              historyBeforeSubscribe: historyFn,
            })
          );
          return useMessageWindow();
        },
        { initialProps: { historyFn: firstHistoryFn } }
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(firstHistoryFn).toHaveBeenCalledTimes(1);
      expect(secondHistoryFn).toHaveBeenCalledTimes(0);

      rerender({ historyFn: secondHistoryFn });

      // Wait for second load to complete
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(firstHistoryFn).toHaveBeenCalledTimes(1);
      expect(secondHistoryFn).toHaveBeenCalledTimes(1);
    });
  });
});
