import { usePresenceListener } from '@ably/chat/react';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { TooltipProps } from '../../../components/atoms/tooltip.tsx';
import { PresenceList } from '../../../components/molecules/presence-list.tsx';

// Mock the usePresenceListener hook
vi.mock('@ably/chat/react', () => ({
  usePresenceListener: vi.fn(),
}));

// Mock the createPortal function
vi.mock('react-dom', () => ({
  createPortal: (node: React.ReactNode) => node,
}));

// Mock the Tooltip component
vi.mock('../../../components/atoms/tooltip.tsx', () => ({
  Tooltip: ({ children, className, role, 'aria-live': ariaLive, position, style }: TooltipProps) => (
    <div
      data-testid="tooltip"
      className={className}
      role={role}
      aria-live={ariaLive}
      data-position={position}
      style={style}
    >
      {children}
    </div>
  ),
}));


describe('PresenceList', () => {
  it('renders nothing when coords are not provided', () => {
    (usePresenceListener as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      presenceData: [{ clientId: 'user1' }],
    });

    const { container } = render(<PresenceList tooltipPosition="above" />);

    expect(container.firstChild).toBeNull();
  });

  it('renders tooltip with "No one is currently present" when no one is present', () => {
    (usePresenceListener as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      presenceData: [],
    });

    render(<PresenceList tooltipPosition="above" coords={{ top: 100, left: 200 }} />);

    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveAttribute('data-position', 'above');
    expect(tooltip).toHaveAttribute('role', 'tooltip');
    expect(tooltip).toHaveAttribute('aria-live', 'polite');

    expect(screen.getByText('No one is currently present')).toBeInTheDocument();
  });

  it('renders tooltip with single person text', () => {
    (usePresenceListener as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      presenceData: [{ clientId: 'Alice' }],
    });

    render(<PresenceList tooltipPosition="below" coords={{ top: 100, left: 200 }} />);

    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveAttribute('data-position', 'below');

    expect(screen.getByText('Alice is present')).toBeInTheDocument();
  });

  it('renders tooltip with multiple people text', () => {
    (usePresenceListener as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      presenceData: [{ clientId: 'Alice' }, { clientId: 'Bob' }],
    });

    render(<PresenceList tooltipPosition="above" coords={{ top: 100, left: 200 }} />);

    expect(screen.getByText('Alice, Bob are present')).toBeInTheDocument();
  });

  it('truncates list and shows count for more than 2 people', () => {
    (usePresenceListener as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      presenceData: [
        { clientId: 'Alice' },
        { clientId: 'Bob' },
        { clientId: 'Charlie' },
        { clientId: 'Dave' },
      ],
    });

    render(<PresenceList tooltipPosition="above" coords={{ top: 100, left: 200 }} />);

    expect(screen.getByText('Alice, Bob and 2 more are present')).toBeInTheDocument();
  });

  it('applies custom tooltip and text classes', () => {
    (usePresenceListener as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      presenceData: [{ clientId: 'Alice' }],
    });

    render(
      <PresenceList
        tooltipPosition="above"
        coords={{ top: 100, left: 200 }}
        tooltipClassName="custom-tooltip"
        textClassName="custom-text"
      />
    );

    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip).toHaveClass('custom-tooltip');
    expect(tooltip).toHaveClass('fixed');
    expect(tooltip).toHaveClass('transform');
    expect(tooltip).toHaveClass('-translate-x-1/2');

    // Find the text element directly, not its parent
    const textElement = screen.getByText('Alice is present');
    expect(textElement).toHaveClass('custom-text');
    expect(textElement).toHaveClass('text-center');
    expect(textElement).toHaveClass('truncate');
  });

  it('positions tooltip at the provided coordinates', () => {
    (usePresenceListener as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      presenceData: [{ clientId: 'Alice' }],
    });

    render(<PresenceList tooltipPosition="above" coords={{ top: 123, left: 456 }} />);

    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip).toHaveStyle('top: 123px');
    expect(tooltip).toHaveStyle('left: 456px');
  });
});
