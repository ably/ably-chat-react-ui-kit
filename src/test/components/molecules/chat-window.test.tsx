import { MessageReactionType } from '@ably/chat';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockMessage } from '../../../../.storybook/mocks/mock-ably-chat.ts';
import { ChatMessageListProps } from '../../../components/molecules/chat-message-list.tsx';
import { ChatWindow } from '../../../components/molecules/chat-window.tsx';
import { ChatWindowFooterProps } from '../../../components/molecules/chat-window-footer.tsx';
import { ChatWindowHeaderProps } from '../../../components/molecules/chat-window-header.tsx';
import { MessageInputProps } from '../../../components/molecules/message-input.tsx';

const mockSend = vi.fn().mockResolvedValue({});
const mockDeleteMessage = vi.fn().mockResolvedValue({});
const mockUpdate = vi.fn().mockResolvedValue({});
const mockSendReaction = vi.fn().mockResolvedValue({});
const mockDeleteReaction = vi.fn().mockResolvedValue({});
const mockGetEffectiveSettings = vi.fn().mockReturnValue({
  allowMessageEdits: true,
  allowMessageDeletes: true,
  allowMessageReactions: true,
});

// Mock the Ably Chat hooks
vi.mock('@ably/chat/react', () => ({
  useChatClient: () => ({ clientId: 'test-user' }),
  useMessages: () => ({
    send: mockSend,
    deleteMessage: mockDeleteMessage,
    update: mockUpdate,
    sendReaction: mockSendReaction,
    deleteReaction: mockDeleteReaction,
  }),
  usePresence: vi.fn(),
}));

// Mock the custom hooks
vi.mock('../../../hooks/use-chat-settings.tsx', () => ({
  useChatSettings: () => ({
    getEffectiveSettings: mockGetEffectiveSettings,
  }),
}));

// Mocks the useMessageWindow hook
vi.mock('../../../hooks/use-message-window', () => ({
  useMessageWindow: () => ({
    activeMessages: [
      createMockMessage({ serial: 'msg1', clientId: 'user1', text: 'Hello world' }),
      createMockMessage({ serial: 'msg2', clientId: 'user2', text: 'How are you?' }),
      createMockMessage({ serial: 'msg3', clientId: 'user1', text: 'I am fine, thanks!' }),
    ],
    updateMessages: vi.fn(),
    showLatestMessages: vi.fn(),
    showMessagesAroundSerial: vi.fn(),
    loadMoreHistory: vi.fn(),
    hasMoreHistory: true,
    loading: false,
  }),
}));

// Mocks the ChatMessageList
vi.mock('../../../components/molecules/chat-message-list', () => ({
  ChatMessageList: ({
    messages,
    currentClientId,
    isLoading,
    onLoadMoreHistory,
    hasMoreHistory,
    enableTypingIndicators,
    onEdit,
    onDelete,
    onReactionAdd,
    onReactionRemove,
    onMessageInView,
    onViewLatest,
    children,
  }: ChatMessageListProps) => {
    const mockMessage = messages[0];
    if (!mockMessage) {
      return <div data-testid="chat-message-list-empty">No message</div>;
    }
    return (
      <div data-testid="chat-message-list">
        <div>Messages: {messages.length}</div>
        <div>Current Client ID: {currentClientId}</div>
        <div>Loading: {isLoading ? 'true' : 'false'}</div>
        <div>Has More History: {hasMoreHistory ? 'true' : 'false'}</div>
        <div>Enable Typing Indicators: {enableTypingIndicators ? 'true' : 'false'}</div>
        {onEdit && (
          <button
            data-testid="edit-message-button"
            onClick={() => {
              onEdit(mockMessage, 'Edited message');
            }}
          >
            Edit Message
          </button>
        )}
        {onDelete && (
          <button
            data-testid="delete-message-button"
            onClick={() => {
              onDelete(mockMessage);
            }}
          >
            Delete Message
          </button>
        )}
        {onReactionAdd && (
          <button
            data-testid="add-reaction-button"
            onClick={() => {
              onReactionAdd(mockMessage, '👍');
            }}
          >
            Add Reaction
          </button>
        )}
        {onReactionRemove && (
          <button
            data-testid="remove-reaction-button"
            onClick={() => {
              onReactionRemove(mockMessage, '👍');
            }}
          >
            Remove Reaction
          </button>
        )}
        {onLoadMoreHistory && (
          <button data-testid="load-more-history-button" onClick={onLoadMoreHistory}>
            Load More History
          </button>
        )}
        {onMessageInView && (
          <button
            data-testid="message-in-view-button"
            onClick={() => {
              onMessageInView('msg1');
            }}
          >
            Message In View
          </button>
        )}
        {onViewLatest && (
          <button data-testid="view-latest-button" onClick={onViewLatest}>
            View Latest
          </button>
        )}
        {children}
      </div>
    );
  },
}));

vi.mock('../../../components/molecules/chat-window-header', () => ({
  ChatWindowHeader: ({ children }: ChatWindowHeaderProps) => (
    <div data-testid="chat-window-header">{children}</div>
  ),
}));

vi.mock('../../../components/molecules/chat-window-footer', () => ({
  ChatWindowFooter: ({ children }: ChatWindowFooterProps) => (
    <div data-testid="chat-window-footer">{children}</div>
  ),
}));

