import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TypingDots } from '../../../components/atoms/typing-dots.tsx';

// Mock matchMedia for reduced motion tests
const mockMatchMedia = vi.fn();

describe('TypingDots', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    // Default to no reduced motion preference
    mockMatchMedia.mockReturnValue({
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('renders with default props', () => {
      render(<TypingDots data-testid="typing-dots" />);

      const container = screen.getByTestId('typing-dots');
      expect(container).toBeInTheDocument();
    });

    it('renders three dots', () => {
      render(<TypingDots data-testid="typing-dots" />);

      const container = screen.getByTestId('typing-dots');
      const dots = container.querySelectorAll('[aria-hidden="true"]');
      expect(dots).toHaveLength(3);
    });

    it('applies default classes to container', () => {
      render(<TypingDots data-testid="typing-dots" />);

      const container = screen.getByTestId('typing-dots');
      expect(container).toHaveClass('flex', 'gap-0.5');
    });

    it('applies default classes to dots', () => {
      render(<TypingDots data-testid="typing-dots" />);

      const container = screen.getByTestId('typing-dots');
      const dots = container.querySelectorAll('[aria-hidden="true"]');

      for (const dot of dots) {
        expect(dot).toHaveClass('w-1.5', 'h-1.5', 'rounded-full', 'animate-bounce', 'bg-current');
      }
    });
  });

  describe('Custom sizing', () => {
    it('applies custom dot size classes', () => {
      render(<TypingDots dotSizeClassName="w-3 h-3" data-testid="typing-dots" />);

      const container = screen.getByTestId('typing-dots');
      const dots = container.querySelectorAll('[aria-hidden="true"]');

      for (const dot of dots) {
        expect(dot).toHaveClass('w-3', 'h-3');
        expect(dot).not.toHaveClass('w-1.5', 'h-1.5');
      }
    });

    it('applies small dot size', () => {
      render(<TypingDots dotSizeClassName="w-1 h-1" data-testid="typing-dots" />);

      const container = screen.getByTestId('typing-dots');
      const dots = container.querySelectorAll('[aria-hidden="true"]');

      for (const dot of dots) {
        expect(dot).toHaveClass('w-1', 'h-1');
      }
    });

    it('applies large dot size', () => {
      render(<TypingDots dotSizeClassName="w-4 h-4" data-testid="typing-dots" />);

      const container = screen.getByTestId('typing-dots');
      const dots = container.querySelectorAll('[aria-hidden="true"]');

      for (const dot of dots) {
        expect(dot).toHaveClass('w-4', 'h-4');
      }
    });
  });

  describe('Custom styling', () => {
    it('applies custom container className', () => {
      render(<TypingDots className="custom-container gap-2" data-testid="typing-dots" />);

      const container = screen.getByTestId('typing-dots');
      expect(container).toHaveClass('flex', 'gap-0.5', 'custom-container', 'gap-2');
    });

    it('applies custom dot className', () => {
      render(<TypingDots dotClassName="custom-dot opacity-75" data-testid="typing-dots" />);

      const container = screen.getByTestId('typing-dots');
      const dots = container.querySelectorAll('[aria-hidden="true"]');

      for (const dot of dots) {
        expect(dot).toHaveClass('custom-dot', 'opacity-75');
      }
    });

    it('applies custom dot color', () => {
      render(<TypingDots dotColor="bg-blue-500" data-testid="typing-dots" />);

      const container = screen.getByTestId('typing-dots');
      const dots = container.querySelectorAll('[aria-hidden="true"]');

      for (const dot of dots) {
        expect(dot).toHaveClass('bg-blue-500');
        expect(dot).not.toHaveClass('bg-current');
      }
    });

    it('combines custom classes correctly', () => {
      render(
        <TypingDots
          className="custom-gap gap-3"
          dotClassName="custom-dot"
          dotSizeClassName="w-2 h-2"
          dotColor="bg-red-400"
          data-testid="typing-dots"
        />
      );

      const container = screen.getByTestId('typing-dots');
      expect(container).toHaveClass('flex', 'gap-0.5', 'custom-gap', 'gap-3');

      const dots = container.querySelectorAll('[aria-hidden="true"]');
      for (const dot of dots) {
        expect(dot).toHaveClass(
          'w-2',
          'h-2',
          'rounded-full',
          'animate-bounce',
          'bg-red-400',
          'custom-dot'
        );
      }
    });
  });

  describe('Animation configuration', () => {
    it('applies default animation duration', () => {
      render(<TypingDots data-testid="typing-dots" />);

      const container = screen.getByTestId('typing-dots');
      const dots = container.querySelectorAll('[aria-hidden="true"]');

      for (const dot of dots) {
        expect(dot).toHaveStyle({ animationDuration: '1s' });
      }
    });

    it('applies custom animation duration', () => {
      render(<TypingDots animationDuration="0.5s" data-testid="typing-dots" />);

      const container = screen.getByTestId('typing-dots');
      const dots = container.querySelectorAll('[aria-hidden="true"]');

      for (const dot of dots) {
        expect(dot).toHaveStyle({ animationDuration: '0.5s' });
      }
    });

    it('applies correct animation delays to create wave effect', () => {
      render(<TypingDots data-testid="typing-dots" />);

      const container = screen.getByTestId('typing-dots');
      const dots = container.querySelectorAll('[aria-hidden="true"]');

      expect(dots[0]).toHaveStyle({ animationDelay: '0ms' });
      expect(dots[1]).toHaveStyle({ animationDelay: '200ms' });
      expect(dots[2]).toHaveStyle({ animationDelay: '400ms' });
    });

    it('preserves animation delays with custom duration', () => {
      render(<TypingDots animationDuration="2s" data-testid="typing-dots" />);

      const container = screen.getByTestId('typing-dots');
      const dots = container.querySelectorAll('[aria-hidden="true"]');

      expect(dots[0]).toHaveStyle({
        animationDelay: '0ms',
        animationDuration: '2s',
      });
      expect(dots[1]).toHaveStyle({
        animationDelay: '200ms',
        animationDuration: '2s',
      });
      expect(dots[2]).toHaveStyle({
        animationDelay: '400ms',
        animationDuration: '2s',
      });
    });
  });

  describe('Reduced motion support', () => {
    it('disables animation when user prefers reduced motion', () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
        addListener: vi.fn(),
        removeListener: vi.fn(),
      });

      render(<TypingDots data-testid="typing-dots" />);

      const container = screen.getByTestId('typing-dots');
      const dots = container.querySelectorAll('[aria-hidden="true"]');

      for (const dot of dots) {
        expect(dot).toHaveStyle({
          animation: 'none',
          opacity: '0.7',
        });
      }
    });

    it('maintains animation when reduced motion is not preferred', () => {
      mockMatchMedia.mockReturnValue({
        matches: false,
        addListener: vi.fn(),
        removeListener: vi.fn(),
      });

      render(<TypingDots data-testid="typing-dots" />);

      const container = screen.getByTestId('typing-dots');
      const dots = container.querySelectorAll('[aria-hidden="true"]');

      for (const dot of dots) {
        expect(dot).not.toHaveStyle({ animation: 'none' });
        expect(dot).not.toHaveStyle({ opacity: '0.7' });
      }
    });
  });

  describe('Accessibility', () => {
    it('does not have ARIA by default', () => {
      render(<TypingDots data-testid="typing-dots" />);

      const container = screen.getByTestId('typing-dots');
      expect(container).not.toHaveAttribute('role');
      expect(container).not.toHaveAttribute('aria-label');
      expect(container).not.toHaveAttribute('aria-live');
    });

    it('accepts aria-hidden attribute when passed as prop', () => {
      render(<TypingDots aria-hidden="true" data-testid="typing-dots" />);

      const container = screen.getByTestId('typing-dots');
      expect(container).toHaveAttribute('aria-hidden', 'true');
    });

    it('marks individual dots as decorative', () => {
      render(<TypingDots data-testid="typing-dots" />);

      const container = screen.getByTestId('typing-dots');
      const dots = container.querySelectorAll('[aria-hidden="true"]');

      expect(dots).toHaveLength(3);
      for (const dot of dots) {
        expect(dot).toHaveAttribute('aria-hidden', 'true');
      }
    });
  });

  describe('HTML attributes passthrough', () => {
    it('passes through additional HTML attributes', () => {
      render(<TypingDots data-testid="custom-typing-dots" title="Loading indicator" />);

      const container = screen.getByTestId('custom-typing-dots');
      expect(container).toHaveAttribute('title', 'Loading indicator');
    });

    it('excludes component-specific props from DOM', () => {
      render(
        <TypingDots
          dotSizeClassName="w-2 h-2"
          dotClassName="custom-dot"
          animationDuration="0.8s"
          dotColor="bg-green-500"
          data-testid="typing-dots"
        />
      );

      const container = screen.getByTestId('typing-dots');
      expect(container).not.toHaveAttribute('dotSizeClassName');
      expect(container).not.toHaveAttribute('dotClassName');
      expect(container).not.toHaveAttribute('animationDuration');
      expect(container).not.toHaveAttribute('dotColor');
    });
  });

  describe('Applies custom props', () => {
    it('renders correctly with all custom props', () => {
      render(
        <TypingDots
          dotSizeClassName="w-3 h-3"
          className="gap-2 p-2"
          dotClassName="opacity-80"
          animationDuration="1.5s"
          dotColor="bg-purple-600"
          aria-hidden="true"
          data-testid="fully-customized"
        />
      );

      const container = screen.getByTestId('fully-customized');
      expect(container).toHaveClass('flex', 'gap-0.5', 'gap-2', 'p-2');
      expect(container).toHaveAttribute('aria-hidden', 'true');

      const dots = container.querySelectorAll('[aria-hidden="true"]');
      expect(dots).toHaveLength(3);

      for (const [index, dot] of dots.entries()) {
        expect(dot).toHaveClass(
          'w-3',
          'h-3',
          'rounded-full',
          'animate-bounce',
          'bg-purple-600',
          'opacity-80'
        );
        expect(dot).toHaveStyle({
          animationDuration: '1.5s',
          animationDelay: ['0ms', '200ms', '400ms'][index],
        });
      }
    });

    it('handles empty className gracefully', () => {
      render(<TypingDots className="" data-testid="typing-dots" />);

      const container = screen.getByTestId('typing-dots');
      expect(container).toHaveClass('flex', 'gap-0.5');
    });

    it('handles undefined className gracefully', () => {
      render(<TypingDots className={undefined} data-testid="typing-dots" />);

      const container = screen.getByTestId('typing-dots');
      expect(container).toHaveClass('flex', 'gap-0.5');
    });
  });

  describe('Default values verification', () => {
    it('uses all default values when no props provided', () => {
      render(<TypingDots data-testid="typing-dots" />);

      const container = screen.getByTestId('typing-dots');
      expect(container).toHaveClass('flex', 'gap-0.5');
      expect(container).not.toHaveAttribute('aria-label');
      expect(container).not.toHaveAttribute('aria-live');
      expect(container).not.toHaveAttribute('role');

      const dots = container.querySelectorAll('[aria-hidden="true"]');
      expect(dots).toHaveLength(3);

      for (const [index, dot] of dots.entries()) {
        expect(dot).toHaveClass('w-1.5', 'h-1.5', 'rounded-full', 'animate-bounce', 'bg-current');
        expect(dot).toHaveStyle({
          animationDuration: '1s',
          animationDelay: ['0ms', '200ms', '400ms'][index],
        });
        expect(dot).toHaveAttribute('aria-hidden', 'true');
      }
    });
  });
});
