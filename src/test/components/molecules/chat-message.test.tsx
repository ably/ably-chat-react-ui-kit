import { ChatMessageAction } from '@ably/chat';
import { useChatClient } from '@ably/chat/react';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockMessage } from '../../../../.storybook/mocks/mock-ably-chat.ts';
import { ChatMessage } from '../../../components/molecules/chat-message.tsx';

// Mock the useChatClient hook
vi.mock('@ably/chat/react', () => ({
  useChatClient: vi.fn(),
}));

// Mock the useUserAvatar hook so we don't need to provide an actual avatar context
vi.mock('../../../../src/hooks/use-user-avatar.tsx', () => ({
  useUserAvatar: () => ({
    userAvatar: {
      displayName: 'Test User',
      initials: 'TU',
      color: '#ff0000',
    },
  }),
}));

vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  };
});

vi.mock('../../../../src/components/molecules/emoji-picker.tsx', () => ({
  EmojiPicker: ({
    onEmojiSelect,
    onClose,
  }: {
    onEmojiSelect: (emoji: string) => void;
    onClose: () => void;
  }) => (
    <div role="dialog" aria-label="Emoji Picker" data-testid="emoji-picker">
      <button
        onClick={() => {
          onEmojiSelect('👍');
        }}
        data-testid="emoji-👍"
      >
        👍
      </button>
      <button
        onClick={() => {
          onEmojiSelect('❤️');
        }}
        data-testid="emoji-❤️"
      >
        ❤️
      </button>
      <button onClick={onClose} data-testid="close-emoji-picker">
        Close
      </button>
    </div>
  ),
}));

describe('ChatMessage', () => {
  beforeEach(() => {
    (useChatClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      clientId: 'user1',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders a message correctly', () => {
    const message = createMockMessage({
      clientId: 'user1',
      text: 'Hello, world!',
    });

    render(<ChatMessage message={message} />);

    expect(screen.getByText('Hello, world!')).toBeInTheDocument();
    expect(screen.getByLabelText(/Avatar for user1/i)).toBeInTheDocument();
  });

  it('shows edit/delete options for own messages when hovered', () => {
    (useChatClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      clientId: 'user1',
    });

    const message = createMockMessage({
      clientId: 'user1',
      text: 'My message',
    });

    render(<ChatMessage message={message} />);

    // Find the message bubble container
    const messageBubble = screen.getByText('My message').closest('div');
    expect(messageBubble).toBeInTheDocument();

    // Hover over the message
    if (messageBubble) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      fireEvent.mouseEnter(messageBubble.parentElement!);
    }

    // Check if edit and delete buttons appear
    expect(screen.getByLabelText(/edit message/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/delete message/i)).toBeInTheDocument();

    // Reset the mock
    vi.mocked(useChatClient).mockReset();
  });

  it('calls onEdit when editing a message', () => {
    (useChatClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      clientId: 'user1',
    });

    const message = createMockMessage({
      clientId: 'user1',
      text: 'Original text',
    });

    const handleEdit = vi.fn();

    render(<ChatMessage message={message} onEdit={handleEdit} />);

    // Find the message bubble container and hover
    const messageBubble = screen.getByText('Original text').closest('div');
    if (messageBubble) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      fireEvent.mouseEnter(messageBubble.parentElement!);
    }

    // Click edit button
    fireEvent.click(screen.getByLabelText(/edit message/i));

    // Edit the text
    const input = screen.getByLabelText(/edit message text/i);
    fireEvent.change(input, { target: { value: 'Updated text' } });

    // Save the edit
    fireEvent.click(screen.getByText('Save'));

    // Check if onEdit was called with correct params
    expect(handleEdit).toHaveBeenCalledWith(message, 'Updated text');

    // Reset the mock
    vi.mocked(useChatClient).mockReset();
  });

  it('shows deleted message state', () => {
    const message = createMockMessage({
      clientId: 'user1',
      text: 'This message was deleted',
      action: ChatMessageAction.MessageDelete,
      isDeleted: true,
    });

    render(<ChatMessage message={message} />);

    expect(screen.getByText(/message deleted/i)).toBeInTheDocument();
  });

  it('displays message reactions', () => {
    // Create a message with reactions
    const message = createMockMessage({
      clientId: 'user1',
      text: 'Message with reactions',
      reactions: {
        distinct: {
          '👍': { total: 2, clientIds: ['user1', 'user2'] },
          '❤️': { total: 1, clientIds: ['user3'] },
        },
        unique: {},
        multiple: {},
      },
    });

    render(<ChatMessage message={message} />);

    // Check if reactions are displayed
    expect(screen.getByText('👍')).toBeInTheDocument();
    expect(screen.getByText('❤️')).toBeInTheDocument();

    // Check if reaction counts are displayed
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('calls onReactionAdd when adding a reaction', () => {
    const message = createMockMessage({
      clientId: 'user1',
      text: 'React to this message',
    });

    const handleReactionAdd = vi.fn();

    render(<ChatMessage message={message} onReactionAdd={handleReactionAdd} />);

    // Find the message bubble container and hover
    const messageBubble = screen.getByText('React to this message').closest('div');
    if (messageBubble) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      fireEvent.mouseEnter(messageBubble.parentElement!);
    }

    // Click the add reaction button
    fireEvent.click(screen.getByLabelText(/add reaction/i));

    // Verify emoji picker is shown
    const emojiPicker = screen.getByTestId('emoji-picker');
    expect(emojiPicker).toBeInTheDocument();

    // Click on an emoji in the picker
    fireEvent.click(screen.getByTestId('emoji-👍'));

    // Check if onReactionAdd was called with correct parameters
    expect(handleReactionAdd).toHaveBeenCalledWith(message, '👍');
  });

  it('calls onReactionRemove when removing a reaction', () => {
    (useChatClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      clientId: 'user2',
    });

    // Create a message with reactions where the current user has already reacted
    const message = createMockMessage({
      clientId: 'user1',
      text: 'Message with reactions',
      reactions: {
        distinct: {
          '👍': { total: 2, clientIds: ['user1', 'user2'] }, // Current user (user2) has reacted
          '❤️': { total: 1, clientIds: ['user3'] },
        },
        unique: {},
        multiple: {},
      },
    });

    const handleReactionRemove = vi.fn();

    render(<ChatMessage message={message} onReactionRemove={handleReactionRemove} />);

    // Find and click on the 👍 reaction (which the current user has already added)
    const thumbsUpReaction = screen.getByText('👍');
    fireEvent.click(thumbsUpReaction);

    // Check if onReactionRemove was called with correct parameters
    expect(handleReactionRemove).toHaveBeenCalledWith(message, '👍');

    // Reset the mock
    vi.mocked(useChatClient).mockReset();
  });
});
