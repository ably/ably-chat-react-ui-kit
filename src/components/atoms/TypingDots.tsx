import React from 'react';
import clsx from 'clsx';

interface TypingDotsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Tailwind size utility, e.g. `w-2 h-2`. Default: `w-1.5 h-1.5` */
  dotSizeClassName?: string;
  /** Custom classes for the <div> that wraps the dots */
  className?: string;
  /** Custom classes for each individual dot */
  dotClassName?: string;
}

const delays = ['0ms', '200ms', '400ms'];

export const TypingDots: React.FC<TypingDotsProps> = ({
  dotSizeClassName = 'w-1.5 h-1.5',
  className,
  dotClassName,
  ...rest
}) => (
  <div className={clsx('flex gap-0.5', className)} {...rest}>
    {delays.map((delay) => (
      <div
        key={delay}
        className={clsx(dotSizeClassName, 'rounded-full bg-current animate-bounce', dotClassName)}
        style={{ animationDelay: delay, animationDuration: '1s' }}
      />
    ))}
  </div>
);
