import React from 'react';
import { PresenceMember } from '@ably/chat';
import clsx from 'clsx';

import { TooltipSurface, TooltipArrow } from '../atoms';

interface PresenceListProps extends React.HTMLAttributes<HTMLDivElement> {
  presenceData: PresenceMember[];
  tooltipPosition: 'above' | 'below';
  showTooltip: boolean;
  isOpen: boolean;

  /* style hooks */
  surfaceClassName?: string;
  arrowClassName?: string;
  textClassName?: string;
}

const buildPresenceSentence = (
  presenceData: PresenceMember[],
): string => {
  if (!presenceData?.length) {
    return 'No one is currently present';
  }

  const names = presenceData.slice(0, 3).map((m) => m.clientId);
  const remaining = presenceData.length - 3;

  const base =
    remaining > 0
      ? `${names.join(', ')} and ${remaining} more participant${
          remaining > 1 ? 's' : ''
        } are present`
      : `${names.join(', ')} ${names.length > 1 ? 'are' : 'is'} present`;

  return `${base}\n`;
};

export const PresenceList: React.FC<PresenceListProps> = ({
  presenceData,
  tooltipPosition,
  showTooltip,
  isOpen,
  surfaceClassName,
  arrowClassName,
  textClassName,
  ...rest
}) => {
  if (!showTooltip || isOpen) return null;

  const text = buildPresenceSentence(presenceData);

  return (
    <TooltipSurface position={tooltipPosition} className={surfaceClassName} {...rest}>
      <div className={clsx('text-center', textClassName)}>{text}</div>
      <TooltipArrow position={tooltipPosition} className={arrowClassName} />
    </TooltipSurface>
  );
};
