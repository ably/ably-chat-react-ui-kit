import { PresenceMember } from '@ably/chat';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { PresenceCount } from '../../../components/molecules/presence-count.tsx';

describe('PresenceCount', () => {
  it('renders nothing when count is zero', () => {
    const { container } = render(<PresenceCount presenceData={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a badge with count 1', () => {
    render(
      <PresenceCount
        presenceData={
          [
            {
              clientId: 'user1',
              data: undefined,
              extras: undefined,
              updatedAt: new Date(Date.now()),
            },
          ] as PresenceMember[]
        }
      />
    );

    const badge = screen.getByRole('status');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('1');
    expect(badge).toHaveAttribute('aria-label', '1 person online');
  });

  it('renders a badge with plural text for multiple users', () => {
    render(
      <PresenceCount
        presenceData={
          [
            {
              clientId: 'user1',
              data: undefined,
              extras: undefined,
              updatedAt: new Date(Date.now()),
            },
            {
              clientId: 'user2',
              data: undefined,
              extras: undefined,
              updatedAt: new Date(Date.now()),
            },
            {
              clientId: 'user3',
              data: undefined,
              extras: undefined,
              updatedAt: new Date(Date.now()),
            },
          ] as PresenceMember[]
        }
      />
    );

    const badge = screen.getByRole('status');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('3');
    expect(badge).toHaveAttribute('aria-label', '3 people online');
  });

  it('caps display at "99+" for large numbers', () => {
    const manyMembers = Array.from({ length: 100 }, (_, i) => ({
      clientId: `user${(i + 1).toString()}`,
      data: undefined,
      extras: undefined,
      updatedAt: new Date(Date.now()),
    })) as PresenceMember[];

    render(<PresenceCount presenceData={manyMembers} />);

    const badge = screen.getByRole('status');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('99+');
    expect(badge).toHaveAttribute('aria-label', '100 people online');
  });

  it('has correct styling', () => {
    render(
      <PresenceCount
        presenceData={
          [
            {
              clientId: 'user1',
              data: undefined,
              extras: undefined,
              updatedAt: new Date(Date.now()),
            },
          ] as PresenceMember[]
        }
      />
    );

    const badge = screen.getByRole('status');
    expect(badge).toHaveClass('bg-green-500');
    expect(badge).toHaveClass('text-white');
    expect(badge).toHaveClass('rounded-full');
  });
});
