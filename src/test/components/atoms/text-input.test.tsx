import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { TextInput } from '../../../components/atoms/text-input.tsx';

describe('TextInput', () => {
  describe('Basic rendering', () => {
    it('renders a single-line input by default', () => {
      render(<TextInput placeholder="Enter text" />);

      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toBeInTheDocument();
      expect(input.tagName).toBe('INPUT');
    });

    it('renders a textarea when multiline is true', () => {
      render(<TextInput multiline placeholder="Enter text" />);

      const textarea = screen.getByPlaceholderText('Enter text');
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('applies default variant and size classes', () => {
      render(<TextInput placeholder="Enter text" />);

      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toHaveClass('ably-input', 'ably-input--md'); // md size
      expect(input).toHaveClass('ably-input--default'); // default variant
    });
  });

  describe('Variants', () => {
    it('applies default variant classes', () => {
      render(<TextInput variant="default" placeholder="Enter text" />);

      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toHaveClass('ably-input--default');
    });

    it('applies message variant classes', () => {
      render(<TextInput variant="message" placeholder="Enter text" />);

      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toHaveClass('ably-input--message');
    });
  });

  describe('Sizes', () => {
    it('applies small size classes', () => {
      render(<TextInput size="sm" placeholder="Enter text" />);

      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toHaveClass('ably-input--sm');
    });

    it('applies medium size classes', () => {
      render(<TextInput size="md" placeholder="Enter text" />);

      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toHaveClass('ably-input--md');
    });

    it('applies large size classes', () => {
      render(<TextInput size="lg" placeholder="Enter text" />);

      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toHaveClass('ably-input--lg');
    });
  });

  describe('States', () => {
    it('applies error state classes', () => {
      render(<TextInput error placeholder="Enter text" />);

      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toHaveClass('ably-input--error');
    });

    it('applies success state classes', () => {
      render(<TextInput success placeholder="Enter text" />);

      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toHaveClass('ably-input--success');
    });

    it('applies disabled state classes and attributes', () => {
      render(<TextInput disabled placeholder="Enter text" />);

      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toBeDisabled();
      expect(input).toBeDisabled();
    });
  });

  describe('ARIA attributes', () => {
    it('sets aria-invalid to true when error is true', () => {
      render(<TextInput error placeholder="Enter text" />);

      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('allows custom aria-invalid to override error state', () => {
      render(<TextInput error aria-invalid="false" placeholder="Enter text" />);

      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('does not set aria-invalid when error is false', () => {
      render(<TextInput placeholder="Enter text" />);

      const input = screen.getByPlaceholderText('Enter text');
      expect(input).not.toHaveAttribute('aria-invalid');
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(<TextInput className="custom-class" placeholder="Enter text" />);

      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toHaveClass('custom-class');
    });

    it('handles empty className gracefully', () => {
      render(<TextInput className="" placeholder="Enter text" />);

      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toBeInTheDocument();

      // Ensure no empty class artifacts
      const classAttr = input.getAttribute('class');
      expect(classAttr).not.toMatch(/\s{2,}/); // No double spaces
    });
  });

  describe('Prefix and suffix', () => {
    it('renders with prefix element', () => {
      const prefix = <span data-testid="prefix">@</span>;
      render(<TextInput prefix={prefix} placeholder="Enter text" />);

      expect(screen.getByTestId('prefix')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter text')).toHaveClass('ably-input--has-prefix');
    });

    it('renders with suffix element', () => {
      const suffix = <button data-testid="suffix">Send</button>;
      render(<TextInput suffix={suffix} placeholder="Enter text" />);

      expect(screen.getByTestId('suffix')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter text')).toHaveClass('ably-input--has-suffix');
    });

    it('renders with both prefix and suffix', () => {
      const prefix = <span data-testid="prefix">@</span>;
      const suffix = <button data-testid="suffix">Send</button>;
      render(<TextInput prefix={prefix} suffix={suffix} placeholder="Enter text" />);

      expect(screen.getByTestId('prefix')).toBeInTheDocument();
      expect(screen.getByTestId('suffix')).toBeInTheDocument();

      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toHaveClass('ably-input--has-prefix', 'ably-input--has-suffix');
    });

    it('wraps input in container when prefix or suffix is present', () => {
      const prefix = <span data-testid="prefix">@</span>;
      const { container } = render(<TextInput prefix={prefix} placeholder="Enter text" />);

      const wrapper = container.querySelector('.ably-input-wrapper');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveClass('ably-input-wrapper--default');
    });
  });

  describe('Multiline functionality', () => {
    it('sets initial rows to 1 for textarea', () => {
      render(<TextInput multiline placeholder="Enter text" />);

      const textarea = screen.getByPlaceholderText('Enter text');
      expect(textarea).toHaveAttribute('rows', '1');
    });

    it('applies multiline-specific classes', () => {
      render(<TextInput multiline placeholder="Enter text" />);

      const textarea = screen.getByPlaceholderText('Enter text');
      expect(textarea).toHaveClass('ably-input--multiline');
    });

    it('applies rounded-full for message variant when multiline', () => {
      render(<TextInput multiline variant="message" placeholder="Enter text" />);

      const textarea = screen.getByPlaceholderText('Enter text');
      expect(textarea).toHaveClass('ably-input--message', 'ably-input--multiline');
    });

    it('sets maxHeight style', () => {
      render(<TextInput multiline maxHeight="200px" placeholder="Enter text" />);

      const textarea = screen.getByPlaceholderText('Enter text');
      expect(textarea).toHaveStyle({ maxHeight: '200px' });
    });
  });

  describe('Auto-resize behavior', () => {
    it('auto-resizes textarea on content change', async () => {
      const user = userEvent.setup();
      render(<TextInput multiline placeholder="Enter text" />);

      const textarea = screen.getByPlaceholderText('Enter text');

      // Mock scrollHeight to simulate content height
      Object.defineProperty(textarea, 'scrollHeight', {
        get: () => 100,
        configurable: true,
      });

      await user.type(textarea, 'This is a long message that should trigger auto-resize');

      await waitFor(() => {
        expect(textarea.style.height).toBe('100px');
      });
    });

    it('limits height to maxHeight', async () => {
      const user = userEvent.setup();
      render(<TextInput multiline maxHeight="100px" placeholder="Enter text" />);

      const textarea = screen.getByPlaceholderText('Enter text');

      // Mock scrollHeight to exceed maxHeight
      Object.defineProperty(textarea, 'scrollHeight', {
        get: () => 200,
        configurable: true,
      });

      await user.type(textarea, 'Very long content');

      await waitFor(() => {
        expect(textarea.style.height).toBe('100px');
      });
    });

    it('shows scrollbar when content exceeds maxHeight', async () => {
      const user = userEvent.setup();
      render(<TextInput multiline maxHeight="100px" placeholder="Enter text" />);

      const textarea = screen.getByPlaceholderText('Enter text');

      // Mock scrollHeight to exceed maxHeight
      Object.defineProperty(textarea, 'scrollHeight', {
        get: () => 200,
        configurable: true,
      });

      await user.type(textarea, 'Very long content that exceeds max height');

      await waitFor(() => {
        expect(textarea).toHaveClass('ably-input--multiline-scrollable');
        expect(textarea).not.toHaveClass('ably-input--multiline');
      });
    });
  });

  describe('Event handling', () => {
    it('calls onChange when value changes', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<TextInput onChange={handleChange} placeholder="Enter text" />);

      const input = screen.getByPlaceholderText('Enter text');
      await user.type(input, 'test');

      expect(handleChange).toHaveBeenCalledTimes(4); // One for each character
    });

    it('calls onChange for multiline input', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<TextInput multiline onChange={handleChange} placeholder="Enter text" />);

      const textarea = screen.getByPlaceholderText('Enter text');
      await user.type(textarea, 'test');

      expect(handleChange).toHaveBeenCalledTimes(4);
    });

    it('supports controlled input', () => {
      const { rerender } = render(<TextInput value="initial" onChange={() => {}} />);

      const input = screen.getByDisplayValue('initial');
      expect(input).toHaveValue('initial');

      rerender(<TextInput value="updated" onChange={() => {}} />);
      expect(input).toHaveValue('updated');
    });
  });

  describe('Forward ref', () => {
    it('forwards ref to input element', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<TextInput ref={ref} placeholder="Enter text" />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current).toBe(screen.getByPlaceholderText('Enter text'));
    });

    it('forwards ref to textarea element when multiline', () => {
      const ref = React.createRef<HTMLTextAreaElement>();
      render(<TextInput multiline ref={ref} placeholder="Enter text" />);

      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
      expect(ref.current).toBe(screen.getByPlaceholderText('Enter text'));
    });
  });

  describe('HTML attributes', () => {
    it('passes through additional HTML attributes', () => {
      render(
        <TextInput
          placeholder="Enter text"
          id="test-input"
          name="testName"
          autoComplete="off"
          data-testid="custom-input"
        />
      );

      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toHaveAttribute('id', 'test-input');
      expect(input).toHaveAttribute('name', 'testName');
      expect(input).toHaveAttribute('autoComplete', 'off');
      expect(input).toHaveAttribute('data-testid', 'custom-input');
    });
  });

  describe('displayName', () => {
    it('has correct displayName for debugging', () => {
      expect(TextInput.displayName).toBe('TextInput');
    });
  });

  describe('Edge cases', () => {
    it('handles undefined onChange gracefully', () => {
      expect(() => {
        render(<TextInput placeholder="Enter text" />);
      }).not.toThrow();
    });

    it('handles auto-resize when textarea ref is null', async () => {
      const user = userEvent.setup();
      render(<TextInput multiline placeholder="Enter text" />);

      const textarea = screen.getByPlaceholderText('Enter text');

      await user.type(textarea, 'test');

      expect(textarea).toHaveValue('test');
    });

    it('handles numeric maxHeight values', () => {
      render(<TextInput multiline maxHeight="100" placeholder="Enter text" />);

      const textarea = screen.getByPlaceholderText('Enter text');
      expect(textarea).toHaveStyle({ maxHeight: '100' });
    });
  });

  describe('Focus behavior', () => {
    it('can be focused programmatically', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<TextInput ref={ref} placeholder="Enter text" />);

      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });

    it('applies focus styles', async () => {
      const user = userEvent.setup();
      render(<TextInput placeholder="Enter text" />);

      const input = screen.getByPlaceholderText('Enter text');
      await user.click(input);

      expect(input).toHaveFocus();
    });
  });
});
