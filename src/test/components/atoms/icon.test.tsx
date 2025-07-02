import '@testing-library/jest-dom';

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { Icon, IconProps } from '../../../components/atoms/icon.tsx';

const originalConsoleWarn = console.warn;
const mockConsoleWarn = vi.fn();

const getIcon = (container: HTMLElement) => {
  const icon = container.querySelector('svg');
  if (!icon) throw new Error('Icon not found');
  return icon;
};

describe('Icon Component', () => {
  beforeEach(() => {
    console.warn = mockConsoleWarn;
    mockConsoleWarn.mockClear();
  });

  afterAll(() => {
    console.warn = originalConsoleWarn;
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      const { container } = render(<Icon name="send" />);

      const icon = getIcon(container);
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders with medium size by default', () => {
      const { container } = render(<Icon name="send" />);

      const icon = getIcon(container);
      expect(icon).toHaveClass('w-5', 'h-5');
    });

    it('uses current color by default', () => {
      const { container } = render(<Icon name="send" />);

      const icon = getIcon(container);
      expect(icon).toHaveClass('text-current');
    });

    it('applies custom className', () => {
      const { container } = render(<Icon name="send" className="custom-class" />);

      const icon = getIcon(container);
      expect(icon).toHaveClass('custom-class');
    });
  });

  describe('Icon Library', () => {
    const iconNames: IconProps['name'][] = [
      'send',
      'info',
      'moon',
      'sun',
      'phone',
      'video',
      'more',
      'attachment',
      'emoji',
      'thumbsup',
      'edit',
      'delete',
      'close',
      'chevronleft',
      'chevronright',
      'upload',
    ];

    for (const iconName of iconNames) {
      it(`renders ${iconName} icon correctly`, () => {
        const { container } = render(<Icon name={iconName} />);
        const icon = getIcon(container);
        expect(icon).toBeInTheDocument();

        // Check that the path element exists with the correct viewBox
        expect(icon).toHaveAttribute('viewBox', '0 0 24 24');

        const path = icon.querySelector('path');
        expect(path).toBeInTheDocument();
        expect(path).toHaveAttribute('stroke-linecap', 'round');
        expect(path).toHaveAttribute('stroke-linejoin', 'round');
        expect(path).toHaveAttribute('stroke-width', '2');
      });
    }
  });

  describe('Size Variants', () => {
    const sizes: { size: IconProps['size']; expectedClasses: string[] }[] = [
      { size: 'sm', expectedClasses: ['w-4', 'h-4'] },
      { size: 'md', expectedClasses: ['w-5', 'h-5'] },
      { size: 'lg', expectedClasses: ['w-6', 'h-6'] },
      { size: 'xl', expectedClasses: ['w-8', 'h-8'] },
    ];

    for (const { size, expectedClasses } of sizes) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      it(`renders ${size} size correctly`, () => {
        const { container } = render(<Icon name="send" size={size} />);

        const icon = getIcon(container);
        for (const className of expectedClasses) {
          expect(icon).toHaveClass(className);
        }
      });
    }
  });

  describe('Color Variants', () => {
    const colors: { color: IconProps['color']; expectedClass: string }[] = [
      { color: 'current', expectedClass: 'text-current' },
      { color: 'primary', expectedClass: 'text-blue-600' },
      { color: 'secondary', expectedClass: 'text-gray-600' },
      { color: 'success', expectedClass: 'text-green-600' },
      { color: 'warning', expectedClass: 'text-yellow-600' },
      { color: 'error', expectedClass: 'text-red-600' },
    ];

    for (const { color, expectedClass } of colors) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      it(`renders ${color} color correctly`, () => {
        const { container } = render(<Icon name="send" color={color} />);

        const icon = getIcon(container);
        expect(icon).toHaveClass(expectedClass);
      });
    }

    it('includes dark mode classes for non-current colors', () => {
      const { container } = render(<Icon name="send" color="primary" />);

      const icon = getIcon(container);
      expect(icon).toHaveClass('dark:text-blue-400');
    });
  });

  describe('Accessibility', () => {
    it('applies aria-label when provided', () => {
      const { container } = render(<Icon name="send" aria-label="Send message" />);

      const icon = getIcon(container);
      expect(icon).toHaveAttribute('aria-label', 'Send message');
      expect(icon).toHaveAttribute('aria-hidden', 'false');
    });

    it('is hidden from screen readers by default when no aria-label', () => {
      const { container } = render(<Icon name="send" />);

      const icon = getIcon(container);
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('shows to screen readers when aria-label is provided even without explicit aria-hidden', () => {
      const { container } = render(<Icon name="send" aria-label="Send" />);

      const icon = getIcon(container);
      expect(icon).toHaveAttribute('aria-hidden', 'false');
    });

    it('respects explicit aria-hidden override', () => {
      const { container } = render(<Icon name="send" aria-label={'test'} aria-hidden={false} />);

      const icon = getIcon(container);
      expect(icon).toHaveAttribute('aria-hidden', 'false');
    });
  });

  describe('Interactive Icons', () => {
    it('becomes interactive when onClick is provided', () => {
      const handleClick = vi.fn();
      const { container } = render(<Icon name="close" onClick={handleClick} />);

      const icon = getIcon(container);
      expect(icon).toHaveClass('cursor-pointer');
      expect(icon.tabIndex).toBe(0);
    });

    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Icon name="close" onClick={handleClick} aria-label="Close" />);

      const icon = screen.getByRole('button');
      await user.click(icon);

      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });

    it('supports keyboard interaction with Enter', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Icon name="close" onClick={handleClick} aria-label="Close" />);

      const icon = screen.getByRole('button');
      icon.focus();
      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('supports keyboard interaction with Space', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Icon name="close" onClick={handleClick} aria-label="Close" />);

      const icon = screen.getByRole('button');
      icon.focus();
      await user.keyboard(' ');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('prevents default on Space key to avoid scrolling', () => {
      const handleClick = vi.fn();
      render(<Icon name="close" onClick={handleClick} aria-label="Close" />);

      const icon = screen.getByRole('button');

      const keyDownEvent = new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      });

      const preventDefaultSpy = vi.spyOn(keyDownEvent, 'preventDefault');
      icon.dispatchEvent(keyDownEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('does not respond to other keys', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Icon name="close" onClick={handleClick} aria-label="Close" />);

      const icon = screen.getByRole('button');
      icon.focus();
      await user.keyboard('{Escape}');

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('shows as screen reader accessible when interactive', () => {
      const handleClick = vi.fn();
      render(<Icon name="close" onClick={handleClick} />);

      const icon = screen.getByRole('button');
      expect(icon).toHaveAttribute('aria-hidden', 'false');
    });
  });

  describe('SVG Props', () => {
    it('forwards additional SVG props', () => {
      render(
        <Icon
          name="send"
          svgProps={
            {
              'data-testid': 'custom-icon',
              style: { transform: 'rotate(45deg)' },
            } as React.SVGAttributes<SVGSVGElement>
          }
        />
      );

      const icon = screen.getByTestId('custom-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveStyle('transform: rotate(45deg)');
    });

    it('preserves default SVG attributes when forwarding props', () => {
      render(
        <Icon
          name="send"
          svgProps={{ 'data-testid': 'custom-icon' } as React.SVGAttributes<SVGSVGElement>}
        />
      );

      const icon = screen.getByTestId('custom-icon');
      expect(icon).toHaveAttribute('fill', 'none');
      expect(icon).toHaveAttribute('stroke', 'currentColor');
      expect(icon).toHaveAttribute('viewBox', '0 0 24 24');
      expect(icon).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    });
  });

  describe('Missing Icon Handling', () => {
    const invalidIconName = 'nonexistent' as IconProps['name'];

    it('renders fallback UI for missing icons', () => {
      render(<Icon name={invalidIconName} />);

      const fallback = screen.getByRole('img');
      expect(fallback).toHaveTextContent('?');
      expect(fallback).toHaveClass('bg-gray-200', 'rounded', 'text-gray-500');
      expect(fallback).toHaveAttribute('title', 'Missing icon: nonexistent');
    });

    it('uses provided aria-label for missing icons', () => {
      render(<Icon name={invalidIconName} aria-label="Custom label" />);

      const fallback = screen.getByRole('img');
      expect(fallback).toHaveAttribute('aria-label', 'Custom label');
    });

    it('provides default aria-label for missing icons', () => {
      render(<Icon name={invalidIconName} />);

      const fallback = screen.getByRole('img');
      expect(fallback).toHaveAttribute('aria-label', 'Missing icon: nonexistent');
    });

    it('applies size classes to missing icon fallback', () => {
      render(<Icon name={invalidIconName} size="lg" />);

      const fallback = screen.getByRole('img');
      expect(fallback).toHaveClass('w-6', 'h-6');
    });

    it('applies custom className to missing icon fallback', () => {
      render(<Icon name={invalidIconName} className="custom-fallback" />);

      const fallback = screen.getByRole('img');
      expect(fallback).toHaveClass('custom-fallback');
    });

    it('logs warning in development for missing icons', () => {
      // Temporarily set NODE_ENV to development
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(<Icon name={invalidIconName} />);

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Icon "nonexistent" not found')
      );
      expect(mockConsoleWarn).toHaveBeenCalledWith(expect.stringContaining('Available icons:'));

      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });

    it('does not log warning in production for missing icons', () => {
      // Temporarily set NODE_ENV to production
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(<Icon name={invalidIconName} />);

      expect(mockConsoleWarn).not.toHaveBeenCalled();

      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Complex Scenarios', () => {
    it('combines multiple props correctly', () => {
      const handleClick = vi.fn();

      render(
        <Icon
          name="delete"
          size="lg"
          color="error"
          className="hover:scale-110"
          onClick={handleClick}
          aria-label="Delete item"
          svgProps={{ 'data-testid': 'delete-icon' } as React.SVGAttributes<SVGSVGElement>}
        />
      );

      const icon = screen.getByTestId('delete-icon');

      expect(icon).toHaveClass('w-6', 'h-6');
      expect(icon).toHaveClass('text-red-600', 'dark:text-red-400');
      expect(icon).toHaveClass('hover:scale-110');
      expect(icon).toHaveClass('cursor-pointer');
      expect(icon).toHaveAttribute('role', 'button');
      expect(icon.tabIndex).toBe(0);
      expect(icon).toHaveAttribute('aria-label', 'Delete item');
      expect(icon).toHaveAttribute('aria-hidden', 'false');
    });

    it('handles edge case with empty className', () => {
      const { container } = render(<Icon name="send" className="" />);

      const icon = getIcon(container);
      expect(icon).toBeInTheDocument();
      // Should not have any empty class artifacts
      const className = icon.getAttribute('class') || '';
      expect(className.trim()).not.toMatch(/^\s|\s$/);
    });

    it('handles undefined svgProps gracefully', () => {
      const { container } = render(<Icon name="send" svgProps={undefined} />);

      const icon = getIcon(container);
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('fill', 'none');
    });
  });

  describe('Event Handling Edge Cases', () => {
    it('handles click events with proper event object', () => {
      const handleClick = vi.fn();
      render(<Icon name="send" onClick={handleClick} />);

      const icon = screen.getByRole('button');
      fireEvent.click(icon);

      expect(handleClick).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'click',
          target: icon,
        })
      );
    });

    it('handles keyboard events with proper event object', () => {
      const handleClick = vi.fn();
      render(<Icon name="send" onClick={handleClick} />);

      const icon = screen.getByRole('button');
      fireEvent.keyDown(icon, { key: 'Enter' });

      expect(handleClick).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'keydown',
          key: 'Enter',
        })
      );
    });
  });
});
