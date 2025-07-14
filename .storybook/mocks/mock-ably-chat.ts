// .storybook/mocks/mock-ably-chat.ts

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import {
  ChatClient,
  ChatMessageAction,
  ConnectionStatus,
  Message,
  MessageReactions,
  PaginatedResult, PresenceData,
  PresenceMember,
  QueryOptions,
  Room,
  RoomStatus,
  Connection, OccupancyData,
} from '@ably/chat';
import {
  ChatRoomProviderProps, UseChatConnectionResponse,
  UseMessagesResponse, UseOccupancyResponse,
  UsePresenceListenerResponse, UsePresenceResponse, UseRoomReactionsResponse,
  UseRoomResponse, UseTypingResponse,
} from '@ably/chat/react';
import { ChatSettings, ChatSettingsContextType } from '../../src';

interface MockOverrides {
  occupancy?: OccupancyData
  presenceData?: PresenceMember[]
  currentlyTyping?: string[]
  messages?: Message[];
  clientId?: string;
  roomName?: string;
  isPresent?: boolean;
  connectionStatus?: ConnectionStatus;
  chatSettings?: ChatSettings
}

const MockOverridesContext = createContext<MockOverrides>({});

const useMockOverrides = () => useContext(MockOverridesContext);

const mockPaginatedResultWithItems = (items: Message[]): PaginatedResult<Message> => {
  return {
    items,
    first: () => Promise.resolve(mockPaginatedResultWithItems(items)),
    next: () => Promise.resolve(null),
    current: () => Promise.resolve(mockPaginatedResultWithItems(items)),
    hasNext: () => false,
    isLast: () => true,
  };
};

export interface MockChatRoomProviderProps extends ChatRoomProviderProps {
  mockOverrides?: MockOverrides;
}


export const ChatRoomProvider = ({
  children,
  name,
  mockOverrides = {},
  ...props
}: Partial<MockChatRoomProviderProps>) => {
  return React.createElement(
    MockOverridesContext.Provider,
    { value: mockOverrides },
    React.createElement(
      'div',
      {
        'data-testid': `chat-room-${name}`,
        'data-mock-overrides': JSON.stringify(mockOverrides),
      },
      children
    )
  );
};

export interface ChatClientProviderProps {
  children?: ReactNode | ReactNode[] | null;
  client: any;
  mockOverrides?: MockOverrides;
}

export const ChatClientProvider = ({
  children,
  client,
  mockOverrides = {},
  ...props
}: ChatClientProviderProps) => {
  return React.createElement(
    MockOverridesContext.Provider,
    { value: mockOverrides },
    React.createElement(
      'div',
      {
        'data-testid': 'chat-client-provider',
        'data-mock-overrides': JSON.stringify(mockOverrides),
      },
      children
    )
  );
};

export const useChatClient = (): Partial<ChatClient> => {
  const overrides = useMockOverrides();

  return {
    clientId: overrides.clientId || 'storybook-user',
  };
};

export function emptyMessageReactions(): MessageReactions {
  return {
    unique: {},
    distinct: {},
    multiple: {},
  };
}

export const createMockMessage = (overrides: Partial<Message> = {}): Message => {
  const defaults: Partial<Message> = {
    serial: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    clientId: 'mock-user',
    text: 'my chat message',
    createdAt: new Date(),
    timestamp: new Date(),
    metadata: {},
    headers: {},
    action: ChatMessageAction.MessageCreate,
    version: '1',
    reactions: emptyMessageReactions(),
    operation: undefined,

    get isUpdated() { return this.action === ChatMessageAction.MessageUpdate; },
    get isDeleted() { return this.action === ChatMessageAction.MessageDelete; },
    get deletedBy() { return this.isDeleted ? this.operation?.clientId : undefined; },
    get updatedBy() { return this.isUpdated ? this.operation?.clientId : undefined; },
    get deletedAt() { return this.isDeleted ? this.timestamp : undefined; },
    get updatedAt() { return this.isUpdated ? this.timestamp : undefined; },

    before: () => false,
    after: () => true,
    equal: (other: Message) => defaults.serial === other.serial,
    isSameAs: (other: Message) => defaults.serial === other.serial,
    isOlderVersionOf: () => false,
    isNewerVersionOf: () => false,
    isSameVersionAs: () => true,

    with: () => createMockMessage(overrides),
    copy: (updates: any = {}) => createMockMessage({ ...overrides, ...updates }),
  };

  return { ...defaults, ...overrides } as Message;
};

