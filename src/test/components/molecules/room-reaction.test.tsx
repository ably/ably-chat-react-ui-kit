import {
  ConnectionStatus,
  RoomReactionEvent,
  RoomReactionListener,
  RoomStatus,
} from '@ably/chat';
import { useRoomReactions } from '@ably/chat/react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EmojiBurstProps } from '../../../components/molecules/emoji-burst.tsx';
import { EmojiWheelProps } from '../../../components/molecules/emoji-wheel.tsx';
import { RoomReaction } from '../../../components/molecules/room-reaction.tsx';

vi.mock('@ably/chat/react', () => ({
  useRoomReactions: vi.fn().mockReturnValue({
    roomStatus: RoomStatus.Attached,
    connectionStatus: ConnectionStatus.Connected,
    send: vi.fn().mockResolvedValue({}),
  }),
}));

vi.mock('../../../hooks/use-throttle.tsx', () => ({
  useThrottle: <T extends (...args: unknown[]) => unknown>(fn: T): T => fn,
}));

// Mock the EmojiWheel component
vi.mock('../../../components/molecules/emoji-wheel.tsx', () => ({
  EmojiWheel: ({ isOpen, position, onEmojiSelect, onClose }: EmojiWheelProps) =>
    isOpen ? (
      <div data-testid="emoji-wheel" data-position={JSON.stringify(position)}>
        <button
          data-testid="select-emoji-👍"
          onClick={() => {
            onEmojiSelect('👍');
          }}
        >
          👍
        </button>
        <button
          data-testid="select-emoji-❤️"
          onClick={() => {
            onEmojiSelect('❤️');
          }}
        >
          ❤️
        </button>
        <button data-testid="close-emoji-wheel" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null,
}));

// Mock the EmojiBurst component
vi.mock('../../../components/molecules/emoji-burst.tsx', () => ({
  EmojiBurst: ({ isActive, position, emoji, duration, onComplete }: EmojiBurstProps) =>
    isActive ? (
      <div
        data-testid="emoji-burst"
        data-position={JSON.stringify(position)}
        data-emoji={emoji}
        data-duration={duration}
        onAnimationEnd={onComplete}
      >
        Emoji Burst: {emoji}
      </div>
    ) : null,
}));

Object.defineProperty(navigator, 'vibrate', {
  value: vi.fn(),
  writable: true,
});

describe('RoomReaction', () => {
  const mockSend = vi.fn().mockResolvedValue({});

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Mock getBoundingClientRect for the reaction button
    Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
      top: 100,
      left: 100,
      right: 140,
      bottom: 140,
      width: 40,
      height: 40,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders with default emoji', () => {
    render(<RoomReaction />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('👍');
    expect(button).toHaveAttribute('aria-label', 'Send 👍 reaction (long press for more options)');
  });

  it('sends reaction on click', () => {
    (useRoomReactions as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      roomStatus: RoomStatus.Attached,
      connectionStatus: ConnectionStatus.Connected,
      send: mockSend,
    });

    render(<RoomReaction />);

    // Click the reaction button
    fireEvent.click(screen.getByRole('button'));

    expect(mockSend).toHaveBeenCalledWith({ name: '👍' });

    // Check if emoji burst is shown
    expect(screen.getByTestId('emoji-burst')).toBeInTheDocument();
    expect(screen.getByTestId('emoji-burst')).toHaveAttribute('data-emoji', '👍');
  });

  it('shows emoji wheel on long press', () => {
    render(<RoomReaction />);

    // Start long press
    fireEvent.mouseDown(screen.getByRole('button'));

    // Emoji wheel should not be visible yet
    expect(screen.queryByTestId('emoji-wheel')).not.toBeInTheDocument();

    // Advance timer to trigger long press
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Emoji wheel should now be visible
    expect(screen.getByTestId('emoji-wheel')).toBeInTheDocument();
  });

  it('cancels long press when mouse up occurs before timeout', () => {
    render(<RoomReaction />);

    // Start long press
    fireEvent.mouseDown(screen.getByRole('button'));

    // Release before timeout
    fireEvent.mouseUp(screen.getByRole('button'));

    // Advance timer past the long press threshold
    act(() => {
      vi.advanceTimersByTime(600);
    });

    // Emoji wheel should not be visible
    expect(screen.queryByTestId('emoji-wheel')).not.toBeInTheDocument();
  });

  it('selects emoji from wheel and updates default', () => {
    (useRoomReactions as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      roomStatus: RoomStatus.Attached,
      connectionStatus: ConnectionStatus.Connected,
      send: mockSend,
    });

    render(<RoomReaction />);

    // Open emoji wheel with long press
    fireEvent.mouseDown(screen.getByRole('button'));
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Select a different emoji
    fireEvent.click(screen.getByTestId('select-emoji-❤️'));

    // Check if the emoji wheel is closed
    expect(screen.queryByTestId('emoji-wheel')).not.toBeInTheDocument();

    // Check if the selected emoji was sent
    expect(mockSend).toHaveBeenCalledWith({ name: '❤️' });

    // Check if emoji burst is shown with the selected emoji
    expect(screen.getByTestId('emoji-burst')).toBeInTheDocument();
    expect(screen.getByTestId('emoji-burst')).toHaveAttribute('data-emoji', '❤️');

    // Check if the default emoji was updated
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('❤️');
    expect(button).toHaveAttribute('aria-label', 'Send ❤️ reaction (long press for more options)');
  });

  it('closes emoji wheel without selecting when close button is clicked', () => {
    render(<RoomReaction />);

    // Open emoji wheel with long press
    fireEvent.mouseDown(screen.getByRole('button'));
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Click the close button
    fireEvent.click(screen.getByTestId('close-emoji-wheel'));

    // Check if the emoji wheel is closed
    expect(screen.queryByTestId('emoji-wheel')).not.toBeInTheDocument();

    // Default emoji should remain unchanged
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('👍');
  });

  it('hides emoji burst after animation completes', () => {
    render(<RoomReaction />);

    // Click the reaction button to show burst
    fireEvent.click(screen.getByRole('button'));

    // Burst should be visible
    expect(screen.getByTestId('emoji-burst')).toBeInTheDocument();

    // Trigger animation end
    fireEvent.animationEnd(screen.getByTestId('emoji-burst'));

    // Burst should be hidden
    expect(screen.queryByTestId('emoji-burst')).not.toBeInTheDocument();
  });

  it('uses custom burst duration when provided', () => {
    render(<RoomReaction emojiBurstDuration={1000} />);

    // Click the reaction button
    fireEvent.click(screen.getByRole('button'));

    // Check if the burst has the custom duration
    expect(screen.getByTestId('emoji-burst')).toHaveAttribute('data-duration', '1000');
  });

  it('uses custom burst position when provided', () => {
    const customPosition = { x: 200, y: 300 };

    // Store the listener function for later use
    let storedListener: RoomReactionListener | null = null;

    // Mock useRoomReactions to capture the listener
    (useRoomReactions as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (params?: { listener?: RoomReactionListener }) => {
        if (params?.listener) {
          storedListener = params.listener;
        }
        return {
          roomStatus: RoomStatus.Attached,
          connectionStatus: ConnectionStatus.Connected,
          send: mockSend,
        };
      }
    );

    render(<RoomReaction emojiBurstPosition={customPosition} />);

    // Simulate an incoming reaction (not from self)
    act(() => {
      if (storedListener) {
        storedListener({
          reaction: {
            name: '❤️',
            isSelf: false,
            metadata: {},
            headers: {},
            createdAt: new Date(),
            clientId: '',
          },
          type: 'reaction',
        } as RoomReactionEvent);
      }
    });

    // Check if the burst uses the custom position
    const burst = screen.getByTestId('emoji-burst');
    expect(burst).toHaveAttribute('data-position', JSON.stringify(customPosition));
    expect(burst).toHaveAttribute('data-emoji', '❤️');
  });

  it('applies custom className when provided', () => {
    render(<RoomReaction className="custom-class" />);

    // Check if the container has the custom class
    const container = screen.getByRole('button').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('handles touch events for mobile devices', () => {
    render(<RoomReaction />);

    // Get the main reaction button first
    const reactionButton = screen.getByLabelText('Send 👍 reaction (long press for more options)');

    // Start touch
    fireEvent.touchStart(reactionButton);

    // Advance timer to trigger long press
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Emoji wheel should be visible
    expect(screen.getByTestId('emoji-wheel')).toBeInTheDocument();

    // End touch on the same button
    fireEvent.touchEnd(reactionButton);

    // Select an emoji
    fireEvent.click(screen.getByTestId('select-emoji-❤️'));

    // Emoji wheel should be closed
    expect(screen.queryByTestId('emoji-wheel')).not.toBeInTheDocument();
  });
});
