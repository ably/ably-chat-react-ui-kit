import { ChatClient, Room } from '@ably/chat';
import {
  usePresenceListener,
  type UsePresenceListenerResponse,
  type UseRoomResponse,
  type UseTypingResponse,
} from '@ably/chat/react';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { AvatarProps } from '../../../components/atoms/avatar.tsx';
import { ParticipantListProps } from '../../../components/molecules/participant-list.tsx';
import { PresenceCountProps } from '../../../components/molecules/presence-count.tsx';
import { PresenceIndicatorsProps } from '../../../components/molecules/presence-indicators.tsx';
import { PresenceListProps } from '../../../components/molecules/presence-list.tsx';
import { RoomInfo } from '../../../components/molecules/room-info.tsx';
import { TypingIndicatorsProps } from '../../../components/molecules/typing-indicators.tsx';

// Mock the hooks from @ably/chat/react
vi.mock('@ably/chat/react', () => ({
  useRoom: vi.fn().mockReturnValue({
    roomName: 'test-room',
    room: {
      name: 'test-room',
      roomId: 'test-room-id',
    } as Partial<Room>,
  } as Partial<UseRoomResponse>),
  usePresenceListener: vi
    .fn()
    .mockReturnValue({ presenceData: [] } as Partial<UsePresenceListenerResponse>),
  useTyping: vi
    .fn()
    .mockReturnValue({ currentlyTyping: new Set<string>() } as Partial<UseTypingResponse>),
  useChatClient: vi.fn().mockReturnValue({
    clientId: 'current-user',
    connection: { status: 'connected' },
  } as Partial<ChatClient>),
}));

// Mock the useRoomAvatar hook
vi.mock('../../../hooks/use-room-avatar.tsx', () => ({
  useRoomAvatar: vi.fn().mockReturnValue({
    roomAvatar: {
      displayName: 'Test Room',
      initials: 'TR',
      color: 'bg-blue-500',
    },
  }),
}));

// Mock the Avatar component
vi.mock('../../../components/atoms/avatar.tsx', () => ({
  Avatar: ({ alt, src, color, size, initials }: AvatarProps) => (
    <div
      data-testid="avatar"
      data-alt={alt}
      data-src={src}
      data-color={color}
      data-size={size}
      data-initials={initials}
    >
      Avatar Component
    </div>
  ),
}));

// Mock the PresenceCount component
vi.mock('../../../components/molecules/presence-count.tsx', () => ({
  PresenceCount: ({ presenceData }: PresenceCountProps) => (
    <div data-testid="presence-count" data-count={presenceData.length}>
      Presence Count
    </div>
  ),
}));

// Mock the PresenceList component
vi.mock('../../../components/molecules/presence-list.tsx', () => ({
  PresenceList: ({ tooltipPosition, coords }: PresenceListProps) => (
    <div
      data-testid="presence-list"
      data-position={tooltipPosition}
      data-coords={JSON.stringify(coords)}
    >
      Presence List
    </div>
  ),
}));

// Mock the ParticipantList component
vi.mock('../../../components/molecules/participant-list.tsx', () => ({
  ParticipantList: ({
    presenceData,
    currentClientId,
    currentlyTyping,
    onToggle,
    position,
  }: ParticipantListProps) => (
    <div
      data-testid="participant-list"
      data-presence-count={presenceData.length}
      data-client-id={currentClientId}
      data-position={JSON.stringify(position)}
      data-currently-typing={currentlyTyping}
    >
      <button data-testid="close-participant-list" onClick={onToggle}>
        Close
      </button>
      Participant List
    </div>
  ),
}));

// Mock the PresenceIndicators component
vi.mock('../../../components/molecules/presence-indicators.tsx', () => ({
  PresenceIndicators: ({ className }: PresenceIndicatorsProps) => (
    <div data-testid="presence-indicators" data-class-name={className}>
      Presence Indicators
    </div>
  ),
}));

// Mock the TypingIndicators component
vi.mock('../../../components/molecules/typing-indicators.tsx', () => ({
  TypingIndicators: ({ className }: TypingIndicatorsProps) => (
    <div data-testid="typing-indicators" data-class-name={className}>
      Typing Indicators
    </div>
  ),
}));

