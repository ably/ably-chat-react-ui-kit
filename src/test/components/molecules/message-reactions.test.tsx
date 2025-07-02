import { Message } from '@ably/chat';
import { fireEvent,render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MessageReactions } from '../../../components/molecules/message-reactions.tsx';

// Create a mock message with reactions
const createMockMessage = (reactions: Record<string, { total: number; clientIds: string[] }>) => {
  return {
    reactions: {
      distinct: reactions,
      unique: {},
      multiple: {}
    }
  } as Message;
};

describe('MessageReactions', () => {
  it('renders nothing when there are no reactions', () => {
    const message = createMockMessage({});
    const { container } = render(
      <MessageReactions 
        message={message} 
        currentClientId="user1" 
      />
    );

    // The component should not render anything when there are no reactions
    expect(container.firstChild).toBeNull();
  });

  it('renders reactions correctly', () => {
    const message = createMockMessage({
      '👍': { total: 2, clientIds: ['user1', 'user2'] },
      '❤️': { total: 1, clientIds: ['user3'] }
    });

    render(
      <MessageReactions 
        message={message} 
        currentClientId="user1" 
      />
    );

    // Should render a group container
    const container = screen.getByRole('group');
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('aria-label', 'Message reactions');

    // Should render both reactions
    expect(screen.getByText('👍')).toBeInTheDocument();
    expect(screen.getByText('❤️')).toBeInTheDocument();

    // Should render the correct counts
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('highlights reactions from the current user', () => {
    const message = createMockMessage({
      '👍': { total: 2, clientIds: ['user1', 'user2'] }, // Current user has reacted
      '❤️': { total: 1, clientIds: ['user3'] }           // Current user has not reacted
    });

    render(
      <MessageReactions 
        message={message} 
        currentClientId="user1" 
      />
    );

    // Find the reaction buttons
    const thumbsUpButton = screen.getByText('👍').closest('button');
    const heartButton = screen.getByText('❤️').closest('button');

    // Check if the current user's reaction has the highlighted class
    expect(thumbsUpButton).toHaveClass('bg-blue-100');
    expect(thumbsUpButton).toHaveClass('border-blue-300');
    expect(thumbsUpButton).toHaveClass('text-blue-700');
    
    // Check if the other reaction has the normal class
    expect(heartButton).toHaveClass('bg-gray-100');
    expect(heartButton).toHaveClass('border-gray-300');
    expect(heartButton).toHaveClass('text-gray-700');
  });

  it('calls onReactionClick when a reaction is clicked', () => {
    const message = createMockMessage({
      '👍': { total: 2, clientIds: ['user1', 'user2'] },
      '❤️': { total: 1, clientIds: ['user3'] }
    });

    const handleReactionClick = vi.fn();

    render(
      <MessageReactions 
        message={message} 
        currentClientId="user1" 
        onReactionClick={handleReactionClick}
      />
    );

    // Find and click on the thumbs up reaction
    const thumbsUpButton = screen.getByText('👍').closest('button');
    fireEvent.click(thumbsUpButton as HTMLElement);

    // Check if the handler was called with the correct emoji
    expect(handleReactionClick).toHaveBeenCalledTimes(1);
    expect(handleReactionClick).toHaveBeenCalledWith('👍');

    // Find and click on the heart reaction
    const heartButton = screen.getByText('❤️').closest('button');
    fireEvent.click(heartButton as HTMLElement);

    // Check if the handler was called with the correct emoji
    expect(handleReactionClick).toHaveBeenCalledTimes(2);
    expect(handleReactionClick).toHaveBeenCalledWith('❤️');
  });

  it('does not call onReactionClick if not provided', () => {
    const message = createMockMessage({
      '👍': { total: 2, clientIds: ['user1', 'user2'] }
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <MessageReactions 
        message={message} 
        currentClientId="user1" 
      />
    );

    // Find and click on the thumbs up reaction
    const thumbsUpButton = screen.getByText('👍').closest('button');
    fireEvent.click(thumbsUpButton as HTMLElement);

    // No error should be thrown
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('has correct accessibility attributes', () => {
    const message = createMockMessage({
      '👍': { total: 2, clientIds: ['user1', 'user2'] },
      '❤️': { total: 1, clientIds: ['user3'] }
    });

    render(
      <MessageReactions 
        message={message} 
        currentClientId="user1" 
      />
    );

    // Check group role and label
    const container = screen.getByRole('group');
    expect(container).toHaveAttribute('aria-label', 'Message reactions');

    // Check thumbs up button (user has reacted)
    const thumbsUpButton = screen.getByText('👍').closest('button');
    expect(thumbsUpButton).toHaveAttribute('aria-label', '👍 reaction (you reacted), 2 people');
    expect(thumbsUpButton).toHaveAttribute('aria-pressed', 'true');
    expect(thumbsUpButton).toHaveAttribute('type', 'button');

    // Check heart button (user has not reacted)
    const heartButton = screen.getByText('❤️').closest('button');
    expect(heartButton).toHaveAttribute('aria-label', '❤️ reaction, 1 person');
    expect(heartButton).toHaveAttribute('aria-pressed', 'false');
    expect(heartButton).toHaveAttribute('type', 'button');
  });

  it('handles singular and plural in aria-label based on count', () => {
    const message = createMockMessage({
      '👍': { total: 1, clientIds: ['user2'] },
      '❤️': { total: 2, clientIds: ['user3', 'user4'] }
    });

    render(
      <MessageReactions 
        message={message} 
        currentClientId="user1" 
      />
    );

    // Check singular form
    const thumbsUpButton = screen.getByText('👍').closest('button');
    expect(thumbsUpButton).toHaveAttribute('aria-label', '👍 reaction, 1 person');

    // Check plural form
    const heartButton = screen.getByText('❤️').closest('button');
    expect(heartButton).toHaveAttribute('aria-label', '❤️ reaction, 2 people');
  });

  it('applies correct styling classes to the container', () => {
    const message = createMockMessage({
      '👍': { total: 2, clientIds: ['user1', 'user2'] }
    });

    render(
      <MessageReactions 
        message={message} 
        currentClientId="user1" 
      />
    );

    // Check if the container has the correct styling classes
    const container = screen.getByRole('group');
    expect(container).toHaveClass('flex');
    expect(container).toHaveClass('flex-wrap');
    expect(container).toHaveClass('gap-1');
    expect(container).toHaveClass('mt-2');
  });
});
