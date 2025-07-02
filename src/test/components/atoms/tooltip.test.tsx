import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Tooltip } from '../../../components/atoms/tooltip.tsx';

describe('Tooltip', () => {
  describe('Basic rendering', () => {
    it('renders with required props', () => {
      render(<Tooltip position="above">Tooltip content</Tooltip>);

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent('Tooltip content');
    });

    it('renders with children as React elements', () => {
      render(
        <Tooltip position="below">
          <div data-testid="custom-content">Custom content</div>
        </Tooltip>
      );

      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
      expect(screen.getByText('Custom content')).toBeInTheDocument();
    });
  });

  describe('Positioning', () => {
    it('applies correct classes for above position', () => {
      render(<Tooltip position="above">Above tooltip</Tooltip>);

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('bottom-full', 'mb-2');
    });

    it('applies correct classes for below position', () => {
      render(<Tooltip position="below">Below tooltip</Tooltip>);

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('top-full', 'mt-2');
    });
  });

  describe('Variants', () => {
    it('applies dark variant classes by default', () => {
      render(<Tooltip position="above">Dark tooltip</Tooltip>);

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('bg-gray-900', 'dark:bg-gray-700', 'text-white');
    });

    it('applies light variant classes', () => {
      render(
        <Tooltip position="above" variant="light">
          Light tooltip
        </Tooltip>
      );

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass(
        'bg-white',
        'dark:bg-gray-100',
        'text-gray-900',
        'dark:text-gray-800',
        'border',
        'border-gray-200',
        'dark:border-gray-300'
      );
    });
  });

  describe('Sizes', () => {
    it('applies small size classes', () => {
      render(
        <Tooltip position="above" size="sm">
          Small tooltip
        </Tooltip>
      );

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('px-2', 'py-1', 'text-xs');
    });

    it('applies medium size classes by default', () => {
      render(<Tooltip position="above">Medium tooltip</Tooltip>);

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('px-3', 'py-2', 'text-sm');
    });

    it('applies large size classes', () => {
      render(
        <Tooltip position="above" size="lg">
          Large tooltip
        </Tooltip>
      );

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('px-4', 'py-3', 'text-base');
    });
  });

  describe('Arrow', () => {
    it('renders arrow by default', () => {
      render(<Tooltip position="above">Tooltip with arrow</Tooltip>);

      const arrow = screen.getByRole('tooltip').querySelector('[aria-hidden="true"]');
      expect(arrow).toBeInTheDocument();
      expect(arrow).toHaveClass('w-0', 'h-0', 'border-transparent');
    });

    it('does not render arrow when showArrow is false', () => {
      render(
        <Tooltip position="above" showArrow={false}>
          Tooltip without arrow
        </Tooltip>
      );

      const arrow = screen.getByRole('tooltip').querySelector('[aria-hidden="true"]');
      expect(arrow).not.toBeInTheDocument();
    });

    it('applies correct arrow classes for above position with dark variant', () => {
      render(
        <Tooltip position="above" variant="dark">
          Tooltip content
        </Tooltip>
      );

      const arrow = screen.getByRole('tooltip').querySelector('[aria-hidden="true"]');
      expect(arrow).toHaveClass(
        'top-full',
        'border-t-gray-900',
        'dark:border-t-gray-700',
        'border-l-4',
        'border-r-4',
        'border-t-4'
      );
    });

    it('applies correct arrow classes for below position with light variant', () => {
      render(
        <Tooltip position="below" variant="light">
          Tooltip content
        </Tooltip>
      );

      const arrow = screen.getByRole('tooltip').querySelector('[aria-hidden="true"]');
      expect(arrow).toHaveClass(
        'bottom-full',
        'border-b-white',
        'dark:border-b-gray-100',
        'border-l-4',
        'border-r-4',
        'border-b-4'
      );
    });

    it('applies correct arrow size for small tooltip', () => {
      render(
        <Tooltip position="above" size="sm">
          Small tooltip
        </Tooltip>
      );

      const arrow = screen.getByRole('tooltip').querySelector('[aria-hidden="true"]');
      expect(arrow).toHaveClass('border-l-2', 'border-r-2', 'border-t-2');
    });

    it('applies correct arrow size for large tooltip', () => {
      render(
        <Tooltip position="above" size="lg">
          Large tooltip
        </Tooltip>
      );

      const arrow = screen.getByRole('tooltip').querySelector('[aria-hidden="true"]');
      expect(arrow).toHaveClass('border-l-6', 'border-r-6', 'border-t-6');
    });
  });

  describe('Text wrapping', () => {
    it('applies wrap classes by default', () => {
      render(<Tooltip position="above">Wrapping tooltip</Tooltip>);

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('whitespace-normal');
    });

    it('applies nowrap classes', () => {
      render(
        <Tooltip position="above" wrap="nowrap">
          No wrap tooltip
        </Tooltip>
      );

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('whitespace-nowrap');
    });

    it('applies truncate classes', () => {
      render(
        <Tooltip position="above" wrap="truncate">
          Truncated tooltip
        </Tooltip>
      );

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('whitespace-nowrap', 'overflow-hidden', 'text-ellipsis');
    });
  });

  describe('Spacing', () => {
    it('applies default spacing', () => {
      render(<Tooltip position="above">Default spacing</Tooltip>);

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('bottom-full', 'mb-2');
    });

    it('applies small spacing', () => {
      render(
        <Tooltip position="above" spacing="sm">
          Small spacing
        </Tooltip>
      );

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('bottom-full', 'mb-1');
    });

    it('applies large spacing', () => {
      render(
        <Tooltip position="below" spacing="lg">
          Large spacing
        </Tooltip>
      );

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('top-full', 'mt-4');
    });

    it('applies no spacing', () => {
      render(
        <Tooltip position="above" spacing="none">
          No spacing
        </Tooltip>
      );

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('bottom-full');
      expect(tooltip).not.toHaveClass('mb-2', 'mb-1', 'mb-4');
    });
  });

  describe('Custom styling', () => {
    it('applies custom maxWidth', () => {
      render(
        <Tooltip position="above" maxWidth="max-w-lg">
          Custom width tooltip
        </Tooltip>
      );

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('max-w-lg');
    });

    it('applies custom zIndex', () => {
      render(
        <Tooltip position="above" zIndex="z-40">
          Custom z-index tooltip
        </Tooltip>
      );

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('z-40');
    });

    it('applies custom className', () => {
      render(
        <Tooltip position="above" className="custom-tooltip">
          Custom class tooltip
        </Tooltip>
      );

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('custom-tooltip');
    });

    it('handles fixed positioning without adding default position classes', () => {
      render(
        <Tooltip position="above" className="fixed top-10 left-10">
          Fixed position tooltip
        </Tooltip>
      );

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('fixed', 'top-10', 'left-10');
      // Should not have default positioning classes when using fixed
      expect(tooltip).not.toHaveClass('absolute', 'left-1/2', 'transform', '-translate-x-1/2');
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes by default', () => {
      render(<Tooltip position="above">Accessible tooltip</Tooltip>);

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveAttribute('role', 'tooltip');
    });

    it('applies custom ARIA attributes', () => {
      render(
        <Tooltip position="above" aria-hidden="true">
          Hidden tooltip
        </Tooltip>
      );

      const tooltip = screen.getByRole('tooltip', { hidden: true });
      expect(tooltip).toHaveAttribute('aria-hidden', 'true');
    });

    it('arrow has aria-hidden attribute', () => {
      render(<Tooltip position="above">Tooltip with arrow</Tooltip>);

      const arrow = screen.getByRole('tooltip').querySelector('[aria-hidden="true"]');
      expect(arrow).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Additional HTML attributes', () => {
    it('passes through additional HTML attributes', () => {
      render(
        <Tooltip position="above" data-testid="custom-tooltip" id="tooltip-1">
          Custom attributes
        </Tooltip>
      );

      const tooltip = screen.getByTestId('custom-tooltip');
      expect(tooltip).toHaveAttribute('id', 'tooltip-1');
    });

    it('excludes component-specific props from DOM', () => {
      render(
        <Tooltip
          position="above"
          maxWidth="max-w-sm"
          wrap="nowrap"
          variant="light"
          size="lg"
          showArrow={false}
          spacing="lg"
          zIndex="z-30"
        >
          Props filtering test
        </Tooltip>
      );

      const tooltip = screen.getByRole('tooltip');
      // These should not appear as DOM attributes
      expect(tooltip).not.toHaveAttribute('maxWidth');
      expect(tooltip).not.toHaveAttribute('wrap');
      expect(tooltip).not.toHaveAttribute('variant');
      expect(tooltip).not.toHaveAttribute('size');
      expect(tooltip).not.toHaveAttribute('showArrow');
      expect(tooltip).not.toHaveAttribute('spacing');
      expect(tooltip).not.toHaveAttribute('zIndex');
    });
  });

  describe('Default values', () => {
    it('uses default values when props are not provided', () => {
      render(<Tooltip position="above">Default values test</Tooltip>);

      const tooltip = screen.getByRole('tooltip');
      // Default maxWidth
      expect(tooltip).toHaveClass('max-w-xs');
      // Default variant (dark)
      expect(tooltip).toHaveClass('bg-gray-900');
      // Default size (md)
      expect(tooltip).toHaveClass('px-3', 'py-2', 'text-sm');
      // Default wrap (wrap)
      expect(tooltip).toHaveClass('whitespace-normal');
      // Default zIndex
      expect(tooltip).toHaveClass('z-50');
      // Default spacing
      expect(tooltip).toHaveClass('mb-2');
      // Arrow should be shown by default
      const arrow = tooltip.querySelector('[aria-hidden="true"]');
      expect(arrow).toBeInTheDocument();
    });
  });
});
