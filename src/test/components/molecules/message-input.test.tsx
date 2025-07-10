import { type UseMessagesResponse, type UseTypingResponse } from '@ably/chat/react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ButtonProps } from '../../../components/atoms/button.tsx';
import { IconProps } from '../../../components/atoms/icon.tsx';
import { TextInputProps } from '../../../components/atoms/text-input.tsx';
import { EmojiPickerProps } from '../../../components/molecules/emoji-picker.tsx';
import { MessageInput } from '../../../components/molecules/message-input.tsx';

// Mocks the useTyping hook
const mockSend = vi.fn().mockResolvedValue({});
const mockDeleteMessage = vi.fn().mockResolvedValue({});
const mockUpdate = vi.fn().mockResolvedValue({});
const mockSendReaction = vi.fn().mockResolvedValue({});
const mockDeleteReaction = vi.fn().mockResolvedValue({});

vi.mock('@ably/chat/react', () => ({
  useTyping: (): Partial<UseTypingResponse> => ({
    keystroke: vi.fn().mockReturnValue(Promise.resolve()),
    stop: vi.fn().mockReturnValue(Promise.resolve()),
  }),
  useMessages: (): Partial<UseMessagesResponse> => ({
    send: mockSend,
    deleteMessage: mockDeleteMessage,
    update: mockUpdate,
    sendReaction: mockSendReaction,
    deleteReaction: mockDeleteReaction,
  }),
}));

// Mocks the Button component
vi.mock('../../../components/atoms/button', () => ({
  Button: ({
    children,
    onClick,
    variant,
    size,
    className,
    'aria-label': ariaLabel,
    'aria-haspopup': ariaHasPopup,
    'aria-expanded': ariaExpanded,
  }: ButtonProps) => (
    <button
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      className={className}
      aria-label={ariaLabel}
      aria-haspopup={ariaHasPopup}
      aria-expanded={ariaExpanded}
    >
      {children}
    </button>
  ),
}));

// Mocks the Icon component
vi.mock('../../../components/atoms/icon', () => ({
  Icon: ({ name, size, 'aria-hidden': ariaHidden }: IconProps) => (
    <div data-testid={`icon-${name}`} data-size={size} aria-hidden={ariaHidden}>
      {name} icon
    </div>
  ),
}));

// Mocks the TextInput component
vi.mock('../../../components/atoms/text-input', () => {
  const MockedTextInput = React.forwardRef<HTMLTextAreaElement, TextInputProps>(
    (
      {
        value,
        onChange,
        onKeyDown,
        placeholder,
        variant,
        multiline,
        maxHeight,
        className,
        'aria-label': ariaLabel,
      },
      ref
    ) => (
      <textarea
        ref={ref}
        data-testid="text-input"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={className}
        aria-label={ariaLabel}
        data-variant={variant}
        data-multiline={multiline}
        data-max-height={maxHeight}
      />
    )
  );

  MockedTextInput.displayName = 'MockedTextInput';

  return {
    TextInput: MockedTextInput,
  };
});

// Mocks the EmojiPicker component
vi.mock('../../../components/molecules/emoji-picker', () => ({
  EmojiPicker: ({ onClose, onEmojiSelect, position }: EmojiPickerProps) => (
    <div data-testid="emoji-picker">
      <button data-testid="emoji-picker-close" onClick={onClose}>
        Close
      </button>
      <button
        data-testid="emoji-picker-select-emoji"
        onClick={() => {
          onEmojiSelect('😀');
        }}
      >
        Select Emoji
      </button>
      <div data-testid="emoji-picker-position">{JSON.stringify(position)}</div>
    </div>
  ),
}));

