import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { AvatarProps } from '../../../components/atoms/avatar.tsx';
import { TypingDotsProps } from '../../../components/atoms/typing-dots.tsx';
import { Participant } from '../../../components/molecules/participant.tsx';

// Mock the useUserAvatar hook
vi.mock('../../../hooks/use-user-avatar.tsx', () => ({
  useUserAvatar: ({ clientId }: { clientId: string }) => ({
    userAvatar: {
      displayName: clientId,
      initials: clientId.slice(0, 2).toUpperCase(),
      color: 'bg-blue-500',
    },
  }),
}));

// Mock the Avatar component
vi.mock('../../../components/atoms/avatar.tsx', () => ({
  Avatar: ({ alt, src, color, size, initials }: AvatarProps) => (
    <div data-testid="avatar" data-alt={alt} data-src={src} data-color={color} data-size={size} data-initials={initials}>
      Avatar Component
    </div>
  ),
}));

// Mock the TypingDots component
vi.mock('../../../components/atoms/typing-dots.tsx', () => ({
  TypingDots: (props: TypingDotsProps) => (
    <div data-testid="typing-dots" {...props}>
      ...
    </div>
  ),
}));

describe('Participant', () => {
  it('renders with basic props', () => {
    render(
      <Participant
        clientId="user123"
        isPresent={true}
        isSelf={false}
        isTyping={false}
      />
    );

    // Check if the component renders the client ID
    expect(screen.getByText('user123')).toBeInTheDocument();
    
    // Check if the avatar is rendered with correct props
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('data-alt', 'user123');
    expect(avatar).toHaveAttribute('data-size', 'sm');
    
    // Check if the online status is displayed
    expect(screen.getByText('Online')).toBeInTheDocument();
    
    // Check if the presence indicator has the correct color for online status
    const presenceIndicator = document.querySelector('.bg-green-500');
    expect(presenceIndicator).toBeInTheDocument();
  });

  it('renders offline status correctly', () => {
    render(
      <Participant
        clientId="user123"
        isPresent={false}
        isSelf={false}
        isTyping={false}
      />
    );

    // Check if the offline status is displayed with the coorect color
    expect(screen.getByText('Offline')).toBeInTheDocument();
    const presenceIndicator = document.querySelector('.bg-gray-400');
    expect(presenceIndicator).toBeInTheDocument();
  });

  it('renders typing indicator when user is typing', () => {
    render(
      <Participant
        clientId="user123"
        isPresent={true}
        isSelf={false}
        isTyping={true}
      />
    );

    // Check if the typing indicator is displayed
    expect(screen.getByTestId('typing-dots')).toBeInTheDocument();
    expect(screen.getByText('typing...')).toBeInTheDocument();
    
    // Check that the online status is not displayed when typing
    expect(screen.queryByText('Online')).not.toBeInTheDocument();
  });

  it('does not show typing indicator for self', () => {
    render(
      <Participant
        clientId="user123"
        isPresent={true}
        isSelf={true}
        isTyping={true}
      />
    );

    // Check that typing indicator is not displayed for self
    expect(screen.queryByTestId('typing-dots')).not.toBeInTheDocument();
    expect(screen.queryByText('typing...')).not.toBeInTheDocument();
    
    // Check that online status is displayed instead
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('shows "(you)" label for self', () => {
    render(
      <Participant
        clientId="user123"
        isPresent={true}
        isSelf={true}
        isTyping={false}
      />
    );

    expect(screen.getByText('(you)')).toBeInTheDocument();
  });

  it('uses custom avatar when provided', () => {
    const customAvatar = {
      displayName: 'Custom Name',
      src: 'https://example.com/avatar.jpg',
      color: 'bg-red-500',
      initials: 'CN',
    };

    render(
      <Participant
        clientId="user123"
        isPresent={true}
        isSelf={false}
        isTyping={false}
        avatar={customAvatar}
      />
    );

    // Check if the avatar is rendered with custom props
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveAttribute('data-alt', 'Custom Name');
    expect(avatar).toHaveAttribute('data-src', 'https://example.com/avatar.jpg');
    expect(avatar).toHaveAttribute('data-color', 'bg-red-500');
    expect(avatar).toHaveAttribute('data-initials', 'CN');
  });

  it('has correct accessibility attributes', () => {
    render(
      <Participant
        clientId="user123"
        isPresent={true}
        isSelf={false}
        isTyping={false}
      />
    );

    const participant = screen.getByRole('listitem');
    expect(participant).toBeInTheDocument();
    
    // Check if the aria-label includes the client ID and status
    expect(participant).toHaveAttribute('aria-label', 'user123, online');
  });

  it('has correct accessibility attributes when typing', () => {
    render(
      <Participant
        clientId="user123"
        isPresent={true}
        isSelf={false}
        isTyping={true}
      />
    );

    // Check if the aria-label includes the typing status
    const participant = screen.getByRole('listitem');
    expect(participant).toHaveAttribute('aria-label', 'user123, typing');
  });

  it('has correct accessibility attributes for self', () => {
    render(
      <Participant
        clientId="user123"
        isPresent={true}
        isSelf={true}
        isTyping={false}
      />
    );

    const participant = screen.getByRole('listitem');
    expect(participant).toHaveAttribute('aria-label', 'You, online');
  });
});
