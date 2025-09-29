import { clsx } from 'clsx';
import React from 'react';

/**
 * Visual variants for button styling
 */
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';

/**
 * Size options for button dimensions
 */
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Props for the Button component
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual variant of the button
   * - 'primary': Main action button with primary brand color
   * - 'secondary': Secondary action with muted styling
   * - 'ghost': Transparent button with minimal styling
   * - 'outline': Button with border and no background
   * - 'danger': Destructive action button (red)
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Size of the button
   * - 'xs': Extra small (px-2 py-1 text-xs)
   * - 'sm': Small (px-3 py-1.5 text-sm)
   * - 'md': Medium (px-4 py-2 text-sm) - default
   * - 'lg': Large (px-6 py-3 text-base)
   * - 'xl': Extra large (px-8 py-4 text-lg)
   * @default 'md'
   */
  size?: ButtonSize;

  /**
   * Button content - text, icons, or other React elements
   */
  children: React.ReactNode;

  /**
   * Additional CSS classes to apply to the button
   */
  className?: string;

  /**
   * Loading state - shows spinner and disables interaction
   * @default false
   */
  loading?: boolean;

  /**
   * Icon to display before the button text
   */
  leftIcon?: React.ReactNode;

  /**
   * Icon to display after the button text
   */
  rightIcon?: React.ReactNode;

  /**
   * Whether the button should take full width of its container
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Custom loading spinner component
   * If not provided, uses default spinner
   */
  loadingSpinner?: React.ReactNode;
}

/**
 * Default loading spinner component
 */
const DefaultSpinner = ({ size }: { size: ButtonSize }) => {
  return (
    <svg
      className={clsx('ably-button__spinner', `ably-button__spinner--${size}`)}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

/**
 * Button component provides a highly customizable button with multiple variants and states
 *
 * Features:
 * - Multiple visual variants (primary, secondary, ghost, outline, danger)
 * - Size variations from extra small to extra large
 * - Loading states with customizable spinners
 * - Icon support (left and right positioning)
 * - Full accessibility support with proper ARIA attributes
 * - Dark mode compatible
 * - Focus management and keyboard navigation
 * - Disabled state handling
 *
 * @example
 * // Basic usage
 * <Button>Click me</Button>
 *
 * @example
 * // Secondary variant with icon
 * <Button variant="secondary" leftIcon={<PlusIcon />}>
 *   Add Item
 * </Button>
 *
 * @example
 * // Loading state
 * <Button loading onClick={handleSubmit}>
 *   {loading ? 'Submitting...' : 'Submit'}
 * </Button>
 *
 * @example
 * // Danger variant for destructive actions
 * <Button
 *   variant="danger"
 *   size="lg"
 *   onClick={() => confirmDelete()}
 * >
 *   Delete Account
 * </Button>
 *
 * @example
 * // Full width button
 * <Button fullWidth variant="primary">
 *   Continue
 * </Button>
 */
export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  loadingSpinner,
  disabled,
  ...props
}: ButtonProps) => {
  // Determine if button should be disabled
  const isDisabled = disabled || loading;

  // Build button classes using BEM convention
  const buttonClasses = clsx(
    'ably-button',
    `ably-button--${size}`,
    `ably-button--${variant}`,
    {
      'ably-button--full-width': fullWidth,
      'ably-button--loading': loading,
    },
    className // User's custom classes always override
  );

  return (
    <button className={buttonClasses} disabled={isDisabled} aria-disabled={isDisabled} {...props}>
      {/* Left icon or loading spinner */}
      {loading ? (
        loadingSpinner || <DefaultSpinner size={size} />
      ) : leftIcon ? (
        <span className="ably-button__icon" aria-hidden="true">
          {leftIcon}
        </span>
      ) : undefined}

      {/* Button content */}
      <span className={clsx({ 'ably-button__content--loading': loading })}>{children}</span>

      {/* Right icon (hidden during loading) */}
      {!loading && rightIcon && (
        <span className="ably-button__icon" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
};
