import { ChatClient, ChatMessageEvent, Message, MessageReactionType, RoomStatus } from '@ably/chat';
import { ChatClientProvider, ChatRoomProvider } from '@ably/chat/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatWindow } from '../../../components/molecules/chat-window.tsx';
import { AvatarProvider } from '../../../providers/avatar-provider.tsx';
import { newChatClient } from '../../helper/chat.ts';
import { randomRoomName } from '../../helper/identifier.ts';
import { waitForRoomStatus } from '../../helper/room.ts';

const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

describe('ChatWindow Integration Tests', () => {
  let chatClient1: ChatClient;
  let chatClient2: ChatClient;
  let roomName: string;
  const originalError = console.error;

  beforeEach(() => {
    chatClient1 = newChatClient();
    chatClient2 = newChatClient();
    roomName = randomRoomName();

    // Silence console errors related to act warnings, we are testing async behavior with integration tests
    vi.spyOn(console, 'error').mockImplementation((...args) => {
      if (typeof args[0] === 'string' && args[0].includes('not wrapped in act')) {
        return;
      }
      originalError.call(console, args);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should send and receive messages between clients', async () => {
    const room1 = await chatClient1.rooms.get(roomName);
    const room2 = await chatClient2.rooms.get(roomName);
    await room2.attach();

    const messagesReceived: Message[] = [];

    // Subscribe to messages on the second client
    room2.messages.subscribe((message: ChatMessageEvent) => {
      messagesReceived.push(message.message);
    });

    const { unmount } = render(
      <ChatClientProvider client={chatClient1}>
        <AvatarProvider>
          <ChatRoomProvider key={roomName} name={roomName}>
            <ChatWindow roomName={roomName} />
          </ChatRoomProvider>
        </AvatarProvider>
      </ChatClientProvider>
    );

    // Wait for the component to render
    await waitFor(
      () => {
        expect(screen.getByRole('main')).toBeInTheDocument();
        expect(screen.getByRole('log')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // wait for the room to be attached
    await waitForRoomStatus(room1, RoomStatus.Attached);

    const user = userEvent.setup();

    // Find the message input and send a message
    const messageInput = screen.getByPlaceholderText(`Message ${roomName}...`);
    await user.type(messageInput, 'Hello from integration test!');
    await user.keyboard('{Enter}');

    // Wait for the message to be received by the second client
    await waitFor(
      () => {
        expect(messagesReceived).toHaveLength(1);
        expect(messagesReceived[0]?.text).toBe('Hello from integration test!');
      },
      { timeout: 5000 }
    );
    unmount();
  });

  it('should display typing indicators when another user is typing', async () => {
    const room1 = await chatClient1.rooms.get(roomName);
    const room2 = await chatClient2.rooms.get(roomName);
    await room2.attach();

    render(
      <ChatClientProvider client={chatClient1}>
        <ChatRoomProvider key={roomName} name={roomName}>
          <ChatWindow roomName={roomName} enableTypingIndicators={true} />
        </ChatRoomProvider>
      </ChatClientProvider>
    );

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    // wait for the room to be attached
    await waitForRoomStatus(room1, RoomStatus.Attached);

    await room2.typing.keystroke();

    // Wait for typing indicators to appear
    await waitFor(
      () => {
        const typingIndicators = screen.queryByText(/typing/i);
        expect(typingIndicators).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    await room2.typing.stop();

    // Wait for typing indicators to disappear
    await waitFor(
      () => {
        const typingIndicators = screen.queryByText(/typing/i);
        expect(typingIndicators).not.toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it('should handle message reactions from other clients', async () => {
    const room1 = await chatClient1.rooms.get(roomName);
    const room2 = await chatClient2.rooms.get(roomName);
    await room2.attach();

    let sentMessage: Message | undefined = undefined;

    room2.messages.subscribe((message) => {
      sentMessage = message.message;
    });

    render(
      <ChatClientProvider client={chatClient1}>
        <AvatarProvider>
          <ChatRoomProvider key={roomName} name={roomName}>
            <ChatWindow roomName={roomName} />
          </ChatRoomProvider>
        </AvatarProvider>
      </ChatClientProvider>
    );

    await waitForRoomStatus(room1, RoomStatus.Attached);

    const user = userEvent.setup();

    // Find the message input and send a message
    const messageInput = screen.getByPlaceholderText(`Message ${roomName}...`);
    await user.type(messageInput, 'Message for reaction test');
    await user.keyboard('{Enter}');

    // Wait for the message to be sent and received
    await waitFor(
      () => {
        expect(sentMessage).toBeDefined();
      },
      { timeout: 5000 }
    );

    // Add a reaction from the second client
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await room2.messages.reactions.send(sentMessage!.serial, {
      type: MessageReactionType.Distinct,
      name: '👍',
    });

    // Wait for the reaction to appear in the UI
    await waitFor(
      () => {
        const reactionElement = screen.queryByText('👍');
        expect(reactionElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it('should join presence on mount', async () => {
    const room1 = await chatClient1.rooms.get(roomName);
    const room2 = await chatClient2.rooms.get(roomName);
    await room2.attach();

    render(
      <ChatClientProvider client={chatClient1}>
        <AvatarProvider>
          <ChatRoomProvider key={roomName} name={roomName}>
            <ChatWindow roomName={roomName} />
          </ChatRoomProvider>
        </AvatarProvider>
      </ChatClientProvider>
    );

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    await waitForRoomStatus(room1, RoomStatus.Attached, 5000);

    // Wait for presence to be updated
    await waitFor(
      async () => {
        expect(await room2.presence.get()).toHaveLength(1);
      },
      { timeout: 5000 }
    );
  });
});
