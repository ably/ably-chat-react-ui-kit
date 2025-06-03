import React from 'react';
import clsx from 'clsx';

interface TooltipArrowProps extends React.HTMLAttributes<HTMLDivElement> {
  position: 'above' | 'below';
}

export const TooltipArrow: React.FC<TooltipArrowProps> = ({ position, className, ...rest }) => (
  <div
    className={clsx(
      'absolute left-1/2 transform -translate-x-1/2 w-0 h-0 ' +
        'border-l-4 border-r-4 border-transparent',
      position === 'above'
        ? 'top-full border-t-4 border-t-gray-900 dark:border-t-gray-700'
        : 'bottom-full border-b-4 border-b-gray-900 dark:border-b-gray-700',
      className
    )}
    {...rest}
  />
);