describe('MessageInput', () => {
  const mockOnSent = vi.fn();
  let querySelectorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    querySelectorSpy = vi.spyOn(document, 'querySelector').mockImplementation((selector) => {
      if (selector === '[data-emoji-button]') {
        return {
          getBoundingClientRect: () => ({
            top: 100,
            left: 100,
            width: 40,
            height: 40,
            right: 140,
            bottom: 140,
          }),
        } as Element;
      }
      return null;
    });
  });

  afterEach(() => {
    cleanup();
    querySelectorSpy.mockRestore();
  });

  it('renders with default placeholder', () => {
    render(<MessageInput onSent={mockOnSent} />);

    const input = screen.getByTestId('text-input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Type a message...');
  });

  it('renders with custom placeholder', () => {
    render(<MessageInput onSent={mockOnSent} placeholder="Custom placeholder" />);

    const input = screen.getByTestId('text-input');
    expect(input).toHaveAttribute('placeholder', 'Custom placeholder');
  });

  it('updates input value when typing', () => {
    render(<MessageInput onSent={mockOnSent} />);

    const input = screen.getByTestId('text-input');
    fireEvent.change(input, { target: { value: 'Hello, world!' } });

    expect(input).toHaveValue('Hello, world!');
  });

  it('sends a message when send button is clicked', async () => {
    render(<MessageInput onSent={mockOnSent} />);

    const input = screen.getByTestId('text-input');
    fireEvent.change(input, { target: { value: 'Hello, world!' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(mockSend).toHaveBeenCalledWith({ text: 'Hello, world!' });
      expect(input).toHaveValue('');
    });
  });

  it('calls onSent when Enter key is pressed', async () => {
    render(<MessageInput onSent={mockOnSent} />);

    const input = screen.getByTestId('text-input');
    fireEvent.change(input, { target: { value: 'Hello, world!' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(mockOnSent).toHaveBeenCalled();
    });
  });

  it('does not call onSend when Shift+Enter is pressed', () => {
    render(<MessageInput onSent={mockOnSent} />);

    const input = screen.getByTestId('text-input');
    fireEvent.change(input, { target: { value: 'Hello, world!' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });

    expect(mockOnSent).not.toHaveBeenCalled();
    expect(input).toHaveValue('Hello, world!'); // Input should not be cleared
  });

  it('does not call onSend when input is empty or whitespace only', () => {
    render(<MessageInput onSent={mockOnSent} />);

    const input = screen.getByTestId('text-input');

    // Test with empty string
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockOnSent).not.toHaveBeenCalled();

    // Test with whitespace only
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockOnSent).not.toHaveBeenCalled();
  });

  it('shows emoji picker when emoji button is clicked', () => {
    render(<MessageInput onSent={mockOnSent} />);

    // Emoji picker should not be visible initially
    expect(screen.queryByTestId('emoji-picker')).not.toBeInTheDocument();

    // Click the emoji button
    const emojiButton = screen.getByLabelText('Open emoji picker');
    fireEvent.click(emojiButton);

    // Emoji picker should now be visible
    expect(screen.getByTestId('emoji-picker')).toBeInTheDocument();
  });

  it('hides emoji picker when close button is clicked', () => {
    render(<MessageInput onSent={mockOnSent} />);

    // Open the emoji picker
    const emojiButton = screen.getByLabelText('Open emoji picker');
    fireEvent.click(emojiButton);
    expect(screen.getByTestId('emoji-picker')).toBeInTheDocument();

    // Click the close button
    const closeButton = screen.getByTestId('emoji-picker-close');
    fireEvent.click(closeButton);

    // Emoji picker should be hidden
    expect(screen.queryByTestId('emoji-picker')).not.toBeInTheDocument();
  });

  it('inserts emoji at cursor position when selected', () => {
    render(<MessageInput onSent={mockOnSent} />);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const input = screen.getByTestId('text-input') as HTMLTextAreaElement;

    fireEvent.change(input, { target: { value: 'Hello world' } });

    // Set the cursor position at index 5 (after "Hello")
    input.focus();
    input.setSelectionRange(5, 5);

    Object.defineProperty(input, 'selectionStart', {
      value: 5,
      writable: true,
    });
    Object.defineProperty(input, 'selectionEnd', {
      value: 5,
      writable: true,
    });

    // Open the emoji picker and select an emoji
    const emojiButton = screen.getByLabelText('Open emoji picker');
    fireEvent.click(emojiButton);
    expect(screen.getByTestId('emoji-picker')).toBeInTheDocument();

    const selectEmojiButton = screen.getByTestId('emoji-picker-select-emoji');
    fireEvent.click(selectEmojiButton);

    // Check if the emoji was inserted at the cursor position
    expect(input).toHaveValue('Hello😀 world');
  });

  it('positions emoji picker correctly relative to emoji button', () => {
    render(<MessageInput onSent={mockOnSent} />);

    const emojiButton = screen.getByLabelText('Open emoji picker');
    fireEvent.click(emojiButton);

    const positionData = screen.getByTestId('emoji-picker-position');
    expect(positionData).toBeInTheDocument();
    expect(positionData.textContent).toBeDefined();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const position = JSON.parse(positionData.textContent!) as { top: number; left: number };

    // The position should be calculated based on the emoji button's position
    expect(position).toHaveProperty('top');
    expect(position).toHaveProperty('left');

    // The picker should be positioned above the button
    expect(position.top).toBeLessThan(100); // Button top position is 100
  });

  it('has correct accessibility attributes', () => {
    render(<MessageInput onSent={mockOnSent} />);

    const form = screen.getByRole('form');
    expect(form).toHaveAttribute('aria-label', 'Message input');

    const input = screen.getByTestId('text-input');
    expect(input).toHaveAttribute('aria-label', 'Message text');

    const emojiButton = screen.getByLabelText('Open emoji picker');
    expect(emojiButton).toHaveAttribute('aria-haspopup', 'dialog');
    expect(emojiButton).toHaveAttribute('aria-expanded', 'false');
  });
});
