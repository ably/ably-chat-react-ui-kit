import '@testing-library/jest-dom';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { Tooltip } from '../../../components/atoms/tooltip.tsx';

describe('Tooltip (Simplified)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('renders trigger element when tooltip is closed', () => {
      render(
        <Tooltip title="Tooltip content">
          <button>Hover me</button>
        </Tooltip>
      );

      expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('renders custom content in tooltip', async () => {
      render(
        <Tooltip title={<div data-testid="custom-content">Custom content</div>}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button', { name: 'Hover me' });
      fireEvent.mouseEnter(trigger);

      // Fast-forward past the enter delay
      vi.advanceTimersByTime(200);

      await waitFor(() => {
        expect(screen.getByTestId('custom-content')).toBeInTheDocument();
      });
    });

    it('returns children unchanged when no title provided', () => {
      render(
        <Tooltip title="">
          <button data-testid="button">No tooltip</button>
        </Tooltip>
      );

      const button = screen.getByTestId('button');
      expect(button).toBeInTheDocument();

      fireEvent.mouseEnter(button);
      vi.advanceTimersByTime(200);

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('returns children unchanged when null title provided', () => {
      render(
        <Tooltip title={null as any}>
          <button data-testid="button">No tooltip</button>
        </Tooltip>
      );

      const button = screen.getByTestId('button');
      expect(button).toBeInTheDocument();

      fireEvent.mouseEnter(button);
      vi.advanceTimersByTime(200);

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Hover and Focus Triggers', () => {
    it('shows tooltip on mouse enter', async () => {
      render(
        <Tooltip title="Hover tooltip">
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      vi.advanceTimersByTime(200);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        expect(screen.getByText('Hover tooltip')).toBeInTheDocument();
      });
    });

    it('hides tooltip on mouse leave immediately', async () => {
      render(
        <Tooltip title="Hover tooltip">
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');

      // Show tooltip
      fireEvent.mouseEnter(trigger);
      vi.advanceTimersByTime(200);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      // Hide tooltip immediately (no leave delay)
      fireEvent.mouseLeave(trigger);
      vi.advanceTimersByTime(0);

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('shows tooltip on focus', async () => {
      render(
        <Tooltip title="Focus tooltip">
          <button>Focus me</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.focus(trigger);

      vi.advanceTimersByTime(200);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('hides tooltip on blur immediately', async () => {
      render(
        <Tooltip title="Focus tooltip">
          <button>Focus me</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');

      // Show tooltip
      fireEvent.focus(trigger);
      vi.advanceTimersByTime(200);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      // Hide tooltip immediately
      fireEvent.blur(trigger);
      vi.advanceTimersByTime(0);

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });
  });

  describe('Fixed Delay Behavior', () => {
    it('uses fixed 200ms enter delay', async () => {
      render(
        <Tooltip title="Delayed tooltip">
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      // Should not show before 200ms
      vi.advanceTimersByTime(100);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      // Should show after 200ms
      vi.advanceTimersByTime(100);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('has no leave delay (immediate hide)', async () => {
      render(
        <Tooltip title="No leave delay">
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');

      // Show tooltip
      fireEvent.mouseEnter(trigger);
      vi.advanceTimersByTime(200);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      // Should hide immediately without delay
      fireEvent.mouseLeave(trigger);
      vi.advanceTimersByTime(0);

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });
  });

  describe('Disabled State', () => {
    it('does not show tooltip when disabled', () => {
      render(
        <Tooltip title="Disabled tooltip" disabled>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);
      vi.advanceTimersByTime(200);

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('does not show tooltip on focus when disabled', () => {
      render(
        <Tooltip title="Disabled tooltip" disabled>
          <button>Focus me</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.focus(trigger);
      vi.advanceTimersByTime(200);

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Position Prop', () => {
    it('accepts above position', async () => {
      render(
        <Tooltip title="Above tooltip" position="above">
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);
      vi.advanceTimersByTime(200);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('accepts below position', async () => {
      render(
        <Tooltip title="Below tooltip" position="below">
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);
      vi.advanceTimersByTime(200);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('defaults to auto position', async () => {
      render(
        <Tooltip title="Auto tooltip">
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);
      vi.advanceTimersByTime(200);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });
  });

  describe('Fixed Styling', () => {
    it('applies fixed BEM classes', async () => {
      render(
        <Tooltip title="Fixed styling">
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);
      vi.advanceTimersByTime(200);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveClass('ably-tooltip');
        expect(tooltip).toHaveClass('ably-tooltip--md'); // Fixed medium size
        expect(tooltip).toHaveClass('ably-tooltip--wrap'); // Fixed wrap
        expect(tooltip).toHaveClass('ably-tooltip--max-w-xs'); // Fixed max width
      });
    });

    it('applies custom className alongside fixed classes', async () => {
      render(
        <Tooltip title="Custom styled" className="my-custom-class">
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);
      vi.advanceTimersByTime(200);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveClass('my-custom-class');
        expect(tooltip).toHaveClass('ably-tooltip');
        expect(tooltip).toHaveClass('ably-tooltip--md');
      });
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', async () => {
      render(
        <Tooltip title="Accessible tooltip">
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');

      // Initially no aria-describedby
      expect(trigger).not.toHaveAttribute('aria-describedby');

      fireEvent.mouseEnter(trigger);
      vi.advanceTimersByTime(200);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
        expect(trigger).toHaveAttribute('aria-describedby');

        const tooltipId = trigger.getAttribute('aria-describedby');
        expect(tooltip).toHaveAttribute('id', tooltipId);
      });
    });

    it('tooltip has proper role attribute', async () => {
      render(
        <Tooltip title="Accessible tooltip">
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);
      vi.advanceTimersByTime(200);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveAttribute('role', 'tooltip');
      });
    });

    it('removes aria-describedby when tooltip is hidden', async () => {
      render(
        <Tooltip title="ARIA tooltip">
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');

      // Show tooltip
      fireEvent.mouseEnter(trigger);
      vi.advanceTimersByTime(200);

      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-describedby');
      });

      // Hide tooltip
      fireEvent.mouseLeave(trigger);
      vi.advanceTimersByTime(0);

      await waitFor(() => {
        expect(trigger).not.toHaveAttribute('aria-describedby');
      });
    });
  });

  describe('Event Handling', () => {
    it('preserves existing event handlers on child', async () => {
      const handleClick = vi.fn();
      const handleMouseEnter = vi.fn();
      const handleMouseLeave = vi.fn();
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();

      render(
        <Tooltip title="Preserved events">
          <button
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            Interactive button
          </button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');

      // Test all preserved events
      fireEvent.click(trigger);
      expect(handleClick).toHaveBeenCalledTimes(1);

      fireEvent.mouseEnter(trigger);
      expect(handleMouseEnter).toHaveBeenCalledTimes(1);

      fireEvent.mouseLeave(trigger);
      expect(handleMouseLeave).toHaveBeenCalledTimes(1);

      fireEvent.focus(trigger);
      expect(handleFocus).toHaveBeenCalledTimes(1);

      fireEvent.blur(trigger);
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid mouse enter/leave', async () => {
      render(
        <Tooltip title="Rapid hover">
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');

      // Rapid enter/leave/enter
      fireEvent.mouseEnter(trigger);
      fireEvent.mouseLeave(trigger);
      fireEvent.mouseEnter(trigger);

      vi.advanceTimersByTime(200);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('handles rapid focus/blur', async () => {
      render(
        <Tooltip title="Rapid focus">
          <button>Focus me</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');

      // Rapid focus/blur/focus
      fireEvent.focus(trigger);
      fireEvent.blur(trigger);
      fireEvent.focus(trigger);

      vi.advanceTimersByTime(200);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('clears timeouts properly on unmount', () => {
      const { unmount } = render(
        <Tooltip title="Unmount test">
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      // Unmount before timeout completes
      unmount();

      // Should not throw or cause issues
      vi.advanceTimersByTime(200);
    });

    it('handles single child requirement', () => {
      // Test that tooltip only works with single child
      const { container } = render(
        <Tooltip title="Single child only">
          <button>Only child</button>
        </Tooltip>
      );

      expect(container.querySelector('button')).toBeInTheDocument();
    });
  });
});
