import React from 'react';
import clsx from 'clsx';

interface TooltipSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  position: 'above' | 'below';
}

export const TooltipSurface: React.FC<TooltipSurfaceProps> = ({
  position,
  className,
  children,
  ...rest
}) => (
  <div
    className={clsx(
      // default styling
      'absolute left-1/2 transform -translate-x-1/2 px-3 py-2 ' +
        'bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg shadow-lg ' +
        'whitespace-nowrap z-50 max-w-xs',
      // position variant
      position === 'above' ? 'bottom-full mb-2' : 'top-full mt-2',
      // consumer overrides
      className,
    )}
    {...rest}
  >
    {children}
  </div>
);