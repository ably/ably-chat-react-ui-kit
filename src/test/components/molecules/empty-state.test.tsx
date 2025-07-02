import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { EmptyState } from '../../../components/molecules/empty-state.tsx';

describe('EmptyState', () => {
  it('renders with title only', () => {
    render(<EmptyState title="No messages yet" />);

    expect(screen.getByText('No messages yet')).toBeInTheDocument();
  });

  it('renders with title and message', () => {
    render(
      <EmptyState title="No messages yet" message="Start a conversation by sending a message" />
    );

    expect(screen.getByText('No messages yet')).toBeInTheDocument();
    expect(screen.getByText('Start a conversation by sending a message')).toBeInTheDocument();
  });

  it('renders with custom icon', () => {
    render(<EmptyState title="No messages yet" icon={<div data-testid="custom-icon">🔍</div>} />);

    expect(screen.getByText('No messages yet')).toBeInTheDocument();
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(screen.getByText('🔍')).toBeInTheDocument();
  });

  it('renders with action button', () => {
    render(<EmptyState title="No rooms available" action={<button>Create Room</button>} />);

    expect(screen.getByText('No rooms available')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Room' })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<EmptyState title="No messages yet" className="custom-class" />);

    // The first div is the main container
    const emptyState = container.firstChild as HTMLElement;
    expect(emptyState).toHaveClass('custom-class');
  });

  it('uses default aria-label when not provided', () => {
    const { container } = render(<EmptyState title="No messages yet" />);

    // The first div is the main container
    const emptyState = container.firstChild as HTMLElement;
    expect(emptyState).toHaveAttribute('aria-label', 'Empty state');
  });

  it('uses custom aria-label when provided', () => {
    const { container } = render(
      <EmptyState title="No messages yet" ariaLabel="No messages available" />
    );

    // The first div is the main container
    const emptyState = container.firstChild as HTMLElement;
    expect(emptyState).toHaveAttribute('aria-label', 'No messages available');
  });

  it('applies small max width when specified', () => {
    const { container } = render(<EmptyState title="No messages yet" maxWidth="sm" />);

    // The second div is the content container
    const contentContainer = container.firstChild?.firstChild as HTMLElement;
    expect(contentContainer).toHaveClass('max-w-sm');
  });

  it('applies medium max width by default', () => {
    const { container } = render(<EmptyState title="No messages yet" />);

    // The second div is the content container
    const contentContainer = container.firstChild?.firstChild as HTMLElement;
    expect(contentContainer).toHaveClass('max-w-md');
  });

  it('applies large max width when specified', () => {
    const { container } = render(<EmptyState title="No messages yet" maxWidth="lg" />);

    // The second div is the content container
    const contentContainer = container.firstChild?.firstChild as HTMLElement;
    expect(contentContainer).toHaveClass('max-w-lg');
  });

  it('applies extra large max width when specified', () => {
    const { container } = render(<EmptyState title="No messages yet" maxWidth="xl" />);

    // The second div is the content container
    const contentContainer = container.firstChild?.firstChild as HTMLElement;
    expect(contentContainer).toHaveClass('max-w-xl');
  });

  it('centers content vertically by default', () => {
    const { container } = render(<EmptyState title="No messages yet" />);

    // The first div is the main container
    const emptyState = container.firstChild as HTMLElement;
    expect(emptyState).toHaveClass('justify-center');
  });

  it('aligns content to top when specified', () => {
    const { container } = render(<EmptyState title="No messages yet" verticalAlign="top" />);

    // The first div is the main container
    const emptyState = container.firstChild as HTMLElement;
    expect(emptyState).toHaveClass('justify-start');
    expect(emptyState).not.toHaveClass('justify-center');
  });

  it('aligns content to bottom when specified', () => {
    const { container } = render(<EmptyState title="No messages yet" verticalAlign="bottom" />);

    // The first div is the main container
    const emptyState = container.firstChild as HTMLElement;
    expect(emptyState).toHaveClass('justify-end');
    expect(emptyState).not.toHaveClass('justify-center');
  });

  it('centers text horizontally by default', () => {
    const { container } = render(<EmptyState title="No messages yet" />);

    // The second div is the content container
    const contentContainer = container.firstChild?.firstChild as HTMLElement;
    expect(contentContainer).toHaveClass('text-center');
  });

  it('aligns text to left when specified', () => {
    const { container } = render(<EmptyState title="No messages yet" textAlign="left" />);

    // The second div is the content container
    const contentContainer = container.firstChild?.firstChild as HTMLElement;
    expect(contentContainer).toHaveClass('text-left');
    expect(contentContainer).not.toHaveClass('text-center');
  });

  it('aligns text to right when specified', () => {
    const { container } = render(<EmptyState title="No messages yet" textAlign="right" />);

    // The second div is the content container
    const contentContainer = container.firstChild?.firstChild as HTMLElement;
    expect(contentContainer).toHaveClass('text-right');
    expect(contentContainer).not.toHaveClass('text-center');
  });

  it('has correct role attribute', () => {
    const { container } = render(<EmptyState title="No messages yet" />);

    // The first div is the main container
    const emptyState = container.firstChild as HTMLElement;
    expect(emptyState).toHaveAttribute('role', 'status');
  });

  it('renders action with correct alignment when text is not centered', () => {
    render(
      <EmptyState
        title="No messages yet"
        textAlign="left"
        action={<button>Create Message</button>}
      />
    );

    // Find the action container
    const actionContainer = screen.getByRole('button').parentElement;
    expect(actionContainer).toHaveClass('flex');
    expect(actionContainer).toHaveClass('justify-start');
  });

  it('does not add justify-start to action when text is centered', () => {
    render(
      <EmptyState
        title="No messages yet"
        textAlign="center"
        action={<button>Create Message</button>}
      />
    );

    // Find the action container
    const actionContainer = screen.getByRole('button').parentElement;
    expect(actionContainer).not.toHaveClass('flex');
    expect(actionContainer).not.toHaveClass('justify-start');
  });
});
