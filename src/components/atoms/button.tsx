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
  const spinnerSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };

  return (
    <svg className={`${spinnerSizes[size]} animate-spin`} fill="none" viewBox="0 0 24 24">
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
  // Base classes applied to all buttons
  const baseClasses = [
    'inline-flex items-center justify-center',
    'font-medium rounded-md',
    'transition-all duration-200 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
    // Full width handling
    fullWidth ? 'w-full' : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Variant-specific styling
  const variantClasses: Record<ButtonVariant, string> = {
    primary: [
      'bg-blue-600 text-white',
      'hover:bg-blue-700 active:bg-blue-800',
      'focus:ring-blue-500',
      'dark:bg-blue-500 dark:hover:bg-blue-600',
    ].join(' '),

    secondary: [
      'bg-gray-200 text-gray-900',
      'hover:bg-gray-300 active:bg-gray-400',
      'focus:ring-gray-500',
      'dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
    ].join(' '),

    ghost: [
      'text-gray-700 bg-transparent',
      'hover:bg-gray-100 active:bg-gray-200',
      'focus:ring-gray-500',
      'dark:text-gray-300 dark:hover:bg-gray-800 dark:active:bg-gray-700',
    ].join(' '),

    outline: [
      'border border-gray-300 bg-transparent text-gray-700',
      'hover:bg-gray-50 active:bg-gray-100',
      'focus:ring-gray-500',
      'dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
    ].join(' '),

    danger: [
      'bg-red-600 text-white',
      'hover:bg-red-700 active:bg-red-800',
      'focus:ring-red-500',
      'dark:bg-red-500 dark:hover:bg-red-600',
    ].join(' '),
  };

  // Size-specific styling
  const sizeClasses: Record<ButtonSize, string> = {
    xs: 'px-2 py-1 text-xs gap-1',
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
    xl: 'px-8 py-4 text-lg gap-3',
  };

  // Determine if button should be disabled
  const isDisabled = disabled || loading;

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      {...props}
    >
      {/* Left icon or loading spinner */}
      {loading ? (
        loadingSpinner || <DefaultSpinner size={size} />
      ) : leftIcon ? (
        <span className="flex-shrink-0" aria-hidden="true">
          {leftIcon}
        </span>
      ) : undefined}

      {/* Button content */}
      <span className={loading ? 'opacity-70' : ''}>{children}</span>

      {/* Right icon (hidden during loading) */}
      {!loading && rightIcon && (
        <span className="flex-shrink-0" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
};
