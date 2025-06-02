import React, { ReactNode } from 'react';

/**
 * Represents the properties required for the AppLayout component.
 *
 * This interface is used to define and enforce the shape of the props object
 * that can be passed to the AppLayout component. It includes props for defining
 * the layout dimensions, CSS class, and content to be rendered within the layout.
 *
 * Properties:
 * - `children`: Defines the content to be rendered within the layout.
 * - `width`: Specifies the width of the layout. Accepts a string (e.g., "100%") or a number (e.g., 300).
 * - `height`: Specifies the height of the layout. Accepts a string (e.g., "100%") or a number (e.g., 400).
 * - `className`: Optional CSS class name for custom styling.
 */
interface AppLayoutProps {
  children: ReactNode;
  width?: string | number;
  height?: string | number;
  className?: string;
}

/**
 * A React functional component that provides a styled container layout
 * for wrapping inner content. The container's dimensions and appearance
 * are customizable through properties.
 */
/**
 * @constant
 * @type {React.FC<AppLayoutProps>}
 */
export const AppLayout: React.FC<AppLayoutProps> = ({ children, width, height, className = '' }) => {
  // Convert width and height to string with 'px' if they are numbers
  if (width === undefined) width = '50vw'; // 50% of viewport width by default
  if (height === undefined) height = '50vh'; // 50% of viewport height by default
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`flex bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg mx-auto my-8 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};
