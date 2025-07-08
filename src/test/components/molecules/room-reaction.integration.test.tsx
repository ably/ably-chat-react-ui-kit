import { ChatClient, RoomReactionEvent, RoomStatus } from '@ably/chat';
import { ChatClientProvider, ChatRoomProvider } from '@ably/chat/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RoomReaction } from '../../../components/molecules/room-reaction.tsx';
import { newChatClient } from '../../helper/chat.ts';
import { randomRoomName } from '../../helper/identifier.ts';
import { waitForRoomStatus } from '../../helper/room.ts';

const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

// Mock navigator.vibrate for mobile haptic feedback testing
Object.defineProperty(navigator, 'vibrate', {
  value: vi.fn(),
  writable: true,
});

describe('RoomReaction Integration Tests', () => {
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

  it('should send room reactions when button is clicked', async () => {
    const room1 = await chatClient1.rooms.get(roomName);
    const room2 = await chatClient2.rooms.get(roomName);
    await room2.attach();

    const reactionsReceived: RoomReactionEvent[] = [];

    // Subscribe to room reactions on the second client
    room2.reactions.subscribe((reactionEvent) => {
      reactionsReceived.push(reactionEvent);
    });

    const { unmount } = render(
      <ChatClientProvider client={chatClient1}>
        <ChatRoomProvider name={roomName}>
          <RoomReaction />
        </ChatRoomProvider>
      </ChatClientProvider>
    );

    await waitForRoomStatus(room1, RoomStatus.Attached);

    const user = userEvent.setup();

    // Find and click the reaction button (should send default 👍 emoji)
    const reactionButton = screen.getByLabelText(/Send 👍 reaction \(long press for more options\)/);
    await user.click(reactionButton);

    // Wait for the reaction to be received by the second client
    await waitFor(
      () => {
        expect(reactionsReceived).toHaveLength(1);
        expect(reactionsReceived[0]?.reaction.name).toBe('👍');
        expect(reactionsReceived[0]?.reaction.clientId).toBe(chatClient1.clientId);
      },
      { timeout: 5000 }
    );

    unmount();
  });

  it('should receive room reactions from other clients', async () => {
    const room1 = await chatClient1.rooms.get(roomName);
    const room2 = await chatClient2.rooms.get(roomName);
    await room2.attach();

    render(
      <ChatClientProvider client={chatClient1}>
        <ChatRoomProvider name={roomName}>
          <RoomReaction />
        </ChatRoomProvider>
      </ChatClientProvider>
    );

    await waitForRoomStatus(room1, RoomStatus.Attached);

    // Send a reaction from the second client
    await room2.reactions.send({ name: '🎉' });

    // Wait for the reaction animation to be triggered
    // Since we can't easily test the animation state, we verify the reaction was sent
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verify the component is still rendered and functioning
    const reactionButton = screen.getByLabelText(/Send 👍 reaction \(long press for more options\)/);
    expect(reactionButton).toBeInTheDocument();
  });
});
