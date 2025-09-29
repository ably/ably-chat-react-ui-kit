import '@testing-library/jest-dom';

import { usePresenceListener } from '@ably/chat/react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { PresenceList } from '../../../components/molecules/presence-list.tsx';

// Mock the usePresenceListener hook
vi.mock('@ably/chat/react', () => ({
  usePresenceListener: vi.fn(),
}));

// Mock the Tooltip component
vi.mock('../../../components/atoms/tooltip.tsx', () => ({
  Tooltip: ({ title, children, position = 'auto', maxWidth = 'xs', ...props }: any) => {
    const [isVisible, setIsVisible] = React.useState(false);

    const clonedChild = React.cloneElement(children, {
      onMouseEnter: () => setIsVisible(true),
      onMouseLeave: () => setIsVisible(false),
      ...children.props,
    });

    return (
      <>
        {clonedChild}
        {isVisible && (
          <div data-testid="tooltip" data-position={position} data-max-width={maxWidth} {...props}>
            {title}
          </div>
        )}
      </>
    );
  },
}));

describe('PresenceList', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders children correctly', () => {
    (usePresenceListener as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      presenceData: [],
    });

    render(
      <PresenceList>
        <button data-testid="trigger">Show Participants</button>
      </PresenceList>
    );

    expect(screen.getByTestId('trigger')).toBeInTheDocument();
    expect(screen.getByText('Show Participants')).toBeInTheDocument();
  });

  it('shows tooltip with "No one is currently present" when no one is present', async () => {
    (usePresenceListener as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      presenceData: [],
    });

    render(
      <PresenceList>
        <button data-testid="trigger">Show Participants</button>
      </PresenceList>
    );

    const trigger = screen.getByTestId('trigger');
    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent('No one is currently present');
    });
  });

  it('shows tooltip with single person text', async () => {
    (usePresenceListener as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      presenceData: [{ clientId: 'Alice' }],
    });

    render(
      <PresenceList>
        <button data-testid="trigger">Show Participants</button>
      </PresenceList>
    );

    const trigger = screen.getByTestId('trigger');
    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent('Alice is present');
    });
  });

  it('shows tooltip with multiple people text', async () => {
    (usePresenceListener as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      presenceData: [{ clientId: 'Alice' }, { clientId: 'Bob' }],
    });

    render(
      <PresenceList>
        <button data-testid="trigger">Show Participants</button>
      </PresenceList>
    );

    const trigger = screen.getByTestId('trigger');
    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent('Alice, Bob are present');
    });
  });

  it('truncates list and shows count for more than 2 people', async () => {
    (usePresenceListener as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      presenceData: [
        { clientId: 'Alice' },
        { clientId: 'Bob' },
        { clientId: 'Charlie' },
        { clientId: 'Dave' },
      ],
    });

    render(
      <PresenceList>
        <button data-testid="trigger">Show Participants</button>
      </PresenceList>
    );

    const trigger = screen.getByTestId('trigger');
    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent('Alice, Bob and 2 more are present');
    });
  });

  it('updates tooltip content when presence data changes', async () => {
    const mockUsePresenceListener = usePresenceListener as unknown as ReturnType<typeof vi.fn>;

    // Start with no one present
    mockUsePresenceListener.mockReturnValue({
      presenceData: [],
    });

    const { rerender } = render(
      <PresenceList>
        <button data-testid="trigger">Show Participants</button>
      </PresenceList>
    );

    const trigger = screen.getByTestId('trigger');
    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveTextContent('No one is currently present');
    });

    // Update to have one person present
    mockUsePresenceListener.mockReturnValue({
      presenceData: [{ clientId: 'Alice' }],
    });

    rerender(
      <PresenceList>
        <button data-testid="trigger">Show Participants</button>
      </PresenceList>
    );

    await waitFor(() => {
      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveTextContent('Alice is present');
    });
  });

  it('supports custom positioning', () => {
    (usePresenceListener as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      presenceData: [{ clientId: 'Alice' }],
    });

    render(
      <PresenceList position="above">
        <button data-testid="trigger">Show Participants</button>
      </PresenceList>
    );

    const trigger = screen.getByTestId('trigger');
    fireEvent.mouseEnter(trigger);

    waitFor(() => {
      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveAttribute('data-position', 'above');
    });
  });

  it('passes through tooltip props', () => {
    (usePresenceListener as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      presenceData: [{ clientId: 'Alice' }],
    });

    render(
      <PresenceList
        position="below"
        tooltipProps={{
          maxWidth: 'md',
          variant: 'light',
        }}
      >
        <button data-testid="trigger">Show Participants</button>
      </PresenceList>
    );

    const trigger = screen.getByTestId('trigger');
    fireEvent.mouseEnter(trigger);

    waitFor(() => {
      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveAttribute('data-position', 'below');
      expect(tooltip).toHaveAttribute('data-max-width', 'md');
    });
  });

  it('hides tooltip on mouse leave', async () => {
    (usePresenceListener as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      presenceData: [{ clientId: 'Alice' }],
    });

    render(
      <PresenceList>
        <button data-testid="trigger">Show Participants</button>
      </PresenceList>
    );

    const trigger = screen.getByTestId('trigger');

    // Show tooltip
    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });

    // Hide tooltip
    fireEvent.mouseLeave(trigger);

    await waitFor(() => {
      expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument();
    });
  });

  it('works with different child elements', async () => {
    (usePresenceListener as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      presenceData: [{ clientId: 'Alice' }],
    });

    render(
      <PresenceList>
        <div data-testid="custom-trigger" className="presence-indicator">
          5 online
        </div>
      </PresenceList>
    );

    const trigger = screen.getByTestId('custom-trigger');
    expect(trigger).toHaveTextContent('5 online');
    expect(trigger).toHaveClass('presence-indicator');

    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveTextContent('Alice is present');
    });
  });
});
