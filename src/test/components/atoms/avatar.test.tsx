import '@testing-library/jest-dom';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Avatar, AvatarData } from '../../../components/atoms/avatar.tsx';

describe('Avatar Component', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<Avatar alt="John Doe" />);

      const avatar = screen.getByRole('img');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('title', 'John Doe');
      expect(avatar).toHaveAttribute('aria-label', 'John Doe');
    });

    it('renders with medium size by default', () => {
      render(<Avatar alt="John Doe" />);

      const avatar = screen.getByRole('img');
      expect(avatar).toHaveClass('w-10', 'h-10', 'text-lg');
    });

    it('displays initials when no image is provided', () => {
      render(<Avatar alt="John Doe" />);

      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('Image Handling', () => {
    it('displays image when src is provided', () => {
      render(
        <Avatar
          src="https://example.com/avatar.jpg"
          alt="John Doe"
        />
      );

      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', 'https://example.com/avatar.jpg');
      expect(image).toHaveAttribute('alt', 'John Doe');
      expect(image).toHaveClass('w-full', 'h-full', 'rounded-full', 'object-cover');
    });

    it('falls back to initials when image fails to load', async () => {
      render(
        <Avatar
          src="https://example.com/broken-image.jpg"
          alt="John Doe"
        />
      );

      const image = screen.getByRole('img');

      // Simulate image load error
      fireEvent.error(image);

      await waitFor(() => {
        expect(screen.getByText('JD')).toBeInTheDocument();
      });
    });

    it('resets error state when src changes', async () => {
      const { rerender } = render(
        <Avatar
          src="https://example.com/broken-image.jpg"
          alt="John Doe"
        />
      );

      const image = screen.getByRole('img');
      fireEvent.error(image);

      await waitFor(() => {
        expect(screen.getByText('JD')).toBeInTheDocument();
      });

      // Change src - should attempt to load image again
      rerender(
        <Avatar
          src="https://example.com/new-image.jpg"
          alt="John Doe"
        />
      );

      const newImage = screen.getByRole('img');
      expect(newImage).toHaveAttribute('src', 'https://example.com/new-image.jpg');
    });

    it('includes loading="lazy" attribute on images', () => {
      render(
        <Avatar
          src="https://example.com/avatar.jpg"
          alt="John Doe"
        />
      );

      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('loading', 'lazy');
    });
  });

  describe('Size Variants', () => {
    const sizes = [
      { size: 'sm' as const, classes: ['w-8', 'h-8', 'text-sm'] },
      { size: 'md' as const, classes: ['w-10', 'h-10', 'text-lg'] },
      { size: 'lg' as const, classes: ['w-12', 'h-12', 'text-xl'] },
      { size: 'xl' as const, classes: ['w-16', 'h-16', 'text-2xl'] },
    ];

    for (const { size, classes } of sizes) {
      it(`renders ${size} size correctly`, () => {
        render(<Avatar alt="John Doe" size={size} />);

        const avatar = screen.getByRole('img');
        for (const className of classes) {
          expect(avatar).toHaveClass(className);
        }
      });
    }
  });

  describe('Initials Generation', () => {
    it('generates initials from first two words', () => {
      render(<Avatar alt="John Michael Doe" />);
      expect(screen.getByText('JM')).toBeInTheDocument();
    });

    it('uses first two characters for single word', () => {
      render(<Avatar alt="John" />);
      expect(screen.getByText('JO')).toBeInTheDocument();
    });

    it('uses custom initials when provided', () => {
      render(<Avatar alt="John Doe" initials="XY" />);
      expect(screen.getByText('XY')).toBeInTheDocument();
    });

    it('handles empty alt text gracefully', () => {
      render(<Avatar alt="" />);
      expect(screen.getByText('??')).toBeInTheDocument();
    });

    it('handles whitespace-only alt text', () => {
      render(<Avatar alt="   " />);
      expect(screen.getByText('??')).toBeInTheDocument();
    });

    it('handles single character names', () => {
      render(<Avatar alt="J" />);
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('converts initials to uppercase', () => {
      render(<Avatar alt="john doe" />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('handles names with extra whitespace', () => {
      render(<Avatar alt="  John   Doe  " />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('Color Generation', () => {
    it('applies custom color when provided', () => {
      render(<Avatar alt="John Doe" color="bg-purple-500" />);

      const avatar = screen.getByRole('img');
      expect(avatar).toHaveClass('bg-purple-500');
    });

    it('generates deterministic color from alt text', () => {
      render(<Avatar alt="John Doe" />);

      const avatar = screen.getByRole('img');
      // Should have one of the predefined color classes
      const colorClasses = [
        'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500',
        'bg-red-500', 'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500',
        'bg-teal-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-violet-500',
        'bg-amber-500', 'bg-rose-500', 'bg-fuchsia-500', 'bg-sky-500'
      ];

      const hasColorClass = colorClasses.some(colorClass =>
        avatar.classList.contains(colorClass)
      );
      expect(hasColorClass).toBe(true);
    });

    it('generates same color for same alt text', () => {
      const { rerender } = render(<Avatar alt="John Doe" />);
      const avatar1 = screen.getByRole('img');
      const classList1 = [...avatar1.classList];

      rerender(<Avatar alt="John Doe" />);
      const avatar2 = screen.getByRole('img');
      const classList2 = [...avatar2.classList];

      expect(classList1).toEqual(classList2);
    });

    it('falls back to default when alt is undefined', () => {
      render(<Avatar />);

      const avatar = screen.getByRole('img');
      expect(avatar).toHaveClass('bg-purple-500');
    });
  });

  describe('Click Interaction', () => {
    it('becomes clickable when onClick is provided', () => {
      const handleClick = vi.fn();
      render(<Avatar alt="John Doe" onClick={handleClick} />);

      const avatar = screen.getByRole('button');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveClass('cursor-pointer');
      expect(avatar).toHaveAttribute('tabIndex', '0');
    });

    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Avatar alt="John Doe" onClick={handleClick} />);

      const avatar = screen.getByRole('button');
      await user.click(avatar);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick when Enter key is pressed', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Avatar alt="John Doe" onClick={handleClick} />);

      const avatar = screen.getByRole('button');
      avatar.focus();
      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick when Space key is pressed', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Avatar alt="John Doe" onClick={handleClick} />);

      const avatar = screen.getByRole('button');
      avatar.focus();
      await user.keyboard(' ');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('has hover styles when clickable', () => {
      const handleClick = vi.fn();
      render(<Avatar alt="John Doe" onClick={handleClick} />);

      const avatar = screen.getByRole('button');
      expect(avatar).toHaveClass('hover:opacity-80', 'transition-opacity');
    });

    it('has focus styles when clickable', () => {
      const handleClick = vi.fn();
      render(<Avatar alt="John Doe" onClick={handleClick} />);

      const avatar = screen.getByRole('button');
      expect(avatar).toHaveClass(
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-offset-2',
        'focus:ring-blue-500'
      );
    });

    it('does not have interactive styles when not clickable', () => {
      render(<Avatar alt="John Doe" />);

      const avatar = screen.getByRole('img');
      expect(avatar).not.toHaveClass('cursor-pointer');
      expect(avatar).not.toHaveAttribute('tabIndex');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes for non-clickable avatar', () => {
      render(<Avatar alt="John Doe" />);

      const avatar = screen.getByRole('img');
      expect(avatar).toHaveAttribute('aria-label', 'John Doe');
      expect(avatar).toHaveAttribute('title', 'John Doe');
    });

    it('has proper ARIA attributes for clickable avatar', () => {
      const handleClick = vi.fn();
      render(<Avatar alt="John Doe" onClick={handleClick} />);

      const avatar = screen.getByRole('button');
      expect(avatar).toHaveAttribute('aria-label', 'John Doe');
      expect(avatar).toHaveAttribute('title', 'John Doe');
    });

    it('hides initials from screen readers', () => {
      render(<Avatar alt="John Doe" />);

      const initials = screen.getByText('JD');
      expect(initials).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('AvatarData Interface', () => {
    it('works with AvatarData object properties', () => {
      const avatarData: AvatarData = {
        displayName: 'Jane Smith',
        src: 'https://example.com/jane.jpg',
        color: 'bg-pink-500',
        initials: 'JS'
      };

      render(
        <Avatar
          alt={avatarData.displayName}
          src={avatarData.src}
          color={avatarData.color}
          initials={avatarData.initials}
        />
      );

      const avatar = screen.getByTestId('avatar-component');
      expect(avatar).toHaveClass('bg-pink-500');
      expect(avatar).toHaveAttribute('title', avatarData.displayName);
      expect(avatar).toHaveAttribute('aria-label', avatarData.displayName);

      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', avatarData.src);
      expect(image).toHaveAttribute('alt', avatarData.displayName);
    });

    it('falls back gracefully when optional AvatarData properties are missing', () => {
      const avatarData: AvatarData = {
        displayName: 'Jane Smith'
      };

      render(
        <Avatar
          alt={avatarData.displayName}
          src={avatarData.src}
          color={avatarData.color}
          initials={avatarData.initials}
        />
      );

      // Should display initials since no src
      expect(screen.getByText('JS')).toBeInTheDocument();

      // Should have generated color
      const avatar = screen.getByRole('img');
      const hasGeneratedColor = [...avatar.classList].some(cls =>
        cls.startsWith('bg-') && cls !== 'bg-gray-500'
      );
      expect(hasGeneratedColor).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles very long names gracefully', () => {
      render(<Avatar alt="Christopher Alexander Montgomery Richardson" />);
      expect(screen.getByText('CA')).toBeInTheDocument();
    });

    it('handles names with special characters', () => {
      render(<Avatar alt="José María" />);
      expect(screen.getByText('JM')).toBeInTheDocument();
    });

    it('handles names with numbers', () => {
      render(<Avatar alt="User 123" />);
      expect(screen.getByText('US')).toBeInTheDocument();
    });

    it('handles emoji in names', () => {
      render(<Avatar alt="John 🎉 Doe" />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });
});
