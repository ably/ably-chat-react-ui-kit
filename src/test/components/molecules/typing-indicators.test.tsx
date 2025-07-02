import { useTyping } from '@ably/chat/react';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TypingDotsProps } from '../../../components/atoms/typing-dots.tsx';
import { TypingIndicators } from '../../../components/molecules/typing-indicators.tsx';

vi.mock('@ably/chat/react', () => ({
  useTyping: vi.fn().mockReturnValue({ currentlyTyping: [] }),
  useChatClient: vi.fn().mockReturnValue({ clientId: 'current-user' }),
}));

vi.mock('../../../components/atoms/typing-dots.tsx', () => ({
  TypingDots: ({ 'aria-hidden': ariaHidden }: TypingDotsProps) => (
    <div data-testid="typing-dots" aria-hidden={ariaHidden}>
      ...
    </div>
  ),
}));

describe('TypingIndicators', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when no one is typing', () => {
    (useTyping as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      currentlyTyping: [],
    });

    const { container } = render(<TypingIndicators />);

    // Component should not render anything
    expect(container.firstChild).toBeNull();
  });

  it('renders with single user typing', () => {
    (useTyping as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      currentlyTyping: ['user1', 'current-user'],
    });

    render(<TypingIndicators />);

    // Should show typing dots
    expect(screen.getByTestId('typing-dots')).toBeInTheDocument();

    // Should show typing text for one user (excluding current user)
    expect(screen.getByText('user1 is typing')).toBeInTheDocument();
  });

  it('renders with multiple users typing', () => {
    (useTyping as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      currentlyTyping: ['user1', 'user2', 'user3', 'current-user'],
    });

    render(<TypingIndicators />);

    // With default maxClients=1, should show first user and count of others
    expect(screen.getByText('user1 and 2 others are typing')).toBeInTheDocument();
  });

  it('respects maxClients prop', () => {
    (useTyping as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      currentlyTyping: ['user1', 'user2', 'user3', 'current-user'],
    });

    render(<TypingIndicators maxClients={2} />);

    // With maxClients=2, should show first two users and count of others
    expect(screen.getByText('user1, user2 and 1 other are typing')).toBeInTheDocument();
  });

  it('shows all users when count is within maxClients', () => {
    (useTyping as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      currentlyTyping: ['user1', 'user2', 'current-user'],
    });

    render(<TypingIndicators maxClients={3} />);

    // With maxClients=3 and 2 users typing (excluding current user), should show both users
    expect(screen.getByText('user1 and user2 are typing')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    (useTyping as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      currentlyTyping: ['user1', 'current-user'],
    });

    render(<TypingIndicators className="custom-class" />);

    // Check if the container has the custom class
    const container = screen.getByRole('status');
    expect(container).toHaveClass('custom-class');
  });

  it('applies custom textClassName when provided', () => {
    (useTyping as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      currentlyTyping: ['user1', 'current-user'],
    });

    render(<TypingIndicators textClassName="custom-text-class" />);

    // Check if the text element has the custom class
    const textElement = screen.getByText('user1 is typing');
    expect(textElement).toHaveClass('custom-text-class');
  });

  it('has correct accessibility attributes', () => {
    (useTyping as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      currentlyTyping: ['user1', 'current-user'],
    });

    render(<TypingIndicators />);

    // Check if the container has the correct accessibility attributes
    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-live', 'polite');

    // Check if typing dots have aria-hidden
    const typingDots = screen.getByTestId('typing-dots');
    expect(typingDots).toHaveAttribute('aria-hidden', 'true');
  });

  it('calls onTypingChange when typing state changes', () => {
    const mockOnTypingChange = vi.fn();

    (useTyping as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      currentlyTyping: ['user1', 'user2', 'current-user'],
    });

    render(<TypingIndicators onTypingChange={mockOnTypingChange} />);

    // Check if onTypingChange was called with the correct users (excluding current user)
    expect(mockOnTypingChange).toHaveBeenCalledWith(['user1', 'user2']);
  });

  it('handles different sentence formats correctly', () => {
    (useTyping as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      currentlyTyping: ['Alice', 'Bob', 'current-user'],
    });

    const { rerender } = render(<TypingIndicators maxClients={3} />);
    expect(screen.getByText('Alice and Bob are typing')).toBeInTheDocument();

    // Test with three users
    (useTyping as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      currentlyTyping: ['Alice', 'Bob', 'Charlie', 'current-user'],
    });

    rerender(<TypingIndicators maxClients={3} />);
    expect(screen.getByText('Alice, Bob and Charlie are typing')).toBeInTheDocument();

    // Test with more than three users
    (useTyping as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      currentlyTyping: ['Alice', 'Bob', 'Charlie', 'Dave', 'current-user'],
    });

    rerender(<TypingIndicators maxClients={3} />);
    expect(screen.getByText('Alice, Bob, Charlie and 1 other are typing')).toBeInTheDocument();
  });
});
