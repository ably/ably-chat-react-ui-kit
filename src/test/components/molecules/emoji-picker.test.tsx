import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EmojiPicker } from '../../../components/molecules/emoji-picker.tsx';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      Reflect.deleteProperty(store, key);
    }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('EmojiPicker', () => {
  const mockPosition = { top: 100, left: 100 };
  const mockOnClose = vi.fn();
  const mockOnEmojiSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the emoji picker with default emojis', () => {
    render(
      <EmojiPicker
        position={mockPosition}
        onClose={mockOnClose}
        onEmojiSelect={mockOnEmojiSelect}
      />
    );

    const picker = screen.getByRole('dialog');
    expect(picker).toBeInTheDocument();
    expect(picker).toHaveAttribute('aria-label', 'Emoji picker');

    // Check if default emojis are rendered
    const emojiButtons = screen.getAllByRole('button');
    expect(emojiButtons.length).toBeGreaterThan(0);

    // Check for some specific emojis from the default set
    const emojiTexts = emojiButtons.map((button) => button.textContent);
    expect(emojiTexts).toContain('👍');
    expect(emojiTexts).toContain('❤️');
  });

  it('renders with custom emoji list when provided', () => {
    const customEmojis = ['🎉', '🥳', '🎊', '🎁', '🎈'];

    render(
      <EmojiPicker
        position={mockPosition}
        onClose={mockOnClose}
        onEmojiSelect={mockOnEmojiSelect}
        emojiList={customEmojis}
      />
    );

    // Check if only our custom emojis are rendered (plus any recent emojis)
    for (const emoji of customEmojis) {
      const emojiButton = screen.getByTitle(emoji);
      expect(emojiButton).toBeInTheDocument();
    }

    // Check that a default emoji that's not in our custom list isn't rendered
    const defaultEmojiNotInCustomList = '😂';
    const defaultEmojiButtons = screen.queryAllByTitle(defaultEmojiNotInCustomList);
    expect(defaultEmojiButtons.length).toBe(0);
  });

  it('calls onEmojiSelect when an emoji is clicked', () => {
    render(
      <EmojiPicker
        position={mockPosition}
        onClose={mockOnClose}
        onEmojiSelect={mockOnEmojiSelect}
      />
    );

    // Find and click on the first emoji button
    const emojiButtons = screen.getAllByRole('button');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    fireEvent.click(emojiButtons[0]!);

    expect(mockOnEmojiSelect).toHaveBeenCalledTimes(1);
    expect(mockOnEmojiSelect).toHaveBeenCalledWith(expect.any(String));
  });

  it('calls onClose when backdrop is clicked', () => {
    render(
      <EmojiPicker
        position={mockPosition}
        onClose={mockOnClose}
        onEmojiSelect={mockOnEmojiSelect}
      />
    );

    // Find and click on the backdrop
    const backdrop = screen.getByRole('dialog').previousSibling;
    fireEvent.click(backdrop as Element);

    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    render(
      <EmojiPicker
        position={mockPosition}
        onClose={mockOnClose}
        onEmojiSelect={mockOnEmojiSelect}
      />
    );

    // Press Escape key
    fireEvent.keyDown(document, { key: 'Escape' });

    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('stores selected emoji in recent emojis', () => {
    const setItemSpy = vi.spyOn(localStorage, 'setItem');

    render(
      <EmojiPicker
        position={mockPosition}
        onClose={mockOnClose}
        onEmojiSelect={mockOnEmojiSelect}
      />
    );

    const emojiButtons = screen.getAllByRole('button');
    const selectedEmoji = emojiButtons[0]?.textContent;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    fireEvent.click(emojiButtons[0]!);

    // Check if localStorage.setItem was called with the correct key
    expect(setItemSpy).toHaveBeenCalledWith('ably-chat-recent-emojis', expect.any(String));

    // Check if the stored value contains the selected emoji
    expect(setItemSpy.mock.calls).toHaveLength(1);
    const firstCall = setItemSpy.mock.calls[0];
    expect(firstCall).toBeDefined();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const storedValue: string[] = JSON.parse(firstCall![1]) as string[];
    expect(storedValue).toContain(selectedEmoji);
  });


  it('displays recent emojis when available', () => {
    const recentEmojis = ['🎉', '🥳', '🎊'];
    localStorage.setItem('ably-chat-recent-emojis', JSON.stringify(recentEmojis));

    render(
      <EmojiPicker
        position={mockPosition}
        onClose={mockOnClose}
        onEmojiSelect={mockOnEmojiSelect}
      />
    );

    expect(screen.getByText('Recent')).toBeInTheDocument();
    const recentSection = screen.getByText('Recent').closest('div');
    expect(recentSection).toBeInTheDocument();

    // Check if recent emojis are displayed in the recent section
    for (const emoji of recentEmojis) {
      const emojiInRecentSection = recentSection?.querySelector(`button[title="${emoji}"]`);
      expect(emojiInRecentSection).toBeInTheDocument();
    }
  });

  it('applies custom columns when specified', () => {
    const customColumns = 6;

    render(
      <EmojiPicker
        position={mockPosition}
        onClose={mockOnClose}
        onEmojiSelect={mockOnEmojiSelect}
        columns={customColumns}
      />
    );

    const dialog = screen.getByRole('dialog');

    // The main emoji grid is the second grid element (first is recent emojis if present)
    const emojiGrids = dialog.querySelectorAll('.grid');
    // eslint-disable-next-line unicorn/prefer-at
    const mainEmojiGrid = emojiGrids[emojiGrids.length - 1];

    // Check if the grid has the correct column style
    expect(mainEmojiGrid).toHaveStyle({
      gridTemplateColumns: `repeat(${customColumns.toString()}, minmax(0, 1fr))`,
    });
  });

  it('positions the picker at the specified coordinates', () => {
    const testPosition = { top: 250, left: 350 };

    render(
      <EmojiPicker
        position={testPosition}
        onClose={mockOnClose}
        onEmojiSelect={mockOnEmojiSelect}
      />
    );

    const picker = screen.getByRole('dialog');

    expect(picker).toHaveStyle({
      top: `${testPosition.top.toString()}px`,
      left: `${testPosition.left.toString()}px`,
    });
  });

  it('handles localStorage errors gracefully', () => {
    vi.spyOn(localStorage, 'getItem').mockImplementationOnce(() => {
      throw new Error('localStorage error');
    });

    // Mock console.error to prevent test output pollution
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Component should render without crashing
    render(
      <EmojiPicker
        position={mockPosition}
        onClose={mockOnClose}
        onEmojiSelect={mockOnEmojiSelect}
      />
    );

    // Check if the component renders despite the localStorage error
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Check if the error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to load recent emojis:',
      expect.any(Error)
    );
    consoleErrorSpy.mockRestore();
  });
});
