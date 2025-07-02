import { useOccupancy } from '@ably/chat/react';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AvatarProps } from '../../../components/atoms/avatar.tsx';
import { ButtonProps } from '../../../components/atoms/button.tsx';
import { IconProps } from '../../../components/atoms/icon.tsx';
import { RoomListItem } from '../../../components/molecules/room-list-item.tsx';
import { TypingIndicatorsProps } from '../../../components/molecules/typing-indicators.tsx';

// Mock the useOccupancy hook
vi.mock('@ably/chat/react', () => ({
  useOccupancy: vi.fn().mockReturnValue({
    connections: 0,
    presenceMembers: 0,
  }),
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

// Mock the Button component
vi.mock('../../../components/atoms/button.tsx', () => ({
  Button: ({
    children,
    onClick,
    variant,
    size,
    className,
    'aria-label': ariaLabel,
  }: ButtonProps) => (
    <button
      data-testid="button"
      data-variant={variant}
      data-size={size}
      className={className}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

// Mock the Icon component
vi.mock('../../../components/atoms/icon.tsx', () => ({
  Icon: ({ name, size }: IconProps) => (
    <div data-testid="icon" data-name={name} data-size={size}>
      Icon
    </div>
  ),
}));

// Mock the TypingIndicators component
vi.mock('../../../components/molecules/typing-indicators.tsx', () => ({
  TypingIndicators: ({ maxClients }: TypingIndicatorsProps) => (
    <div data-testid="typing-indicators" data-max-clients={maxClients}>
      Typing Indicators
    </div>
  ),
}));

describe('RoomListItem', () => {
  const mockOnClick = vi.fn();
  const mockOnLeave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default props', () => {
    render(
      <RoomListItem
        roomName="test-room"
        isSelected={false}
        onClick={mockOnClick}
        onLeave={mockOnLeave}
      />
    );

    // Check if the component renders the avatar
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.getByTestId('avatar')).toHaveAttribute('data-alt', 'Test Room');
    expect(screen.getByTestId('avatar')).toHaveAttribute('data-size', 'md');

    // Check if room name is displayed
    expect(screen.getByText('Test Room')).toBeInTheDocument();

    // Check if typing indicators are rendered
    expect(screen.getByTestId('typing-indicators')).toBeInTheDocument();
    expect(screen.getByTestId('typing-indicators')).toHaveAttribute('data-max-clients', '1');

    // Check if leave button is rendered
    expect(screen.getByTestId('button')).toBeInTheDocument();
    expect(screen.getByTestId('button')).toHaveAttribute('data-variant', 'ghost');
    expect(screen.getByTestId('button')).toHaveAttribute('data-size', 'sm');
    expect(screen.getByTestId('button')).toHaveAttribute('aria-label', 'Leave Test Room');

    // Check if icon is rendered
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toHaveAttribute('data-name', 'close');
  });

  it('renders in selected state', () => {
    render(
      <RoomListItem
        roomName="test-room"
        isSelected={true}
        onClick={mockOnClick}
        onLeave={mockOnLeave}
      />
    );

    // Check if the component has the selected class
    const roomItem = screen.getByRole('button', { name: /test room room/i });
    expect(roomItem).toHaveClass('bg-gray-100');
    expect(roomItem).toHaveClass('border-r-2');
    expect(roomItem).toHaveClass('border-blue-500');

    // Check if aria-pressed is true
    expect(roomItem).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders in collapsed mode', () => {
    render(
      <RoomListItem
        roomName="test-room"
        isSelected={false}
        onClick={mockOnClick}
        onLeave={mockOnLeave}
        isCollapsed={true}
      />
    );

    // In collapsed mode, only the avatar should be visible
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.queryByText('Test Room')).not.toBeInTheDocument();
    expect(screen.queryByTestId('typing-indicators')).not.toBeInTheDocument();
    expect(screen.queryByTestId('button')).not.toBeInTheDocument();

    // Check if the component has the correct structure for collapsed mode
    const roomItem = screen.getByRole('button', { name: /test room room/i });
    expect(roomItem).toHaveClass('relative');
    expect(roomItem).toHaveClass('cursor-pointer');
    expect(roomItem).toHaveClass('transition-transform');
    expect(roomItem).toHaveClass('hover:scale-110');
  });

  it('renders with active presence indicators when room is active', () => {
    // Mock presence members to simulate active room
    (useOccupancy as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      connections: 3,
      presenceMembers: 2,
    });

    render(
      <RoomListItem
        roomName="test-room"
        isSelected={false}
        onClick={mockOnClick}
        onLeave={mockOnLeave}
      />
    );

    // Check if presence indicator is rendered
    const presenceIndicator = document.querySelector('.bg-green-500.rounded-full');
    expect(presenceIndicator).toBeInTheDocument();

    // Check if presence count badge is rendered
    const presenceCountBadge = screen.getByTitle('2 people online');
    expect(presenceCountBadge).toBeInTheDocument();
    expect(presenceCountBadge).toHaveTextContent('2');

    // Check if connections count is displayed
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByTitle('3 total connections')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    render(
      <RoomListItem
        roomName="test-room"
        isSelected={false}
        onClick={mockOnClick}
        onLeave={mockOnLeave}
      />
    );

    // Click on the room item
    fireEvent.click(screen.getByRole('button', { name: /test room room/i }));

    // Check if onClick was called
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('calls onLeave when leave button is clicked', () => {
    render(
      <RoomListItem
        roomName="test-room"
        isSelected={false}
        onClick={mockOnClick}
        onLeave={mockOnLeave}
      />
    );

    // Click on the leave button
    fireEvent.click(screen.getByTestId('button'));

    // Check if onLeave was called
    expect(mockOnLeave).toHaveBeenCalledTimes(1);
    // Check if event propagation was stopped (onClick should not be called)
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('uses custom avatar when provided', () => {
    const customAvatar = {
      displayName: 'Custom Room',
      initials: 'CR',
      color: 'bg-red-500',
      src: 'https://example.com/avatar.jpg',
    };

    render(
      <RoomListItem
        roomName="test-room"
        isSelected={false}
        onClick={mockOnClick}
        onLeave={mockOnLeave}
        avatar={customAvatar}
      />
    );

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

  it('disables typing indicators when typingIndicatorsEnabled is false', () => {
    render(
      <RoomListItem
        roomName="test-room"
        isSelected={false}
        onClick={mockOnClick}
        onLeave={mockOnLeave}
        typingIndicatorsEnabled={false}
      />
    );

    // Check if typing indicators are not rendered
    expect(screen.queryByTestId('typing-indicators')).not.toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(
      <RoomListItem
        roomName="test-room"
        isSelected={false}
        onClick={mockOnClick}
        onLeave={mockOnLeave}
      />
    );

    const roomItem = screen.getByRole('button', { name: /test room room/i });
    expect(roomItem).toHaveAttribute('aria-pressed', 'false');
    expect(roomItem).toHaveAttribute('tabIndex', '0');

    // Test keyboard interaction
    fireEvent.keyDown(roomItem, { key: 'Enter' });
    expect(mockOnClick).toHaveBeenCalledTimes(1);

    // Reset and test space key
    mockOnClick.mockReset();
    fireEvent.keyDown(roomItem, { key: ' ' });
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
