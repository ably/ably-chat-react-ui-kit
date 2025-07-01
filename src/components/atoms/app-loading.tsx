import { clsx } from 'clsx';
import React, { useMemo } from 'react';
/**
 * Props for the AppLoading component.
 */
interface AppLoadingProps {
  /** Width of the loading container (default: '50vw') */
  width?: string | number;
  /** Height of the loading container (default: '50vh') */
  height?: string | number;
}

/**
 * Loading component displayed while connecting to chat services.
 * Shows a spinner and connection status message.
 */
export const AppLoading = ({ width = '50vw', height = '50vh' }: AppLoadingProps) => {
  const containerStyle = useMemo(
    () => ({
      width: typeof width === 'number' ? `${String(width)}px` : width,
      height: typeof height === 'number' ? `${String(height)}px` : height,
    }),
    [width, height]
  );

  return (
    <div
      className={clsx(
        // Layout fundamentals
        'flex items-center justify-center',
        // Theme and colors
        'bg-gray-50 dark:bg-gray-950',
        'text-gray-900 dark:text-gray-100',
        // Positioning and overflow
        'overflow-hidden',
        // Visual styling
        'border border-gray-200 dark:border-gray-700',
        'rounded-lg shadow-lg',
        // Centering
        'mx-auto my-8'
      )}
      style={containerStyle}
      role="main"
      aria-label="Loading chat application"
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Connecting to chat...</p>
      </div>
    </div>
  );
};
