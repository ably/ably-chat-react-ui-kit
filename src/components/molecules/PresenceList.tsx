import React from 'react';
import { PresenceMember } from '@ably/chat';
import clsx from 'clsx';

import { TooltipSurface, TooltipArrow } from '../atoms';

/**
 * Props for the PresenceList component
 */
interface PresenceListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of presence members in the room */
  presenceData: PresenceMember[];
  /** Position of the tooltip relative to its trigger */
  tooltipPosition: 'above' | 'below';
  /** Whether to show the tooltip */
  showTooltip: boolean;
  /** Whether another component (like a participant list) is open */
  isOpen: boolean;

  /** Custom class name for the tooltip surface */
  surfaceClassName?: string;
  /** Custom class name for the tooltip arrow */
  arrowClassName?: string;
  /** Custom class name for the tooltip text */
  textClassName?: string;
}

/**
 * Builds a human-readable sentence describing who is present in the room
 * 
 * @param presenceData - Array of presence members
 * @returns A formatted string describing who is present
 */
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

  return `${base}`;
};

/**
 * PresenceList component displays a tooltip with information about who is present
 * 
 * Features:
 * - Shows a list of participants who are present in the room
 * - Limits display to first 3 names with a count of remaining participants
 * - Supports positioning above or below the trigger element
 * - Customizable styling through class name props
 */
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
    <TooltipSurface 
      position={tooltipPosition} 
      className={surfaceClassName} 
      role="tooltip"
      aria-live="polite"
      {...rest}
    >
      <div className={clsx('text-center', textClassName)}>{text}</div>
      <TooltipArrow 
        position={tooltipPosition} 
        className={arrowClassName} 
        aria-hidden="true" 
      />
    </TooltipSurface>
  );
};
