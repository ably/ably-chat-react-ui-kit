// .storybook/mocks/mock-ably-chat.ts

// Define mock return types to match the actual API
interface MockChatClient {
  clientId: string;
  connection: {
    state: string;
  };
}

interface MockTyping {
  currentlyTyping: string[];
  start: () => void;
  stop: () => void;
}

interface MockPresenceData {
  clientId: string;
  data?: any;
}

interface MockPresenceListener {
  presenceData: MockPresenceData[];
}

interface MockMessages {
  messages: any[];
  send: (message: any) => Promise<void>;
  get: () => Promise<any[]>;
}

interface MockPresence {
  presenceData: MockPresenceData[];
  enter: (data?: any) => Promise<void>;
  leave: () => Promise<void>;
  update: (data?: any) => Promise<void>;
}

interface MockRoom {
  room: {
    roomId: string;
    name: string;
  };
  attach: () => Promise<void>;
  detach: () => Promise<void>;
}

// Create the mock implementations
export const useChatClient = (): MockChatClient => ({
  clientId: 'storybook-user',
  connection: {
    state: 'connected',
  },
});

export const useTyping = (): MockTyping => ({
  currentlyTyping: ['user1', 'user2'], // You can customize this for different stories
  start: () => console.log('Mock: Started typing'),
  stop: () => console.log('Mock: Stopped typing'),
});

export const useMessages = (): MockMessages => ({
  messages: [],
  send: async () => {
    console.log('Mock: Message sent');
  },
  get: async () => {
    console.log('Mock: Getting messages');
    return [];
  },
});

export const usePresence = (): MockPresence => ({
  presenceData: [
    { clientId: 'user1' },
    { clientId: 'user2' },
    { clientId: 'user3' },
  ],
  enter: async () => {
    console.log('Mock: Entered presence');
  },
  leave: async () => {
    console.log('Mock: Left presence');
  },
  update: async () => {
    console.log('Mock: Updated presence');
  },
});

export const usePresenceListener = (): MockPresenceListener => ({
  presenceData: [
    { clientId: 'Alice' },
    { clientId: 'Bob' },
    { clientId: 'Charlie' },
  ],
});

export const useRoom = (): MockRoom => ({
  room: {
    roomId: 'storybook-room',
    name: 'Storybook Room',
  },
  attach: async () => {
    console.log('Mock: Room attached');
  },
  detach: async () => {
    console.log('Mock: Room detached');
  },
});