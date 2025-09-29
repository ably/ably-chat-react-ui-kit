import '@testing-library/jest-dom';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Button, ButtonProps } from '../../../components/atoms/button.tsx';

describe('Button Component', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Click me');
    });

    it('renders with primary variant by default', () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('ably-button', 'ably-button--primary');
    });

    it('renders with medium size by default', () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('ably-button', 'ably-button--md');
    });

    it('applies custom className', () => {
      render(<Button className="custom-class">Click me</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Button Variants', () => {
    const variants: ButtonProps['variant'][] = [
      'primary',
      'secondary',
      'ghost',
      'outline',
      'danger',
    ];

    for (const variant of variants) {
      it(`renders ${variant} variant correctly`, () => {
        render(<Button variant={variant}>Click me</Button>);

        const button = screen.getByRole('button');
        expect(button).toHaveClass('ably-button');
        expect(button).toHaveClass(`ably-button--${variant}`);
      });
    }
  });

  describe('Button Sizes', () => {
    const sizes: ButtonProps['size'][] = ['xs', 'sm', 'md', 'lg', 'xl'];

    for (const size of sizes) {
      it(`renders ${size} size correctly`, () => {
        render(<Button size={size}>Click me</Button>);

        const button = screen.getByRole('button');
        expect(button).toHaveClass('ably-button');
        expect(button).toHaveClass(`ably-button--${size}`);
      });
    }
  });

  describe('Loading State', () => {
    it('shows default spinner when loading', () => {
      render(<Button loading>Click me</Button>);

      const spinner = screen.getByRole('button').querySelector('svg');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('ably-button__spinner');
      expect(spinner).toHaveClass('ably-button__spinner--md');
    });

    it('shows custom loading spinner when provided', () => {
      const customSpinner = <div data-testid="custom-spinner">Loading...</div>;

      render(
        <Button loading loadingSpinner={customSpinner}>
          Click me
        </Button>
      );

      expect(screen.getByTestId('custom-spinner')).toBeInTheDocument();
    });

    it('disables button when loading', () => {
      render(<Button loading>Click me</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('dims button content when loading', () => {
      render(<Button loading>Click me</Button>);

      const content = screen.getByText('Click me');
      expect(content).toHaveClass('ably-button__content--loading');
    });

    it('hides right icon when loading', () => {
      const rightIcon = <span data-testid="right-icon">→</span>;

      render(
        <Button loading rightIcon={rightIcon}>
          Click me
        </Button>
      );

      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
    });

    it('shows correct spinner size for each button size', () => {
      const sizes: ButtonProps['size'][] = ['xs', 'sm', 'md', 'lg', 'xl'];

      for (const size of sizes) {
        const { unmount } = render(
          <Button loading size={size}>
            Click me
          </Button>
        );

        const spinner = screen.getByRole('button').querySelector('svg');
        expect(spinner).toHaveClass('ably-button__spinner');
        expect(spinner).toHaveClass(`ably-button__spinner--${size}`);

        unmount();
      }
    });
  });

  describe('Icons', () => {
    it('displays left icon', () => {
      const leftIcon = <span data-testid="left-icon">←</span>;

      render(<Button leftIcon={leftIcon}>Click me</Button>);

      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('displays right icon', () => {
      const rightIcon = <span data-testid="right-icon">→</span>;

      render(<Button rightIcon={rightIcon}>Click me</Button>);

      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('displays both left and right icons', () => {
      const leftIcon = <span data-testid="left-icon">←</span>;
      const rightIcon = <span data-testid="right-icon">→</span>;

      render(
        <Button leftIcon={leftIcon} rightIcon={rightIcon}>
          Click me
        </Button>
      );

      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('sets aria-hidden on icon containers', () => {
      const leftIcon = <span data-testid="left-icon">←</span>;
      const rightIcon = <span data-testid="right-icon">→</span>;

      render(
        <Button leftIcon={leftIcon} rightIcon={rightIcon}>
          Click me
        </Button>
      );

      const leftContainer = screen.getByTestId('left-icon').parentElement;
      const rightContainer = screen.getByTestId('right-icon').parentElement;

      expect(leftContainer).toHaveAttribute('aria-hidden', 'true');
      expect(rightContainer).toHaveAttribute('aria-hidden', 'true');
    });

    it('applies flex-shrink-0 to icon containers', () => {
      const leftIcon = <span data-testid="left-icon">←</span>;

      render(<Button leftIcon={leftIcon}>Click me</Button>);

      const iconContainer = screen.getByTestId('left-icon').parentElement;
      expect(iconContainer).toHaveClass('ably-button__icon');
    });
  });

  describe('Full Width', () => {
    it('applies full width class when fullWidth is true', () => {
      render(<Button fullWidth>Click me</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('ably-button--full-width');
    });

    it('does not apply full width class by default', () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('ably-button--full-width');
    });
  });

  describe('Disabled State', () => {
    it('disables button when disabled prop is true', () => {
      render(<Button disabled>Click me</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('applies disabled styling', () => {
      render(<Button disabled>Click me</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('is disabled when both disabled and loading are true', () => {
      render(
        <Button disabled loading>
          Click me
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Click Interactions', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Button onClick={handleClick} disabled>
          Click me
        </Button>
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Button onClick={handleClick} loading>
          Click me
        </Button>
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('supports keyboard interaction (Enter)', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('supports keyboard interaction (Space)', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard(' ');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('HTML Button Attributes', () => {
    it('forwards button HTML attributes', () => {
      render(
        <Button type="submit" form="test-form" data-testid="test-button">
          Submit
        </Button>
      );

      const button = screen.getByTestId('test-button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('form', 'test-form');
    });

    it('supports form submission', () => {
      const handleSubmit = vi.fn((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
      });

      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit</Button>
        </form>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Focus Management', () => {
    it('applies focus styles', () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('ably-button');
    });

    it('applies variant-specific styling', () => {
      const variants: ButtonProps['variant'][] = [
        'primary',
        'secondary',
        'ghost',
        'outline',
        'danger',
      ];

      for (const variant of variants) {
        const { unmount } = render(<Button variant={variant}>Click me</Button>);

        const button = screen.getByRole('button');
        expect(button).toHaveClass(`ably-button--${variant}`);

        unmount();
      }
    });

    it('is focusable when not disabled', () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('is not focusable when disabled', () => {
      render(<Button disabled>Click me</Button>);

      const button = screen.getByRole('button');
      button.focus();
      expect(button).not.toHaveFocus();
    });
  });

  describe('Transition Effects', () => {
    it('applies transition classes', () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('ably-button');
    });
  });

  describe('Complex Scenarios', () => {
    it('handles loading state changes correctly', async () => {
      const { rerender } = render(<Button loading>Click me</Button>);

      // Initially loading
      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();

      // Stop loading
      rerender(<Button>Click me</Button>);

      await waitFor(() => {
        expect(screen.getByRole('button')).not.toBeDisabled();
        expect(screen.getByRole('button').querySelector('svg')).not.toBeInTheDocument();
      });
    });

    it('handles icon visibility during loading transitions', () => {
      const leftIcon = <span data-testid="left-icon">←</span>;
      const rightIcon = <span data-testid="right-icon">→</span>;

      const { rerender } = render(
        <Button leftIcon={leftIcon} rightIcon={rightIcon}>
          Click me
        </Button>
      );

      // Initially show both icons
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();

      // Start loading - left icon replaced with spinner, right icon hidden
      rerender(
        <Button loading leftIcon={leftIcon} rightIcon={rightIcon}>
          Click me
        </Button>
      );

      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
      expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
    });

    it('combines multiple props correctly', () => {
      const leftIcon = <span data-testid="left-icon">←</span>;
      const rightIcon = <span data-testid="right-icon">→</span>;

      render(
        <Button
          variant="danger"
          size="lg"
          fullWidth
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          className="custom-class"
        >
          Complex Button
        </Button>
      );

      const button = screen.getByRole('button');

      // Variant classes
      expect(button).toHaveClass('ably-button--danger');

      // Size classes
      expect(button).toHaveClass('ably-button--lg');

      // Full width
      expect(button).toHaveClass('ably-button--full-width');

      // Custom class
      expect(button).toHaveClass('custom-class');

      // Icons
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children gracefully', () => {
      render(<Button>{''}</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('');
    });

    it('handles React node children', () => {
      render(
        <Button>
          <span>Complex</span> <strong>Content</strong>
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toContainHTML('<span>Complex</span> <strong>Content</strong>');
    });

    it('trims className correctly', () => {
      render(<Button className="  extra-spaces  ">Click me</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('extra-spaces');
    });
  });
});
