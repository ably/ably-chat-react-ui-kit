import { PresenceMember } from '@ably/chat';
import { usePresenceListener } from '@ably/chat/react';
import { clsx } from 'clsx';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { Tooltip } from '../atoms/tooltip.tsx';

/**
 * Props for the PresenceList component
 */
export interface PresenceListProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Positioning of the tooltip relative to its trigger element.
   * - `above`: Tooltip appears above trigger with downward-pointing arrow
   * - `below`: Tooltip appears below trigger with upward-pointing arrow
   */
  tooltipPosition: 'above' | 'below';

  /**
   * Absolute viewport coordinates (in pixels) where the tooltip should be
   * rendered. Calculated by the parent component.
   */
  coords?: { top: number; left: number } | null;

  /**
   * Optional CSS classes to apply to the Tooltip component.
   * Allows customization of the tooltip's background, padding, shadows, etc.
   * Merged with default tooltip styling using clsx.
   */
  tooltipClassName?: string;

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
 * // ["Alice", "Bob", "Charlie"]  → "Alice, Bob and 2 more are present"
 */
const buildPresenceSentence = (presenceData: PresenceMember[]): string => {
  if (presenceData.length === 0) {
    return 'No one is currently present';
  }

  const names = presenceData.slice(0, 2).map((m) => m.clientId);
  const remaining = presenceData.length - 2;

  return remaining > 0
    ? `${names.join(', ')} and ${String(remaining)} more are present`
    : `${names.join(', ')} ${names.length > 1 ? 'are' : 'is'} present`;
};

/**
 * PresenceList component displays a tooltip with detailed information about room participants
 *
 * Core Features:
 * - Human-readable participant list with smart truncation and formatting
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
 *   tooltipPosition={tooltipPosition}
 * />
 *
 * @example
 * // With custom styling
 * <PresenceList
 *   tooltipPosition="above"
 *   surfaceClassName="bg-blue-900 border-blue-700"
 *   textClassName="text-blue-100 font-medium"
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

export const PresenceList = ({
  tooltipPosition,
  coords,
  tooltipClassName,
  textClassName,
  ...rest
}: PresenceListProps) => {
  const { presenceData } = usePresenceListener();
  const [presenceText, setPresenceText] = useState('No one is currently present');

  useEffect(() => {
    const newText = buildPresenceSentence(presenceData);
    setPresenceText(newText);
  }, [presenceData]);

  if (!coords) return;

  return createPortal(
    <Tooltip
      position={tooltipPosition}
      zIndex="z-50"
      className={clsx('fixed transform -translate-x-1/2', tooltipClassName)}
      maxWidth="max-w-96"
      role="tooltip"
      aria-live="polite"
      style={{ top: coords.top, left: coords.left }}
      {...rest}
    >
      <div className={clsx('text-center truncate', textClassName)}>{presenceText}</div>
    </Tooltip>,
    document.body
  );
};
