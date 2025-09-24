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
  /** Additional CSS classes to apply to the container */
  className?: string;
}

/**
 * Loading component displayed while connecting to chat services.
 * Shows a spinner and connection status message.
 */
export const AppLoading = ({ width = '50vw', height = '50vh', className }: AppLoadingProps) => {
  const containerStyle = useMemo(
    () => ({
      width: typeof width === 'number' ? `${String(width)}px` : width,
      height: typeof height === 'number' ? `${String(height)}px` : height,
    }),
    [width, height]
  );

  return (
    <div
      className={clsx('ably-app-loading', className)}
      style={containerStyle}
      role="main"
      aria-label="Loading chat application"
    >
      <div className="ably-app-loading__content">
        <div className="ably-app-loading__spinner"></div>
        <p className="ably-app-loading__text">Connecting to chat...</p>
      </div>
    </div>
  );
};
