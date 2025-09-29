import React, { useEffect, useState } from 'react';
import clsx from 'clsx';

/**
 * AvatarData interface defines the structure for avatar data across the application.
 * This standardized format ensures consistent avatar representation.
 *
 * @property src - URL to the avatar image (optional)
 * @property color - Background color for initials fallback (optional, will be generated if not provided)
 * @property initials - Custom initials to display when no image is available (optional, will be generated from displayName)
 * @property displayName - Used for alt text and generating initials (required)
 */
export interface AvatarData {
  src?: string;
  color?: string;
  initials?: string;
  displayName: string;
}

/**
 * Generates a deterministic color based on text
 * @param text - The text to generate a color from
 * @returns A color variant name
 */
const getRandomColor = (text: string): string => {
  const colors = [
    'blue',
    'purple',
    'green',
    'orange',
    'red',
    'pink',
    'indigo',
    'yellow',
    'teal',
    'cyan',
    'emerald',
    'violet',
    'amber',
    'rose',
    'fuchsia',
    'sky',
  ];

  // Generate a deterministic hash from the text
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + (text.codePointAt(i) ?? 0)) & 0xffffffff;
  }

  const colorIndex = Math.abs(hash) % colors.length;
  return colors[colorIndex] || 'gray';
};

/**
 * Maps old Tailwind color classes to new color variant names
 */
const mapColorClass = (colorClass: string | undefined): string | undefined => {
  if (!colorClass) return undefined;

  // Extract color name from bg-{color}-500 pattern
  const match = colorClass.match(/^bg-(\w+)-\d+$/);
  if (match && match[1]) {
    return match[1];
  }

  // If it's already a simple color name, return it
  if (!colorClass.startsWith('bg-')) {
    return colorClass;
  }

  return undefined;
};

/**
 * Recommended image dimensions: 256x256 pixels
 * Supported formats: JPG, PNG, WebP, SVG
 * Maximum file size: 5MB
 */
export interface AvatarProps {
  /**
   * URL to the avatar image
   */
  src?: string;

  /**
   * Alternative text for the avatar image, also used for generating initials if needed
   */
  alt?: string;

  /**
   * Background color for the avatar when no image is provided
   * Can be either a Tailwind CSS color class (e.g., 'bg-blue-500') for backward compatibility
   * or a color name (e.g., 'blue')
   * If not provided, a color will be generated based on the alt text
   */
  color?: string;

  /**
   * Size of the avatar
   * - sm: 32px (2rem)
   * - md: 40px (2.5rem) - default
   * - lg: 48px (3rem)
   * - xl: 64px (4rem)
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Custom initials to display when no image is available
   * If not provided, initials will be generated from the alt text
   */
  initials?: string;

  /**
   * Click handler for the avatar, e.g for editing or viewing profiles
   */
  onClick?: () => void;

  /**
   * Additional CSS classes for customization
   */
  className?: string;
}

/**
 * Avatar component displays a user or room avatar with fallback to initials
 *
 * TODO: Consider breaking this component into smaller subcomponents:
 * - AvatarImage: Handles image loading and error states
 * - AvatarInitials: Handles initials generation and display
 * - AvatarContainer: Handles sizing and common styling
 *
 * TODO:
 * - Status indicators (online/offline/away)
 * - Avatar groups/stacks for multiple users
 * - Upload functionality for editable avatars
 * - Image optimization and lazy loading
 *
 * @example
 * // Basic usage
 * <Avatar alt="John Doe" />
 *
 * @example
 * // With image
 * <Avatar src="https://example.com/avatar.jpg" alt="John Doe" />
 *
 * @example
 * // With custom color and size
 * <Avatar alt="John Doe" color="purple" size="lg" />
 *
 * @example
 * // Using AvatarData object
 * const avatarData = { displayName: "John Doe", src: "https://example.com/avatar.jpg" };
 * <Avatar alt={avatarData.displayName} src={avatarData.src} color={avatarData.color} initials={avatarData.initials} />
 */
export const Avatar = ({
  src,
  alt,
  color,
  size = 'md',
  initials,
  onClick,
  className,
}: AvatarProps) => {
  const [imgError, setImgError] = useState(false);

  // Reset image error state if src changes
  useEffect(() => {
    setImgError(false);
  }, [src]);

  // Map color prop to color variant (supporting both old and new format)
  const colorVariant = mapColorClass(color) || getRandomColor(alt ?? 'default');

  // TODO: Extract to separate utility - generateInitials
  /**
   * Generates display text (initials) for the avatar
   * @returns Up to 2 characters of initials
   */
  const getDisplayText = () => {
    // Use provided initials if available
    if (initials) return initials;

    // Fallback to generating initials from alt text
    if (!alt || alt.trim() === '') return '??'; // Handle empty or whitespace-only alt text

    const words = alt
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0)
      .filter((word) => /^[a-zA-Z]/.test(word));

    if (words.length >= 2 && words[0] && words[1]) {
      const firstChar = words[0][0];
      const secondChar = words[1][0];
      if (firstChar && secondChar) {
        return (firstChar + secondChar).toUpperCase();
      }
    }

    if (words.length === 1 && words[0] && words[0].length >= 2) {
      return words[0].slice(0, 2).toUpperCase();
    }

    // Final fallback using the original alt text
    return alt.slice(0, 2).toUpperCase();
  };

  // Handle image loading error
  const handleImageError = () => {
    setImgError(true);
  };

  // Determine if we're showing an image or initials
  const showingImage = src && !imgError;

  const avatarClasses = clsx(
    'ably-avatar',
    `ably-avatar--${size}`,
    `ably-avatar--${colorVariant}`,
    {
      'ably-avatar--clickable': onClick,
    },
    className
  );

  return (
    <div
      className={avatarClasses}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      data-testid="avatar-component"
      role={onClick ? 'button' : showingImage ? undefined : 'img'}
      tabIndex={onClick ? 0 : undefined}
      aria-label={alt}
    >
      {src && !imgError ? (
        <img
          src={src}
          alt={alt}
          className="ably-avatar__image"
          onError={handleImageError}
          loading="lazy"
        />
      ) : (
        <span aria-hidden="true">{getDisplayText()}</span>
      )}
    </div>
  );
};
