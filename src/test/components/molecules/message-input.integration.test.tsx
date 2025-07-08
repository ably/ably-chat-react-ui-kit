import { ChatClient, Message, RoomStatus, TypingSetEvent } from '@ably/chat';
import { ChatClientProvider, ChatRoomProvider } from '@ably/chat/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MessageInput } from '../../../components/molecules/message-input.tsx';
import { newChatClient } from '../../helper/chat.ts';
import { waitForArrayLength } from '../../helper/common.ts';
import { randomRoomName } from '../../helper/identifier.ts';
import { waitForRoomStatus } from '../../helper/room.ts';

const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

describe('MessageInput Integration Tests', () => {
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

  it('should send messages when Enter is pressed', async () => {
    const room1 = await chatClient1.rooms.get(roomName);
    const room2 = await chatClient2.rooms.get(roomName);
    await room2.attach();

    let messageSent: Message | undefined;
    let messageReceived: Message | undefined;
    const onSent = (message: Message) => {
      messageSent = message;
    };

    room2.messages.subscribe((message) => {
      messageReceived = message.message;
    });

    const { unmount } = render(
      <ChatClientProvider client={chatClient1}>
        <ChatRoomProvider name={roomName}>
          <MessageInput onSent={onSent} placeholder="Type a message..." />
        </ChatRoomProvider>
      </ChatClientProvider>
    );

    await waitForRoomStatus(room1, RoomStatus.Attached);

    const user = userEvent.setup();

    // Find the message input and type a message
    const messageInput = screen.getByPlaceholderText('Type a message...');
    await user.type(messageInput, 'Hello from message input test!');
    await user.keyboard('{Enter}');

    // Wait for the message to be sent
    await waitFor(() => {
      expect(messageSent).toBeDefined();
      expect(messageReceived).toBeDefined();
    });

    expect(messageSent).toEqual(messageReceived);

    // Verify the input was cleared after sending
    expect(messageInput).toHaveValue('');

    unmount();
  });

  it('should trigger and stop typing indicators when input is set and then cleared', async () => {
    const room1 = await chatClient1.rooms.get(roomName);
    const room2 = await chatClient2.rooms.get(roomName);
    await room2.attach();

    const receivedTypingEvents: TypingSetEvent[] = [];

    // Subscribe to typing events on the second client
    room2.typing.subscribe((typingEvent) => {
      receivedTypingEvents.push(typingEvent);
    });

    render(
      <ChatClientProvider client={chatClient1}>
        <ChatRoomProvider name={roomName}>
          <MessageInput onSent={vi.fn()} placeholder="Type a message..." />
        </ChatRoomProvider>
      </ChatClientProvider>
    );

    await waitForRoomStatus(room1, RoomStatus.Attached);

    const user = userEvent.setup();
    const messageInput = screen.getByPlaceholderText('Type a message...');

    // Type something
    await user.type(messageInput, 'Hello');

    // Wait for typing indicator to be triggered
    await waitFor(
      () => {
        expect(receivedTypingEvents[0]?.change.clientId).toBe(chatClient1.clientId);
        expect(receivedTypingEvents[0]?.change.type).toContain('typing.started');
      },
      { timeout: 3000 }
    );

    // Clear the input
    await user.clear(messageInput);

    // Wait for typing indicator to stop
    await waitFor(
      () => {
        expect(receivedTypingEvents[1]?.change.clientId).toBe(chatClient1.clientId);
        expect(receivedTypingEvents[1]?.change.type).toContain('typing.stopped');
      },
      { timeout: 3000 }
    );

    expect(messageInput).toHaveValue('');
  });

  it('should stop typing indicators when message is sent', async () => {
    const room1 = await chatClient1.rooms.get(roomName);
    const room2 = await chatClient2.rooms.get(roomName);
    await room2.attach();

    const receivedTypingEvents: TypingSetEvent[] = [];

    // Subscribe to typing events on the second client
    room2.typing.subscribe((typingEvent) => {
      receivedTypingEvents.push(typingEvent);
    });

    render(
      <ChatClientProvider client={chatClient1}>
        <ChatRoomProvider name={roomName}>
          <MessageInput onSent={vi.fn()} placeholder="Type a message..." />
        </ChatRoomProvider>
      </ChatClientProvider>
    );

    await waitForRoomStatus(room1, RoomStatus.Attached);

    const user = userEvent.setup();
    const messageInput = screen.getByPlaceholderText('Type a message...');

    // Type and send a message
    await user.type(messageInput, 'Hello world!');
    await user.keyboard('{Enter}');

    await waitForArrayLength(receivedTypingEvents, 2);

    // Wait for typing to start and then stop
    await waitFor(
      () => {
        expect(receivedTypingEvents[0]?.change.clientId).toBe(chatClient1.clientId);
        expect(receivedTypingEvents[0]?.change.type).toContain('typing.started');
        expect(receivedTypingEvents[1]?.change.clientId).toBe(chatClient1.clientId);
        expect(receivedTypingEvents[1]?.change.type).toContain('typing.stopped');
      },
      { timeout: 3000 }
    );
  });
});
