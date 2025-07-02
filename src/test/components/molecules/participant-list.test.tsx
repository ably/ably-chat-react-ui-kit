import { PresenceMember } from '@ably/chat';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ButtonProps } from '../../../components/atoms/button.tsx';
import { IconProps } from '../../../components/atoms/icon.tsx';
import { ParticipantProps } from '../../../components/molecules/participant.tsx';
import { ParticipantList } from '../../../components/molecules/participant-list.tsx';

// Mock the Participant component
vi.mock('../../../components/molecules/participant', () => ({
  Participant: ({ clientId, isPresent, isSelf, isTyping }: ParticipantProps) => (
    <div
      data-testid={`participant-${clientId}`}
      data-present={isPresent.toString()}
      data-self={isSelf.toString()}
      data-typing={isTyping.toString()}
    >
      {clientId} {isSelf && '(you)'}
    </div>
  ),
}));

// Mock the Button component
vi.mock('../../../components/atoms/button', () => ({
  Button: ({ children, onClick, variant, size, 'aria-label': ariaLabel }: ButtonProps) => (
    <button onClick={onClick} data-variant={variant} data-size={size} aria-label={ariaLabel}>
      {children}
    </button>
  ),
}));

// Mock the Icon component
vi.mock('../../../components/atoms/icon', () => ({
  Icon: ({ name, size, 'aria-hidden': ariaHidden }: IconProps) => (
    <span data-testid={`icon-${name}`} data-size={size} aria-hidden={ariaHidden}>
      {name}
    </span>
  ),
}));

describe('ParticipantList', () => {
  const mockPresenceData: PresenceMember[] = [
    { clientId: 'user1', data: {}, extras: {}, updatedAt: new Date().getUTCDate() },
    { clientId: 'user2', data: {}, extras: {}, updatedAt: new Date().getUTCDate() },
    { clientId: 'user3', data: {}, extras: {}, updatedAt: new Date().getUTCDate() },
  ];

  const mockTypingUsers = new Set(['user2']);
  const mockToggle = vi.fn();

  it('renders with basic props', () => {
    render(
      <ParticipantList
        presenceData={mockPresenceData}
        currentClientId="user1"
        currentlyTyping={mockTypingUsers}
        onToggle={mockToggle}
        position={{ top: 100, left: 200 }}
      />
    );

    // Check if the component renders the header
    expect(screen.getByText('Participants (3)')).toBeInTheDocument();
    expect(screen.getByText('3 people present')).toBeInTheDocument();

    // Check if all participants are rendered
    expect(screen.getByTestId('participant-user1')).toBeInTheDocument();
    expect(screen.getByTestId('participant-user2')).toBeInTheDocument();
    expect(screen.getByTestId('participant-user3')).toBeInTheDocument();
  });

  it('positions the modal correctly', () => {
    render(
      <ParticipantList
        presenceData={mockPresenceData}
        currentClientId="user1"
        currentlyTyping={mockTypingUsers}
        onToggle={mockToggle}
        position={{ top: 100, left: 200 }}
      />
    );

    const modal = screen.getByRole('dialog');

    // Check if the modal has the correct position styles
    expect(modal).toHaveStyle('top: 100px');
    expect(modal).toHaveStyle('left: 200px');
    expect(modal).toHaveStyle('transform: translateX(-50%)');
  });

  it('sorts current user first', () => {
    const { container } = render(
      <ParticipantList
        presenceData={mockPresenceData}
        currentClientId="user3" // Make user3 the current user
        currentlyTyping={mockTypingUsers}
        onToggle={mockToggle}
        position={{ top: 100, left: 200 }}
      />
    );

    const participants = container.querySelectorAll('[data-testid^="participant-"]');

    // Check if the first participant is the current user
    expect(participants[0]).toHaveAttribute('data-testid', 'participant-user3');
    expect(participants[0]).toHaveAttribute('data-self', 'true');

    // Check if the remaining participants are sorted alphabetically
    expect(participants[1]).toHaveAttribute('data-testid', 'participant-user1');
    expect(participants[2]).toHaveAttribute('data-testid', 'participant-user2');
  });

  it('passes typing status to participants', () => {
    render(
      <ParticipantList
        presenceData={mockPresenceData}
        currentClientId="user1"
        currentlyTyping={mockTypingUsers}
        onToggle={mockToggle}
        position={{ top: 100, left: 200 }}
      />
    );

    // Check if the typing user has the correct typing status
    expect(screen.getByTestId('participant-user2')).toHaveAttribute('data-typing', 'true');

    // Check if non-typing users have the correct typing status
    expect(screen.getByTestId('participant-user1')).toHaveAttribute('data-typing', 'false');
    expect(screen.getByTestId('participant-user3')).toHaveAttribute('data-typing', 'false');
  });

  it('calls onToggle when close button is clicked', () => {
    render(
      <ParticipantList
        presenceData={mockPresenceData}
        currentClientId="user1"
        currentlyTyping={mockTypingUsers}
        onToggle={mockToggle}
        position={{ top: 100, left: 200 }}
      />
    );

    const closeButton = screen.getByLabelText('Close participants list');
    fireEvent.click(closeButton);

    // Check if onToggle was called
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('handles empty presence data', () => {
    render(
      <ParticipantList
        presenceData={[]}
        currentClientId="user1"
        currentlyTyping={new Set()}
        onToggle={mockToggle}
        position={{ top: 100, left: 200 }}
      />
    );

    // Check if the component shows zero participants
    expect(screen.getByText('Participants (0)')).toBeInTheDocument();
    expect(screen.getByText('0 people present')).toBeInTheDocument();

    // Check that no participant elements are rendered
    expect(screen.queryByTestId(/participant-/)).not.toBeInTheDocument();
  });

  it('handles singular form for one participant', () => {
    render(
      <ParticipantList
        presenceData={[
          { clientId: 'user1', data: {}, extras: {}, updatedAt: new Date().getUTCDate() },
        ]}
        currentClientId="user1"
        currentlyTyping={new Set()}
        onToggle={mockToggle}
        position={{ top: 100, left: 200 }}
      />
    );

    // Check if the component uses singular form
    expect(screen.getByText('Participants (1)')).toBeInTheDocument();
    expect(screen.getByText('1 person present')).toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(
      <ParticipantList
        presenceData={mockPresenceData}
        currentClientId="user1"
        currentlyTyping={mockTypingUsers}
        onToggle={mockToggle}
        position={{ top: 100, left: 200 }}
      />
    );

    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby', 'participants-heading');

    const list = screen.getByRole('list');
    expect(list).toHaveAttribute('aria-label', 'Room participants');

    const participantCount = screen.getByText('3 people present');
    expect(participantCount).toHaveAttribute('aria-live', 'polite');
  });
});
