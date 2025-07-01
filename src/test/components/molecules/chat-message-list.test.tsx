import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach,describe, expect, it, vi } from 'vitest';

import { createMockMessage } from '../../../../.storybook/mocks/mock-ably-chat.ts';
import { ChatMessageProps } from '../../../components/molecules/chat-message.tsx';
import { ChatMessageList } from '../../../components/molecules/chat-message-list.tsx';
import { TypingIndicatorsProps } from '../../../components/molecules/typing-indicators.tsx';

// Mock the ChatMessage component
vi.mock('../../../components/molecules/chat-message', () => ({
  ChatMessage: ({ message, onEdit, onDelete, onReactionAdd, onReactionRemove }: ChatMessageProps) => (
    <div data-testid={`chat-message-${message.serial}`} data-message-id={message.serial}>
      <div data-testid="message-text">{message.text}</div>
      <div data-testid="message-client-id">{message.clientId}</div>
      {onEdit && (
        <button 
          data-testid={`edit-button-${message.serial}`} 
          onClick={() => { onEdit(message, 'Edited message'); }}
        >
          Edit
        </button>
      )}
      {onDelete && (
        <button 
          data-testid={`delete-button-${message.serial}`} 
          onClick={() => { onDelete(message); }}
        >
          Delete
        </button>
      )}
      {onReactionAdd && (
        <button 
          data-testid={`add-reaction-button-${message.serial}`} 
          onClick={() => { onReactionAdd(message, '👍'); }}
        >
          Add Reaction
        </button>
      )}
      {onReactionRemove && (
        <button 
          data-testid={`remove-reaction-button-${message.serial}`} 
          onClick={() => { onReactionRemove(message, '👍'); }}
        >
          Remove Reaction
        </button>
      )}
    </div>
  )
}));

// Mock the TypingIndicators component
vi.mock('../../../components/molecules/typing-indicators', () => ({
  TypingIndicators: ({ onTypingChange, className }: TypingIndicatorsProps) => (
    <div data-testid="typing-indicators" className={className}>
      Someone is typing...
      <button
        data-testid="trigger-typing-change"
        onClick={() => onTypingChange?.(['user1', 'user2'])}
      >
        Trigger Typing Change
      </button>
    </div>
  )
}));

