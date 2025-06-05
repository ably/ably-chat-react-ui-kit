import React from 'react';

/**
 * Visual variants for the TextInput component
 */
type TextInputVariant = 'default' | 'message';

/**
 * Size options for the TextInput component
 */
type TextInputSize = 'sm' | 'md' | 'lg';

/**
 * Props for the TextInput component
 */
interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Visual variant of the input field
   * - 'default': Standard form input with rectangular borders
   * - 'message': Rounded chat message input optimized for messaging interfaces
   * @default 'default'
   */
  variant?: TextInputVariant;
  
  /**
   * Size of the input field
   * - 'sm': Small padding and text
   * - 'md': Medium padding and text (default)
   * - 'lg': Large padding and text
   * @default 'md'
   */
  size?: TextInputSize;
  
  /**
   * Error state styling
   * When true, applies error styling (red borders, etc.)
   */
  error?: boolean;
  
  /**
   * Success state styling
   * When true, applies success styling (green borders, etc.)
   */
  success?: boolean;
  
  /**
   * Additional CSS classes to apply to the input
   */
  className?: string;
  
  /**
   * Prefix icon or element to display before the input text
   */
  prefix?: React.ReactNode;
  
  /**
   * Suffix icon or element to display after the input text
   */
  suffix?: React.ReactNode;
}

/**
 * TextInput component provides a customizable input field with multiple variants and states
 * 
 * Features:
 * - Multiple visual variants (default form input, message input)
 * - Size variations (sm, md, lg)
 * - Error and success states with appropriate styling
 * - Dark mode support
 * - Accessibility compliant with proper focus management
 * - Forward ref support for form libraries
 * - Prefix/suffix support for icons and buttons
 * 
 * @example
 * // Basic usage
 * <TextInput placeholder="Enter your name" />
 * 
 * @example
 * // Message variant for chat interfaces
 * <TextInput 
 *   variant="message" 
 *   placeholder="Type a message..."
 *   size="lg"
 * />
 * 
 * @example
 * // With error state
 * <TextInput 
 *   error 
 *   placeholder="Email"
 *   aria-describedby="email-error"
 * />
 * 
 * @example
 * // With prefix and suffix
 * <TextInput 
 *   prefix={<SearchIcon />}
 *   suffix={<Button>Submit</Button>}
 *   placeholder="Search..."
 * />
 */
const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ 
    variant = 'default', 
    size = 'md',
    error = false,
    success = false,
    className = '', 
    prefix,
    suffix,
    disabled,
    'aria-invalid': ariaInvalid,
    ...props 
  }, ref) => {
    // Base classes applied to all variants
    const baseClasses = [
      'transition-colors duration-200 ease-in-out',
      'focus:outline-none',
      'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
      'placeholder:text-gray-400 dark:placeholder:text-gray-500'
    ].join(' ');

    // Size-specific classes
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-4 py-3 text-lg'
    };

    // Variant-specific classes
    const variantClasses = {
      default: [
        'w-full rounded-lg border',
        'bg-white dark:bg-gray-800',
        'text-gray-900 dark:text-gray-100',
        // State-specific border colors
        error 
          ? 'border-red-500 dark:border-red-400' 
          : success 
            ? 'border-green-500 dark:border-green-400'
            : 'border-gray-300 dark:border-gray-600',
        // Focus states
        error
          ? 'focus:ring-2 focus:ring-red-500 focus:border-red-500'
          : success
            ? 'focus:ring-2 focus:ring-green-500 focus:border-green-500'
            : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400'
      ].join(' '),
      
      message: [
        'flex-1 rounded-full border',
        'bg-gray-50 dark:bg-gray-700',
        'text-gray-900 dark:text-gray-100',
        // State-specific border colors
        error 
          ? 'border-red-500 dark:border-red-400' 
          : success 
            ? 'border-green-500 dark:border-green-400'
            : 'border-gray-300 dark:border-gray-600',
        // Focus states
        error
          ? 'focus:ring-2 focus:ring-red-500 focus:border-red-500'
          : success
            ? 'focus:ring-2 focus:ring-green-500 focus:border-green-500'
            : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400'
      ].join(' ')
    };

    // Determine aria-invalid based on error state
    const computedAriaInvalid = ariaInvalid ?? (error ? 'true' : undefined);

    // If we have prefix or suffix, wrap in a container
    if (prefix || suffix) {
      return (
        <div className={`relative flex items-center ${variant === 'default' ? 'w-full' : 'flex-1'}`}>
          {prefix && (
            <div className="absolute left-3 z-10 flex items-center pointer-events-none">
              {prefix}
            </div>
          )}
          <input
            ref={ref}
            className={`
              ${baseClasses} 
              ${variantClasses[variant]} 
              ${sizeClasses[size]}
              ${prefix ? 'pl-10' : ''}
              ${suffix ? 'pr-10' : ''}
              ${className}
            `.trim()}
            disabled={disabled}
            aria-invalid={computedAriaInvalid}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 z-10 flex items-center">
              {suffix}
            </div>
          )}
        </div>
      );
    }

    return (
      <input 
        ref={ref} 
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()}
        disabled={disabled}
        aria-invalid={computedAriaInvalid}
        {...props} 
      />
    );
  }
);

TextInput.displayName = 'TextInput';

export default TextInput;