describe('RoomInfo', () => {
  it('renders with default props', () => {
    render(<RoomInfo />);

    // Check if the component renders the avatar
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.getByTestId('avatar')).toHaveAttribute('data-alt', 'Test Room');
    expect(screen.getByTestId('avatar')).toHaveAttribute('data-size', 'lg');

    // Check if presence count is rendered
    expect(screen.getByTestId('presence-count')).toBeInTheDocument();

    // Check if room name is displayed
    expect(screen.getByText('Test Room')).toBeInTheDocument();

    // Check if presence and typing indicators are rendered
    expect(screen.getByTestId('presence-indicators')).toBeInTheDocument();
    expect(screen.getByTestId('typing-indicators')).toBeInTheDocument();
    expect(screen.getByTestId('typing-indicators')).toHaveAttribute('data-class-name', 'text-xs');
  });

  it('shows tooltip on mouse enter and hides on mouse leave', () => {
    render(<RoomInfo />);

    // Initially, tooltip should not be visible
    expect(screen.queryByTestId('presence-list')).not.toBeInTheDocument();

    // Hover over the avatar
    const avatarContainer = screen.getByRole('button');
    fireEvent.mouseEnter(avatarContainer);

    // Tooltip should now be visible
    expect(screen.getByTestId('presence-list')).toBeInTheDocument();

    // Mouse leave should hide the tooltip
    fireEvent.mouseLeave(avatarContainer);
    expect(screen.queryByTestId('presence-list')).not.toBeInTheDocument();
  });

  it('toggles participant list on click', () => {
    render(<RoomInfo />);

    // Initially, participant list should not be visible
    expect(screen.queryByTestId('participant-list')).not.toBeInTheDocument();

    // Click the avatar to open participant list
    const avatarContainer = screen.getByRole('button');
    fireEvent.click(avatarContainer);

    // Participant list should now be visible
    expect(screen.getByTestId('participant-list')).toBeInTheDocument();

    // Click the close button to hide participant list
    fireEvent.click(screen.getByTestId('close-participant-list'));
    expect(screen.queryByTestId('participant-list')).not.toBeInTheDocument();
  });

  it('uses custom roomAvatar when provided', () => {
    const customAvatar = {
      displayName: 'Custom Room',
      initials: 'CR',
      color: 'bg-red-500',
      src: 'https://example.com/avatar.jpg',
    };

    render(<RoomInfo roomAvatar={customAvatar} />);

    // Check if the avatar uses custom props
    expect(screen.getByTestId('avatar')).toHaveAttribute('data-alt', 'Custom Room');
    expect(screen.getByTestId('avatar')).toHaveAttribute('data-initials', 'CR');
    expect(screen.getByTestId('avatar')).toHaveAttribute('data-color', 'bg-red-500');
    expect(screen.getByTestId('avatar')).toHaveAttribute(
      'data-src',
      'https://example.com/avatar.jpg'
    );

    // Check if room name displays custom name
    expect(screen.getByText('Custom Room')).toBeInTheDocument();
  });

  it('uses custom position when provided', () => {
    const customPosition = { top: 100, left: 200 };

    render(<RoomInfo position={customPosition} />);

    // Open participant list
    fireEvent.click(screen.getByRole('button'));

    // Check if participant list uses custom position
    const participantList = screen.getByTestId('participant-list');
    expect(participantList).toHaveAttribute('data-position', JSON.stringify(customPosition));
  });

  it('applies custom className when provided', () => {
    render(<RoomInfo className="custom-class" />);

    // Check if the root container has the custom class
    const container = screen.getByText('Test Room').closest('div')?.parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('has correct accessibility attributes', () => {
    (usePresenceListener as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      presenceData: [{ clientId: 'user1' }, { clientId: 'user2' }],
    });

    render(<RoomInfo />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-haspopup', 'dialog');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('aria-label', 'Test Room (2 participants)');

    // Open participant list
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });
});
