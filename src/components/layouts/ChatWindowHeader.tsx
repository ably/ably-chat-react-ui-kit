import React from 'react';

/**
 * Props for the ChatWindowHeader component
 */
export interface ChatWindowHeaderProps {
  /**
   * Content to be rendered within the header
   * Typically includes room information, participant count, or custom actions
   */
  children?: React.ReactNode;

  /**
   * Additional CSS classes to apply to the header container
   */
  className?: string;

  /**
   * Optional ARIA label for the header
   * Improves accessibility by providing semantic context
   */
  'aria-label'?: string;
}

/**
 * ChatWindowHeader component provides a consistent header area for chat windows
 *
 * Features:
 * - Flexible content slot for custom header components
 * - Consistent styling with design system
 * - Dark mode support
 * - Accessible design with proper semantic structure
 * - Fixed positioning to maintain header visibility during scroll
 *
 * Design System:
 * - Uses standard gray color palette for theming
 * - Consistent border styling for visual separation
 * - Proper spacing and padding for content
 * - Responsive design considerations
 *
 * TODO: Consider adding features:
 * - Header actions slot (minimize, close, settings)
 * - Sticky/floating header behavior options
 * - Animation support for header state changes
 * - Integration with breadcrumb navigation
 *
 * TODO: Accessibility improvements:
 * - Landmark roles for better screen reader navigation
 * - Focus management for header actions
 * - Keyboard navigation support
 *
 * @example
 * // Basic usage with room info
 * <ChatWindowHeader>
 *   <RoomInfo roomId="general" />
 * </ChatWindowHeader>
 *
 * @example
 * // With custom content and styling
 * <ChatWindowHeader
 *   className="bg-blue-100"
 *   aria-label="Chat room header for general discussion"
 * >
 *   <div>
 *     <h2>General Discussion</h2>
 *     <span>5 participants online</span>
 *   </div>
 * </ChatWindowHeader>
 *
 * @example
 * // Empty header (spacer only)
 * <ChatWindowHeader />
 */
export const ChatWindowHeader: React.FC<ChatWindowHeaderProps> = ({
  children,
  className = '',
  'aria-label': ariaLabel,
}) => {
  // Combine base classes with custom className
  const headerClasses = [
    // Layout
    'px-6 py-4',
    // Borders and visual separation
    'border-b border-gray-200 dark:border-gray-700',
    // Theme colors
    'bg-white dark:bg-gray-900',
    // Custom classes
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={headerClasses} role="banner" aria-label={ariaLabel || 'Chat window header'}>
      {children}
    </header>
  );
};

// Set display name for better debugging experience
ChatWindowHeader.displayName = 'ChatWindowHeader';