export const newChatMessage = (text: string, clientId: string): Message => {
  return createMockMessage({ text, clientId });
};

export const useMessages = (options?: {
  listener?: any;
  reactionsListener?: any;
  onDiscontinuity?: any;
}): UseMessagesResponse => {
  const overrides = useMockOverrides();

  // Create stable mock paginated result
  const mockPaginatedResult = useMemo(() => {
    const mockMessages: Message[] = overrides.messages || [
      createMockMessage({
        serial: 'msg_1',
        clientId: 'user1',
        text: 'Hey, how are you doing today?',
        createdAt: new Date(Date.now() - 1000 * 60 * 5),
        updatedAt: new Date(Date.now() - 1000 * 60 * 5),
        isUpdated: false,
        isDeleted: false,
        reactions: emptyMessageReactions(),
      }),
      createMockMessage({
        serial: 'msg_2',
        clientId: 'user2',
        text: "I'm good, thanks! Working on the new chat UI.",
        createdAt: new Date(Date.now() - 1000 * 60 * 4),
        updatedAt: new Date(Date.now() - 1000 * 60 * 4),
        isUpdated: false,
        isDeleted: false,
        reactions: {
          distinct: {
            '😊': { total: 2, clientIds: ['user1', 'user2'] },
          },
          unique: {},
          multiple: {},
        },
      }),
    ];

    const createMockPaginatedResult = (items: any[]): PaginatedResult<Message> => ({
      items: items as unknown as Message[],
      hasNext: () => false,
      isLast: () => true,
      next: async () => null,
      first: async () => createMockPaginatedResult(items),
      current: async () => createMockPaginatedResult(items),
    });

    return createMockPaginatedResult(mockMessages);
  }, [overrides.messages]);


  const historyBeforeSubscribe = useCallback(
    async (options: QueryOptions) => {
      console.log('Mock: Getting message history', options);
      return mockPaginatedResult;
    },
    [mockPaginatedResult]
  );

  return {
    history(options: QueryOptions): Promise<PaginatedResult<Message>> {
      return Promise.resolve(mockPaginatedResult)
    },
    roomStatus: RoomStatus.Attached,
    connectionStatus: ConnectionStatus.Connected,
    historyBeforeSubscribe,
    send: async (params) => {
      console.log('Mock: Message sent', params);
      return createMockMessage({
        text: params.text || '',
        clientId: overrides.clientId || 'storybook-user',
      });
    },
    update: async (serial, params, details) => {
      console.log('Mock: Message updated', serial, params);
      const serialString = (serial as { serial: string }).serial;
      return createMockMessage({
        serial: serialString,
        text: params.text || 'Updated message',
        clientId: overrides.clientId || 'storybook-user',
        action: ChatMessageAction.MessageUpdate,
        version: '2',
        metadata: params.metadata || {},
        headers: params.headers || {},
      });
    },
    deleteMessage: async (serial: string, params?: any) => {
      console.log('Mock: Message deleted', serial);
      return createMockMessage({
        serial,
        text: 'Message deleted',
        clientId: overrides.clientId || 'storybook-user',
        action: ChatMessageAction.MessageDelete,
        version: '2',
      });
    },
    sendReaction: async (params: any) => {
      console.log('Mock: Reaction sent', params);
      return Promise.resolve();
    },
    deleteReaction: async (params: any) => {
      console.log('Mock: Reaction deleted', params);
      return Promise.resolve();
    }
  };
};

export const useOccupancy = (): UseOccupancyResponse => {
  const overrides = useMockOverrides();

  return {
    roomStatus: RoomStatus.Attached,
    connectionStatus: ConnectionStatus.Connected,
    connections: overrides.occupancy?.connections ?? 5,
    presenceMembers: overrides.occupancy?.presenceMembers ?? 3,
  };
};