describe('ChatMessageList', () => {
  // Create some mock messages for testing
  const mockMessages = [
    createMockMessage({ serial: 'msg1', clientId: 'user1', text: 'Hello world' }),
    createMockMessage({ serial: 'msg2', clientId: 'user2', text: 'How are you?' }),
    createMockMessage({ serial: 'msg3', clientId: 'user1', text: 'I am fine, thanks!' })
  ];

  // Mock callback functions
  const mockOnLoadMoreHistory = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnReactionAdd = vi.fn();
  const mockOnReactionRemove = vi.fn();
  const mockOnMessageInView = vi.fn();
  const mockOnViewLatest = vi.fn();

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock IntersectionObserver
    const mockIntersectionObserver = vi.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null
    });
    globalThis.IntersectionObserver = mockIntersectionObserver;

    // Mock ResizeObserver
    const mockResizeObserver = vi.fn();
    mockResizeObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null
    });
    globalThis.ResizeObserver = mockResizeObserver;
  });

  it('renders messages correctly', () => {
    render(
      <ChatMessageList
        messages={mockMessages}
        currentClientId="user1"
      />
    );

    // Check if all messages are rendered
    expect(screen.getByTestId('chat-message-msg1')).toBeInTheDocument();
    expect(screen.getByTestId('chat-message-msg2')).toBeInTheDocument();
    expect(screen.getByTestId('chat-message-msg3')).toBeInTheDocument();
  });

  it('shows loading indicator when isLoading is true', () => {
    render(
      <ChatMessageList
        messages={mockMessages}
        currentClientId="user1"
        isLoading={true}
      />
    );

    expect(screen.getByText('Loading messages…')).toBeInTheDocument();
  });

  it('shows "No more messages" when hasMoreHistory is false and there are messages', () => {
    render(
      <ChatMessageList
        messages={mockMessages}
        currentClientId="user1"
        hasMoreHistory={false}
      />
    );

    expect(screen.getByText('No more messages')).toBeInTheDocument();
  });

  it('renders typing indicators when enableTypingIndicators is true', () => {
    render(
      <ChatMessageList
        messages={mockMessages}
        currentClientId="user1"
        enableTypingIndicators={true}
      />
    );

    expect(screen.getByTestId('typing-indicators')).toBeInTheDocument();
  });

  it('does not render typing indicators when enableTypingIndicators is false', () => {
    render(
      <ChatMessageList
        messages={mockMessages}
        currentClientId="user1"
        enableTypingIndicators={false}
      />
    );

    expect(screen.queryByTestId('typing-indicators')).not.toBeInTheDocument();
  });

  it('passes correct props to ChatMessage components', () => {
    render(
      <ChatMessageList
        messages={mockMessages}
        currentClientId="user1"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onReactionAdd={mockOnReactionAdd}
        onReactionRemove={mockOnReactionRemove}
      />
    );

    // Check if edit button exists and works
    const editButton = screen.getByTestId('edit-button-msg1');
    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalledWith(mockMessages[0], 'Edited message');

    // Check if delete button exists and works
    const deleteButton = screen.getByTestId('delete-button-msg1');
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith(mockMessages[0]);

    // Check if add reaction button exists and works
    const addReactionButton = screen.getByTestId('add-reaction-button-msg1');
    fireEvent.click(addReactionButton);
    expect(mockOnReactionAdd).toHaveBeenCalledWith(mockMessages[0], '👍');

    // Check if remove reaction button exists and works
    const removeReactionButton = screen.getByTestId('remove-reaction-button-msg1');
    fireEvent.click(removeReactionButton);
    expect(mockOnReactionRemove).toHaveBeenCalledWith(mockMessages[0], '👍');
  });

  it('calls onLoadMoreHistory when scrolled to top', () => {
    render(
      <ChatMessageList
        messages={mockMessages}
        currentClientId="user1"
        onLoadMoreHistory={mockOnLoadMoreHistory}
        hasMoreHistory={true}
      />
    );

    // Get the container and mock the scrollTop getter
    const container = screen.getByRole('log');

    const maybeLoadHistorySpy = vi.spyOn(
      Object.getPrototypeOf(container), 
      'scrollTop', 
      'get'
    ).mockImplementation(() => 10); // Very low value to trigger loading

    fireEvent.scroll(container);

    maybeLoadHistorySpy.mockRestore();

    expect(mockOnLoadMoreHistory).toHaveBeenCalled();
  });

  it('calls onMessageInView when a message comes into view', () => {
    render(
      <ChatMessageList
        messages={mockMessages}
        currentClientId="user1"
        onMessageInView={mockOnMessageInView}
      />
    );

    const container = screen.getByRole('log');
    const messageElement = screen.getByTestId('chat-message-msg1');

    // Mock container dimensions - positioned so viewport center is at y=200
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      height: 400,
      bottom: 400,
      left: 0,
      right: 800,
      width: 800,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    // Mock message element positioned near viewport center (y=200)
    vi.spyOn(messageElement, 'getBoundingClientRect').mockReturnValue({
      top: 180,
      bottom: 220,
      height: 40,
      left: 0,
      right: 800,
      width: 800,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    // Mock that user is NOT at bottom (so onViewLatest won't be called instead)
    Object.defineProperty(container, 'scrollTop', { value: 100, writable: true });
    Object.defineProperty(container, 'scrollHeight', { value: 1000 });
    Object.defineProperty(container, 'clientHeight', { value: 400 });

    // Trigger scroll to invoke reportMessageInView
    fireEvent.scroll(container);

    expect(mockOnMessageInView).toHaveBeenCalledWith('msg1');
  });

  it('calls onViewLatest when user scrolls to bottom', () => {
    render(
      <ChatMessageList
        messages={mockMessages}
        currentClientId="user1"
        onViewLatest={mockOnViewLatest}
      />
    );

    const container = screen.getByRole('log');

    // Mock being at the bottom
    Object.defineProperty(container, 'scrollTop', { value: 900, writable: true });
    Object.defineProperty(container, 'scrollHeight', { value: 1000 });
    Object.defineProperty(container, 'clientHeight', { value: 100 });

    // Mock getBoundingClientRect for isUserAtBottom check
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      height: 100,
      bottom: 100,
      left: 0,
      right: 800,
      width: 800,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    fireEvent.scroll(container);

    expect(mockOnViewLatest).toHaveBeenCalled();
  });

  it('calls onTypingChange when typing indicators change', () => {
    render(
      <ChatMessageList
        messages={mockMessages}
        currentClientId="user1"
        enableTypingIndicators={true}
        autoScroll={true}
      />
    );

    // Find and click the button that triggers typing change
    const triggerButton = screen.getByTestId('trigger-typing-change');

    // We need to mock requestAnimationFrame for this test
    const originalRAF = globalThis.requestAnimationFrame;
    globalThis.requestAnimationFrame = (callback) => {
      callback(0);
      return 0;
    };

    // Get container and spy on scrollTop setter before defining properties
    const container = screen.getByRole('log');
    const scrollTopSetter = vi.fn();

    // Define all scroll properties at once, including the spy
    Object.defineProperty(container, 'scrollTop', {
      get: () => 1000,
      set: scrollTopSetter,
      configurable: true
    });
    Object.defineProperty(container, 'scrollHeight', { value: 1100 });
    Object.defineProperty(container, 'clientHeight', { value: 100 });

    // Trigger the typing change
    fireEvent.click(triggerButton);

    // Verify that scrollToBottom was called by checking if scrollTop was set to scrollHeight
    expect(scrollTopSetter).toHaveBeenCalledWith(1100);

    // Restore original requestAnimationFrame
    globalThis.requestAnimationFrame = originalRAF;
  });

  it('applies custom className to container', () => {
    render(
      <ChatMessageList
        messages={mockMessages}
        currentClientId="user1"
        className="custom-class"
      />
    );

    const container = screen.getByRole('log');
    expect(container).toHaveClass('custom-class');
  });

  it('has correct accessibility attributes', () => {
    render(
      <ChatMessageList
        messages={mockMessages}
        currentClientId="user1"
      />
    );

    const container = screen.getByRole('log');
    expect(container).toHaveAttribute('aria-label', 'Chat messages');
    expect(container).toHaveAttribute('aria-live', 'polite');
  });
});
