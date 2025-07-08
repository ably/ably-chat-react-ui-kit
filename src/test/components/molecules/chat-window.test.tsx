import { MessageReactionType } from '@ably/chat';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ErrorInfo } from 'ably';
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

const mockUpdateMessages = vi.fn();
// Mocks the useMessageWindow hook
vi.mock('../../../hooks/use-message-window', () => ({
  useMessageWindow: () => ({
    activeMessages: [
      createMockMessage({ serial: 'msg1', clientId: 'user1', text: 'Hello world' }),
      createMockMessage({ serial: 'msg2', clientId: 'user2', text: 'How are you?' }),
      createMockMessage({ serial: 'msg3', clientId: 'user1', text: 'I am fine, thanks!' }),
    ],
    updateMessages: mockUpdateMessages,
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
  MessageInput: ({ onSent, placeholder, onSendError }: MessageInputProps) => (
    <div data-testid="message-input">
      <input data-testid="message-input-field" placeholder={placeholder} />
      <button
        data-testid="send-message-button"
        onClick={() => {
          // Create a mock message that would be returned from the send function
          const mockMessage = createMockMessage({
            text: 'New message',
            clientId: 'test-user',
            serial: 'test-serial-123',
          });

          // Call onSent with the mock message (handle optional prop)
          onSent?.(mockMessage);
        }}
      >
        Send
      </button>
      {onSendError && (
        <button
          data-testid="trigger-send-error-button"
          onClick={() => {
            onSendError(new ErrorInfo('Failed to send message', 50000, 500), 'Failed message text');
          }}
        >
          Trigger Send Error
        </button>
      )}
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

  it('updates the message state when the send button is clicked', () => {
    vi.clearAllMocks();

    render(<ChatWindow roomName="general" />);

    // Click the send button
    fireEvent.click(screen.getByTestId('send-message-button'));

    expect(mockUpdateMessages).toHaveBeenCalledWith([
      expect.objectContaining({
        text: 'New message',
        clientId: 'test-user',
        serial: 'test-serial-123',
      }),
    ]);
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

  describe('Error Handling', () => {
    it('calls onEditError when message editing fails', async () => {
      mockUpdate.mockRejectedValueOnce(new ErrorInfo('Edit failed', 50000, 500));

      let errorInfo: ErrorInfo | undefined;

      render(
        <ChatWindow
          roomName="general"
          errorHandling={{
            onEditError: () => {
              errorInfo = new ErrorInfo('Edit failed', 50000, 500);
            },
          }}
        />
      );

      fireEvent.click(screen.getByTestId('edit-message-button'));

      await waitFor(() => {
        expect(errorInfo).toBeDefined();
        expect(errorInfo).toBeErrorInfo({
          code: 50000,
          message: 'Edit failed',
        });
      });
    });

    it('calls onDeleteError when message deletion fails', async () => {
      mockDeleteMessage.mockRejectedValueOnce(new Error('Delete failed'));

      let errorInfo: ErrorInfo | undefined;

      render(
        <ChatWindow
          roomName="general"
          errorHandling={{
            onDeleteError: () => {
              errorInfo = new ErrorInfo('Delete failed', 50000, 500);
            },
          }}
        />
      );

      fireEvent.click(screen.getByTestId('delete-message-button'));

      await waitFor(() => {
        expect(errorInfo).toBeDefined();
        expect(errorInfo).toBeErrorInfo({
          code: 50000,
          message: 'Delete failed',
        });
      });
    });

    it('calls onAddReactionError when adding reaction fails', async () => {
      mockSendReaction.mockRejectedValueOnce(new Error('Add reaction failed'));

      let errorInfo: ErrorInfo | undefined;

      render(
        <ChatWindow
          roomName="general"
          errorHandling={{
            onAddReactionError: () => {
              errorInfo = new ErrorInfo('Add reaction failed', 50000, 500);
            },
          }}
        />
      );

      fireEvent.click(screen.getByTestId('add-reaction-button'));

      await waitFor(() => {
        expect(errorInfo).toBeDefined();
        expect(errorInfo).toBeErrorInfo({
          code: 50000,
          message: 'Add reaction failed',
        });
      });
    });

    it('calls onRemoveReactionError when removing reaction fails', async () => {
      mockDeleteReaction.mockRejectedValueOnce(new Error('Remove reaction failed'));

      let errorInfo: ErrorInfo | undefined;

      render(
        <ChatWindow
          roomName="general"
          errorHandling={{
            onRemoveReactionError: () => {
              errorInfo = new ErrorInfo('Remove reaction failed', 50000, 500);
            },
          }}
        />
      );

      fireEvent.click(screen.getByTestId('remove-reaction-button'));

      await waitFor(() => {
        expect(errorInfo).toBeDefined();
        expect(errorInfo).toBeErrorInfo({
          code: 50000,
          message: 'Remove reaction failed',
        });
      });
    });

    it('falls back to console.error when no error handlers are provided', async () => {
      vi.clearAllMocks();
      const consoleSpy = vi.spyOn(console, 'error');
      mockUpdate.mockRejectedValueOnce(new Error('Edit failed'));

      render(<ChatWindow roomName="general" />);

      fireEvent.click(screen.getByTestId('edit-message-button'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to update message:',
          new Error('Edit failed')
        );
      });
    });

    it('passes onSendError to MessageInput component', async () => {
      let errorInfo: ErrorInfo | undefined;

      render(
        <ChatWindow
          roomName="general"
          errorHandling={{
            onSendError: () => {
              errorInfo = new ErrorInfo('Failed to send message', 50000, 500);
            },
          }}
        />
      );

      expect(screen.getByTestId('trigger-send-error-button')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('trigger-send-error-button'));

      await waitFor(() => {
        expect(errorInfo).toBeDefined();
        expect(errorInfo).toBeErrorInfo({
          code: 50000,
          message: 'Failed to send message',
        });
      });
    });
  });
});
