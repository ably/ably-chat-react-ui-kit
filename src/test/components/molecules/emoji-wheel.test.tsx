import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EmojiWheel } from '../../../components/molecules/emoji-wheel.tsx';

// Mocks the Icon component
vi.mock('../../../components/atoms/icon', () => ({
  Icon: ({ name, size }: { name: string; size?: string }) => (
    <div data-testid={`icon-${name}`} data-size={size}>
      {name} icon
    </div>
  ),
}));

describe('EmojiWheel', () => {
  const mockPosition = { x: 100, y: 100 };
  const mockOnClose = vi.fn();
  const mockOnEmojiSelect = vi.fn();

  // Mock window dimensions for testing
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;

  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(globalThis, 'innerWidth', { value: 1024, writable: true });
    Object.defineProperty(globalThis, 'innerHeight', { value: 768, writable: true });

    globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'innerWidth', { value: originalInnerWidth, writable: true });
    Object.defineProperty(globalThis, 'innerHeight', {
      value: originalInnerHeight,
      writable: true,
    });

    vi.restoreAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    render(
      <EmojiWheel
        isOpen={false}
        position={mockPosition}
        onClose={mockOnClose}
        onEmojiSelect={mockOnEmojiSelect}
      />
    );

    // The component should not render anything when isOpen is false
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the emoji wheel when isOpen is true', () => {
    render(
      <EmojiWheel
        isOpen={true}
        position={mockPosition}
        onClose={mockOnClose}
        onEmojiSelect={mockOnEmojiSelect}
      />
    );

    // The component should render a dialog
    const wheel = screen.getByRole('dialog');
    expect(wheel).toBeInTheDocument();
    expect(wheel).toHaveAttribute('aria-label', 'Emoji reaction selector');

    // Should render the close button
    const closeButton = screen.getByLabelText('Close emoji selector');
    expect(closeButton).toBeInTheDocument();

    // Should render the default emojis (8 by default)
    const emojiButtons = screen.getAllByRole('button');
    // +1 for the close button
    expect(emojiButtons.length).toBe(9);
  });

  it('renders with custom emoji list when provided', () => {
    const customEmojis = ['🎉', '🥳', '🎊', '🎁', '🎈', '🎯', '🎪', '🎭'];

    render(
      <EmojiWheel
        isOpen={true}
        position={mockPosition}
        onClose={mockOnClose}
        onEmojiSelect={mockOnEmojiSelect}
        emojis={customEmojis}
      />
    );

    // Check if our custom emojis are rendered
    for (const emoji of customEmojis) {
      const emojiButton = screen.getByText(emoji);
      expect(emojiButton).toBeInTheDocument();
    }
  });

  it('calls onEmojiSelect when an emoji is clicked', () => {
    render(
      <EmojiWheel
        isOpen={true}
        position={mockPosition}
        onClose={mockOnClose}
        onEmojiSelect={mockOnEmojiSelect}
      />
    );

    const emojiButton = screen
      .getAllByRole('button')
      .find((button) => !button.getAttribute('aria-label')?.includes('Close'));

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    fireEvent.click(emojiButton!);

    // Check if onEmojiSelect was called with the correct emoji
    expect(mockOnEmojiSelect).toHaveBeenCalledTimes(1);
    expect(mockOnEmojiSelect).toHaveBeenCalledWith(expect.any(String));
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <EmojiWheel
        isOpen={true}
        position={mockPosition}
        onClose={mockOnClose}
        onEmojiSelect={mockOnEmojiSelect}
      />
    );

    // Find and click on the close button
    const closeButton = screen.getByLabelText('Close emoji selector');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    render(
      <EmojiWheel
        isOpen={true}
        position={mockPosition}
        onClose={mockOnClose}
        onEmojiSelect={mockOnEmojiSelect}
      />
    );

    const backdrop = screen.getByRole('dialog').parentElement?.querySelector('.transition-opacity');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    fireEvent.click(backdrop!);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking outside the wheel', () => {
    const outsideElement = document.createElement('div');
    outsideElement.dataset.testid = 'outside-element';
    document.body.append(outsideElement);

    render(
      <EmojiWheel
        isOpen={true}
        position={mockPosition}
        onClose={mockOnClose}
        onEmojiSelect={mockOnEmojiSelect}
      />
    );

    // Mousedown event outside the wheel
    fireEvent.mouseDown(outsideElement);

    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    outsideElement.remove();
  });

  it('adjusts position to stay within viewport', () => {
    const edgePosition = { x: 10, y: 10 };

    render(
      <EmojiWheel
        isOpen={true}
        position={edgePosition}
        onClose={mockOnClose}
        onEmojiSelect={mockOnEmojiSelect}
      />
    );

    const wheelContainer = screen
      .getByRole('dialog')
      .parentElement?.querySelector('[data-emoji-wheel="true"]');
    expect(wheelContainer).toBeInTheDocument();

    const style = wheelContainer?.getAttribute('style') || '';

    // The position should be adjusted to be at least the minimum margin from the edge
    expect(style).not.toContain('left: -');
    expect(style).not.toContain('top: -');
  });

  it('applies animation classes based on isOpen state', () => {
    const { rerender } = render(
      <EmojiWheel
        isOpen={true}
        position={mockPosition}
        onClose={mockOnClose}
        onEmojiSelect={mockOnEmojiSelect}
      />
    );

    // When open, the wheel should have the open animation classes
    const openWheel = screen
      .getByRole('dialog')
      .parentElement?.querySelector('[data-emoji-wheel="true"]');
    expect(openWheel).toHaveClass('opacity-100', 'scale-100');
    expect(openWheel).not.toHaveClass('opacity-0', 'scale-50');

    rerender(
      <EmojiWheel
        isOpen={false}
        position={mockPosition}
        onClose={mockOnClose}
        onEmojiSelect={mockOnEmojiSelect}
      />
    );

    // The wheel should still be in the document during exit animation
    const closingWheel = document.querySelector('[data-emoji-wheel="true"]');
    if (closingWheel) {
      expect(closingWheel).toHaveClass('opacity-0', 'scale-50');
      expect(closingWheel).not.toHaveClass('opacity-100', 'scale-100');
    }
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = render(
      <EmojiWheel
        isOpen={true}
        position={mockPosition}
        onClose={mockOnClose}
        onEmojiSelect={mockOnEmojiSelect}
      />
    );

    unmount();

    // Check if event listeners were removed
    expect(removeEventListenerSpy).toHaveBeenCalled();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
  });
});
