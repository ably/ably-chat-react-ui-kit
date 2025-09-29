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
  return (
    <div
      className={clsx('ably-empty-state', `ably-empty-state--align-${verticalAlign}`, className)}
      role="status"
      aria-label={ariaLabel}
    >
      <div
        className={clsx(
          'ably-empty-state__content',
          `ably-empty-state__content--${maxWidth}`,
          `ably-empty-state__content--text-${textAlign}`
        )}
      >
        {/* Icon Section */}
        {icon && (
          <div className="ably-empty-state__icon" aria-hidden="true">
            {icon}
          </div>
        )}

        {/* Title Section */}
        <h3 className="ably-empty-state__title">{title}</h3>

        {/* Message Section */}
        {message && <p className="ably-empty-state__message">{message}</p>}

        {/* Action Section */}
        {action && (
          <div
            className={clsx(
              'ably-empty-state__action',
              textAlign !== 'center' && 'ably-empty-state__action--left'
            )}
          >
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

// Set display name for better debugging experience
EmptyState.displayName = 'EmptyState';
