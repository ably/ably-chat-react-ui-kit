import React, { useEffect, useState } from 'react';

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
 * @returns A Tailwind CSS color class
 */
const getRandomColor = (text: string): string => {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-red-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-yellow-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-emerald-500',
    'bg-violet-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-fuchsia-500',
    'bg-sky-500',
  ];

  // Generate a deterministic hash from the text
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + (text.codePointAt(i) ?? 0)) & 0xFFFFFFFF;
  }

  const colorIndex = Math.abs(hash) % colors.length;
  return colors[colorIndex] || 'bg-gray-500';
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
   * Uses Tailwind CSS color classes (e.g., 'bg-blue-500')
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
 * <Avatar alt="John Doe" color="bg-purple-500" size="lg" />
 *
 * @example
 * // Using AvatarData object
 * const avatarData = { displayName: "John Doe", src: "https://example.com/avatar.jpg" };
 * <Avatar alt={avatarData.displayName} src={avatarData.src} color={avatarData.color} initials={avatarData.initials} />
 */
export const Avatar = ({ src, alt, color, size = 'md', initials, onClick }: AvatarProps) => {
  const [imgError, setImgError] = useState(false);

  // Reset image error state if src changes
  useEffect(() => {
    setImgError(false);
  }, [src]);

  // TODO: Extract to separate hook - useAvatarSizing
  // Size classes mapping
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-lg',
    lg: 'w-12 h-12 text-xl',
    xl: 'w-16 h-16 text-2xl',
  };

  // Use provided color or generate one based on alt text
  const avatarColor = color || getRandomColor(alt ?? 'default');

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

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-medium ${avatarColor} relative ${
        onClick
          ? 'cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          : ''
      }`}
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
      title={alt}
      aria-label={alt}
    >
      {src && !imgError ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full rounded-full object-cover"
          onError={handleImageError}
          loading="lazy"
        />
      ) : (
        <span aria-hidden="true">{getDisplayText()}</span>
      )}
    </div>
  );
};