vi.mock('../../../components/molecules/message-input', () => ({
  MessageInput: ({ onSend, placeholder }: MessageInputProps) => (
    <div data-testid="message-input">
      <input data-testid="message-input-field" placeholder={placeholder} />
      <button
        data-testid="send-message-button"
        onClick={() => {
          onSend('New message');
        }}
      >
        Send
      </button>
    </div>
  ),
}));

describe('ChatWindow', () => {
  // Mock console.error to prevent test output pollution
  const originalConsoleError = console.error;

  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('renders with basic props', () => {
    render(<ChatWindow roomName="general" />);

    // Check if main components are rendered
    expect(screen.getByTestId('chat-message-list')).toBeInTheDocument();
    expect(screen.getByTestId('chat-window-footer')).toBeInTheDocument();
    expect(screen.getByTestId('message-input')).toBeInTheDocument();

    // Header should not be rendered without customHeaderContent
    expect(screen.queryByTestId('chat-window-header')).not.toBeInTheDocument();
  });

  it('renders custom header content when provided', () => {
    render(
      <ChatWindow
        roomName="general"
        customHeaderContent={<div data-testid="custom-header">Custom Header</div>}
      />
    );

    expect(screen.getByTestId('chat-window-header')).toBeInTheDocument();
    expect(screen.getByTestId('custom-header')).toBeInTheDocument();
    expect(screen.getByText('Custom Header')).toBeInTheDocument();
  });

  it('renders custom footer content when provided', () => {
    render(
      <ChatWindow
        roomName="general"
        customFooterContent={<div data-testid="custom-footer">Custom Footer</div>}
      />
    );

    expect(screen.getByTestId('chat-window-footer')).toBeInTheDocument();
    expect(screen.getByTestId('custom-footer')).toBeInTheDocument();
    expect(screen.getByText('Custom Footer')).toBeInTheDocument();
  });

  it('passes enableTypingIndicators prop to ChatMessageList', () => {
    render(<ChatWindow roomName="general" enableTypingIndicators={true} />);

    expect(screen.getByText('Enable Typing Indicators: true')).toBeInTheDocument();

    // Render with typing indicators disabled
    render(<ChatWindow roomName="general" enableTypingIndicators={false} />);

    expect(screen.getByText('Enable Typing Indicators: false')).toBeInTheDocument();
  });

  it('sends a message when the send button is clicked', () => {
    vi.clearAllMocks();

    render(<ChatWindow roomName="general" />);

    // Click the send button
    fireEvent.click(screen.getByTestId('send-message-button'));

    // Check if the send function was called with the correct text
    expect(mockSend).toHaveBeenCalledWith({ text: 'New message' });
  });

  it('edits a message when edit button is clicked', () => {
    vi.clearAllMocks();

    render(<ChatWindow roomName="general" />);

    // Click the edit button
    fireEvent.click(screen.getByTestId('edit-message-button'));

    // Check if the update function was called
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('deletes a message when delete button is clicked', () => {
    vi.clearAllMocks();

    render(<ChatWindow roomName="general" />);

    // Click the delete button
    fireEvent.click(screen.getByTestId('delete-message-button'));

    // Check if the deleteMessage function was called
    expect(mockDeleteMessage).toHaveBeenCalled();
  });

  it('adds a reaction when add reaction button is clicked', () => {
    vi.clearAllMocks();

    render(<ChatWindow roomName="general" />);

    // Click the add reaction button
    fireEvent.click(screen.getByTestId('add-reaction-button'));

    // Check if the sendReaction function was called with the correct parameters
    expect(mockSendReaction).toHaveBeenCalledWith(expect.any(Object), {
      type: MessageReactionType.Distinct,
      name: '👍',
    });
  });

  it('removes a reaction when remove reaction button is clicked', () => {
    vi.clearAllMocks();

    render(<ChatWindow roomName="general" />);

    // Click the remove reaction button
    fireEvent.click(screen.getByTestId('remove-reaction-button'));

    // Check if the deleteReaction function was called with the correct parameters
    expect(mockDeleteReaction).toHaveBeenCalledWith(expect.any(Object), {
      type: MessageReactionType.Distinct,
      name: '👍',
    });
  });

  it('applies custom className to container', () => {
    render(<ChatWindow roomName="general" className="custom-class" />);

    const container = screen.getByRole('main');
    expect(container).toHaveClass('custom-class');
  });

  it('has correct accessibility attributes', () => {
    render(<ChatWindow roomName="general" />);

    const container = screen.getByRole('main');
    expect(container).toHaveAttribute('aria-label', 'Chat room: general');
  });

  it('disables message operations when settings disallow them', () => {
    vi.clearAllMocks();

    // Override the getEffectiveSettings mock to return settings that disallow operations
    mockGetEffectiveSettings.mockReturnValueOnce({
      allowMessageEdits: false,
      allowMessageDeletes: false,
      allowMessageReactions: false,
    });

    render(<ChatWindow roomName="general" />);

    // These buttons should not be rendered because the settings disallow them
    expect(screen.queryByTestId('edit-message-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('delete-message-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('add-reaction-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('remove-reaction-button')).not.toBeInTheDocument();
  });
});
