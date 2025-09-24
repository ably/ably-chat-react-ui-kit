import { clsx } from 'clsx';
import React, { useCallback, useEffect, useRef } from 'react';

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
export interface TextInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    'size' | 'prefix' | 'suffix'
  > {
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

  /**
   * Whether to use a multi-line textarea instead of a single-line input
   * @default false
   */
  multiline?: boolean;

  /**
   * Maximum height for the textarea when multiline is true
   * After this height is reached, the textarea becomes scrollable
   * @default '150px'
   */
  maxHeight?: string;
}

/**
 * TextInput component provides a customizable input field with multiple variants and states
 *
 * Features:
 * - Multiple visual variants (default form input, message input)
 * - Size variations (sm, md, lg)
 * - Error and success states with appropriate styling
 * - Dark mode support
 * - Accessibility: Basic ARIA attributes for error states
 * - Forward ref support for form libraries
 * - Prefix/suffix support for icons and buttons
 * - Support for multi-line input with auto-expansion
 * - Auto-scrolling to bottom when typing in multi-line mode
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
 * // Multi-line input for longer messages
 * <TextInput
 *   multiline
 *   maxHeight="150px"
 *   placeholder="Type a longer message..."
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
export const TextInput = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, TextInputProps>(
  (
    {
      variant = 'default',
      size = 'md',
      error = false,
      success = false,
      className = '',
      prefix,
      suffix,
      disabled,
      multiline = false,
      maxHeight = '150px',
      value,
      onChange,
      'aria-invalid': ariaInvalid,
      ...props
    },
    ref
  ) => {
    // Create a local ref for the textarea to handle auto-resize
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    // Determine aria-invalid based on error state
    const computedAriaInvalid = ariaInvalid ?? (error ? 'true' : undefined);

    // Build input classes using BEM convention
    const buildInputClasses = () => {
      return clsx(
        'ably-input',
        `ably-input--${size}`,
        `ably-input--${variant}`,
        {
          'ably-input--error': error,
          'ably-input--success': success && !error,
          'ably-input--multiline': multiline,
          'ably-input--has-prefix': prefix,
          'ably-input--has-suffix': suffix,
        },
        className // User's custom classes always override
      );
    };

    // Auto-resize textarea function
    const autoResizeTextarea = useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';

      // Set the height to scrollHeight, but cap it at maxHeight
      const newHeight = Math.min(textarea.scrollHeight, Number.parseInt(maxHeight));
      textarea.style.height = `${String(newHeight)}px`;

      // Check if content exceeds max height and show/hide scrollbar accordingly
      if (textarea.scrollHeight > Number.parseInt(maxHeight)) {
        // Show scrollbar only when content exceeds max height
        textarea.classList.remove('ably-input--multiline');
        textarea.classList.add('ably-input--multiline-scrollable');

        // If we're at max height, ensure we're scrolled to the bottom when typing
        if (textarea.value === value && typeof value === 'string') {
          textarea.scrollTop = textarea.scrollHeight;
        }
      } else {
        // Hide scrollbar when content fits within max height
        textarea.classList.remove('ably-input--multiline-scrollable');
        textarea.classList.add('ably-input--multiline');
      }
    }, [maxHeight, value]);

    // Auto-resize on value change
    useEffect(() => {
      if (multiline) {
        autoResizeTextarea();
      }
    }, [value, multiline, autoResizeTextarea]);

    // Render a textarea for multiline input
    const renderTextarea = () => {
      return (
        <textarea
          ref={(element) => {
            // Set the forwarded ref
            if (typeof ref === 'function') {
              ref(element);
            } else if (ref) {
              (ref as React.RefObject<HTMLTextAreaElement | null>).current = element;
            }
            // Set our local ref
            textareaRef.current = element;
          }}
          className={buildInputClasses()}
          style={{ maxHeight }}
          disabled={disabled}
          aria-invalid={computedAriaInvalid}
          rows={1}
          value={value}
          onChange={(e) => {
            if (onChange) {
              onChange(e);
            }
            // Auto-resize after onChange is called
            setTimeout(autoResizeTextarea, 0);
          }}
          {...props}
        />
      );
    };

    // Render a standard input for single-line input
    const renderInput = () => {
      return (
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          className={buildInputClasses()}
          disabled={disabled}
          aria-invalid={computedAriaInvalid}
          value={value}
          onChange={onChange}
          {...props}
        />
      );
    };

    // If we have prefix or suffix, wrap in a container
    if (prefix || suffix) {
      return (
        <div
          className={clsx(
            'ably-input-wrapper',
            `ably-input-wrapper--${variant}`
          )}
        >
          {prefix && (
            <div className="ably-input__prefix">
              {prefix}
            </div>
          )}
          {multiline ? renderTextarea() : renderInput()}
          {suffix && (
            <div className="ably-input__suffix">
              {suffix}
            </div>
          )}
        </div>
      );
    }

    return multiline ? renderTextarea() : renderInput();
  }
);

TextInput.displayName = 'TextInput';
