import { clsx } from 'clsx';
import React from 'react';

/**
 * Props for the EmptyState component
 */
export interface EmptyStateProps {
  /**
   * Custom icon element to display above the title.
   * If not provided, no icon will be shown.
   * Should typically be an SVG or Icon component with appropriate styling.
   */
  icon?: React.ReactNode;

  /**
   * Main heading text displayed prominently to describe the empty state.
   * This should be a clear, concise description of what's missing.
   */
  title: string;

  /**
   * Optional descriptive message providing additional context or instructions.
   * Displayed below the title in smaller, muted text.
   */
  message?: string;

  /**
   * Optional action element (typically a Button) to help users resolve the empty state.
   * Displayed below the message text if provided.
   *
   * @example
   * <Button variant="primary" onClick={handleCreateRoom}>
   *   Create New Room
   * </Button>
   */
  action?: React.ReactNode;

  /**
   * Additional CSS class names to apply to the root container.
   * Useful for custom styling, spacing adjustments, or theme variations.
   */
  className?: string;

  /**
   * Optional accessible label for the empty state container.
   * If not provided, defaults to "Empty state".
   * Used by screen readers to describe the purpose of this section.
   */
  ariaLabel?: string;

  /**
   * Controls the maximum width of the content area.
   * @default "md" - Sets max-width to 28rem (448px)
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Controls the vertical alignment within the container.
   * @default "center" - Centers content vertically in available space
   */
  verticalAlign?: 'top' | 'center' | 'bottom';

  /**
   * Controls the horizontal alignment of text content.
   * @default "center" - Centers all text content
   */
  textAlign?: 'left' | 'center' | 'right';
}

/**
 * EmptyState molecule displays a message when no content is available
 *
 * Features:
 * - Flexible icon display with custom icon support
 * - Clear title and optional descriptive message
 * - Optional action button for user guidance
 * - Responsive design with configurable layout options
 * - Full accessibility support with ARIA labels and semantic HTML
 * - Consistent spacing and typography following design system
 * - Dark mode support with appropriate color variations
 *
 * Layout Structure:
 * - Icon (optional) - displayed prominently at the top
 * - Title - main heading describing the empty state
 * - Message (optional) - supporting text with additional context
 * - Action (optional) - call-to-action button or link
 *
 * @example
 * // Basic usage with title only
 * <EmptyState title="No messages yet" />
 *
 * @example
 * // With custom icon and descriptive message
 * <EmptyState
 *   icon={<Icon name="chat" size="xl" className="text-gray-400" />}
 *   title="No rooms selected"
 *   message="Choose a room from the sidebar to start chatting with your team"
 * />
 *
 * @example
 * // With action button to resolve the empty state
 * <EmptyState
 *   icon={<Icon name="plus-circle" size="xl" className="text-blue-400" />}
 *   title="No rooms available"
 *   message="Create your first room to start collaborating"
 *   action={
 *     <Button variant="primary" onClick={handleCreateRoom}>
 *       Create New Room
 *     </Button>
 *   }
 * />
 *
 * @example
 * // Custom styling and layout
 * <EmptyState
 *   title="Search returned no results"
 *   message="Try adjusting your search terms or filters"
 *   maxWidth="lg"
 *   textAlign="left"
 *   className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8"
 * />
 */
export const EmptyState = ({
  icon,
  title,
  message,
  action,
  className,
  ariaLabel = 'Empty state',
  maxWidth = 'md',
  verticalAlign = 'center',
  textAlign = 'center',
}: EmptyStateProps) => {
  /**
   * Maps maxWidth prop to Tailwind CSS classes
   */
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  /**
   * Maps verticalAlign prop to Tailwind CSS flexbox classes
   */
  const verticalAlignClasses = {
    top: 'justify-start',
    center: 'justify-center',
    bottom: 'justify-end',
  };

  /**
   * Maps textAlign prop to Tailwind CSS text alignment classes
   */
  const textAlignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div
      className={clsx('flex-1 flex items-center', verticalAlignClasses[verticalAlign], className)}
      role="status"
      aria-label={ariaLabel}
    >
      <div
        className={clsx(
          maxWidthClasses[maxWidth],
          'mx-auto px-4 py-8',
          textAlignClasses[textAlign]
        )}
      >
        {/* Icon Section */}
        {icon && (
          <div className="mb-6" aria-hidden="true">
            {icon}
          </div>
        )}

        {/* Title Section */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{title}</h3>

        {/* Message Section */}
        {message && (
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">{message}</p>
        )}

        {/* Action Section */}
        {action && (
          <div className={clsx('mt-6', textAlign !== 'center' && 'flex justify-start')}>
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

// Set display name for better debugging experience
EmptyState.displayName = 'EmptyState';