export const usePresence = (): UsePresenceResponse => {
  const overrides = useMockOverrides();

  return {
    roomStatus: RoomStatus.Attached,
    connectionStatus: ConnectionStatus.Connected,
    isPresent: overrides.isPresent ?? true,
    update: async () => {
      console.log('Mock: Updated presence');
    },
  };
};

export const usePresenceListener = (): UsePresenceListenerResponse => {
  const overrides = useMockOverrides();

  const defaultPresenceData: Partial<PresenceData> = [
    { clientId: 'Alice', data: { name: 'Alice' } },
    { clientId: 'Bob', data: { name: 'Bob' } },
    { clientId: 'Charlie', data: { name: 'Charlie' } },
  ];

  return {
    roomStatus: RoomStatus.Attached,
    connectionStatus: ConnectionStatus.Connected,
    presenceData: overrides.presenceData ?? defaultPresenceData as PresenceMember[]
  };
};

export const useRoom = (): UseRoomResponse => {
  const overrides = useMockOverrides();

  // Create stable room object using Partial<Room>
  const mockRoom = useMemo((): Partial<Room> => ({
    name: overrides.roomName || 'Storybook Room',
    // Add other Room properties as your components need them
  }), [overrides.roomName]);

  return {
    roomStatus: RoomStatus.Attached,
    connectionStatus: ConnectionStatus.Connected,
    roomName: overrides.roomName || 'general',
    room: mockRoom as Room, // Still need to cast for the return type
    attach: async () => {
      console.log('Mock: Room attached');
    },
    detach: async () => {
      console.log('Mock: Room detached');
    },
  };
};

export const useTyping = (): UseTypingResponse => {
  const overrides = useMockOverrides();

  const defaultTypingUsers = ['user1', 'user2'];
  const typingUsers = overrides.currentlyTyping ?? defaultTypingUsers;

  return {
    roomStatus: RoomStatus.Attached,
    connectionStatus: ConnectionStatus.Connected,
    currentlyTyping: new Set(typingUsers),
    keystroke: async () => {
      console.log('Mock: Keystroke detected');
    },
    stop: async () => {
      console.log('Mock: Stopped typing');
    },
  };
};

const newConnection = (args: Partial<Connection>): Connection => {
  return {
    ...args
  } as Connection
}

export class MockChatClient implements Partial<ChatClient> {
  public clientId: string;
  public connection: Connection;

  constructor(options?: { clientId?: string }) {
    this.clientId = options?.clientId || 'storybook-user';
    this.connection = newConnection({status: ConnectionStatus.Connected});
  }
}

export const useChatConnection = (): Partial<UseChatConnectionResponse> => {
  const overrides = useMockOverrides();
  
  return {
    currentStatus: overrides.connectionStatus || ConnectionStatus.Connected,
  };
};

export const useChatSettings = (): Partial<ChatSettingsContextType> => {
  const overrides = useMockOverrides();
  
  const defaultSettings: ChatSettings = {
    allowMessageUpdatesOwn: true,
    allowMessageUpdatesAny: false,
    allowMessageDeletesOwn: true,
    allowMessageDeletesAny: false,
    allowMessageReactions: true,
  };
  
  const settings = { ...defaultSettings, ...overrides.chatSettings };
  
  return {
    globalSettings: settings,
    getEffectiveSettings: (roomName?: string) => settings,
  };
};

export const useRoomReactions = (): UseRoomReactionsResponse => {
  return {
    roomStatus: RoomStatus.Attached,
    connectionStatus: ConnectionStatus.Connected,
    send: async (reaction: { name: string; metadata?: any }) => {
      console.log('Mock: Room reaction sent', reaction);
    },
  };
};


export const createMockScenario = {
  noParticipants: (): MockOverrides => ({
    presenceData: [],
    occupancy: {
      connections: 0,
      presenceMembers: 0,
    },
    currentlyTyping: [],
  }),

  manyParticipants: (count: number = 20): MockOverrides => ({
    presenceData: Array.from({ length: count }, (_, i) => ({
      clientId: `User${i + 1}`,
      data: { name: `User ${i + 1}` },
    })) as PresenceMember[],
    occupancy: {
      connections: count,
      presenceMembers: count,
    },
    currentlyTyping: Array.from({ length: count }, (_, i) => `User${i + 1}`),
  }),
};
