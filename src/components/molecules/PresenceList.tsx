import React from 'react';
import { PresenceMember } from '@ably/chat';
import clsx from 'clsx';
import ReactDOM from 'react-dom';

import { TooltipSurface, TooltipArrow } from '../atoms';
import { Portal } from '../atoms/Portal.tsx';

/**
 * Props for the PresenceList component
 */
export interface PresenceListProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Array of presence members currently in the room.
   * Used to generate a human-readable description of who is present.
   * Automatically handles deduplication and formatting for display.
   */
  presenceData: PresenceMember[];

  /**
   * Positioning of the tooltip relative to its trigger element.
   * - `above`: Tooltip appears above trigger with downward-pointing arrow
   * - `below`: Tooltip appears below trigger with upward-pointing arrow
   */
  tooltipPosition: 'above' | 'below';

  /**
   * Whether the tooltip should be visible to the user.
   * When false, component returns null and renders nothing.
   */
  showTooltip: boolean;

  /**
   * Absolute viewport coordinates (in pixels) where the tooltip should be
   * rendered. Calculated by the parent component.
   */
  coords?: { top: number; left: number } | null;

  /**
   * Optional CSS classes to apply to the TooltipSurface component.
   * Allows customization of the tooltip's background, padding, shadows, etc.
   * Merged with default tooltip styling using clsx.
   */
  surfaceClassName?: string;

  /**
   * Optional CSS classes to apply to the TooltipArrow component.
   * Allows customization of the arrow's color, size, or positioning.
   * Merged with default arrow styling using clsx.
   */
  arrowClassName?: string;

  /**
   * Optional CSS classes to apply to the tooltip text content.
   * Allows customization of font size, weight, color, alignment, etc.
   * Merged with default text styling (centered, truncated) using clsx.
   */
  textClassName?: string;
}

/**
 * Builds a human-readable sentence describing who is present in the room
 *
 * - Shows first 3 participant names explicitly
 * - For additional participants, shows count as "and N more participant(s)"
 * - Handles proper pluralization for both names and remaining count
 * - Uses proper grammar with "is/are" based on participant count
 *
 * @param presenceData - Array of Ably Chat presence members
 * @returns A formatted string describing current room participants
 *
 * @example
 * // Examples of generated text:
 * // []                           → "No one is currently present"
 * // ["Alice"]                    → "Alice is present"
 * // ["Alice", "Bob"]             → "Alice, Bob are present"
 * // ["Alice", "Bob", "Charlie"]  → "Alice, Bob, Charlie are present"
 * // ["Alice", "Bob", "Charlie", "David", "Eve"] → "Alice, Bob, Charlie and 2 more participants are present"
 */
const buildPresenceSentence = (presenceData: PresenceMember[]): string => {
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
 * PresenceList component displays a tooltip with detailed information about room participants
 *
 * Core Features:
 * - Human-readable participant list with smart truncation and formatting
 * - Conditional rendering based on tooltip visibility and modal states
 * - Flexible positioning (above/below) with proper arrow orientation
 * - Accessible tooltip with ARIA attributes and live region updates
 * - Customizable styling through multiple className props
 * - Theme-aware styling supporting both light and dark modes
 * - Maximum width constraint (max-w-96) with text truncation for long lists
 *
 *
 * @example
 * // Basic usage within RoomInfo hover interaction
 * <PresenceList
 *   presenceData={presenceData}
 *   tooltipPosition={tooltipPosition}
 *   showTooltip={showTooltip}
 *   isOpen={participantListOpen}
 * />
 *
 * @example
 * // With custom styling
 * <PresenceList
 *   presenceData={presenceData}
 *   tooltipPosition="above"
 *   showTooltip={true}
 *   isOpen={false}
 *   surfaceClassName="bg-blue-900 border-blue-700"
 *   textClassName="text-blue-100 font-medium"
 *   arrowClassName="border-blue-700"
 * />
 *
 *
 * @example
 * // Different presence scenarios and generated text
 * // presenceData = [] → "No one is currently present"
 * // presenceData = [{ clientId: "Alice" }] → "Alice is present"
 * // presenceData = [{ clientId: "Alice" }, { clientId: "Bob" }] → "Alice, Bob are present"
 * // presenceData = [5 members] → "Alice, Bob, Charlie and 2 more participants are present"
 */

export const PresenceList: React.FC<PresenceListProps> = ({
  presenceData,
  tooltipPosition,
  showTooltip,
  coords,
  surfaceClassName,
  arrowClassName,
  textClassName,
  ...rest
}) => {
  if (!showTooltip) return null;

  const text = buildPresenceSentence(presenceData);

  const tooltip = (
    <Portal>
      <TooltipSurface
        position={tooltipPosition}
        zIndex="z-50"
        className={clsx('fixed', surfaceClassName)}
        maxWidth="max-w-96"
        role="tooltip"
        aria-live="polite"
        style={coords ? { top: coords.top, left: coords.left } : undefined}
        {...rest}
      >
        <div className={clsx('text-center truncate', textClassName)}>{text}</div>
        <TooltipArrow position={tooltipPosition} className={arrowClassName} aria-hidden="true" />
      </TooltipSurface>
    </Portal>
  );

  if (typeof document !== 'undefined') {
    return ReactDOM.createPortal(tooltip, document.body);
  }

  return tooltip;
};
