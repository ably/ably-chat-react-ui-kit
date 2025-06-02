import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'message';
}

const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ variant = 'default', className = '', ...props }, ref) => {
    const baseClasses =
      'transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
      default:
        'w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
      message:
        'flex-1 px-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    };

    return (
      <input ref={ref} className={`${baseClasses} ${variants[variant]} ${className}`} {...props} />
    );
  }
);

TextInput.displayName = 'TextInput';

export default TextInput;
