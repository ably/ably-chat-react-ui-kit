import { PresenceMember } from '@ably/chat';
import { usePresenceListener } from '@ably/chat/react';
import React, { useEffect, useState } from 'react';

import { Tooltip } from '../atoms/tooltip.tsx';

/**
 * Props for the PresenceList component
 */
export interface PresenceListProps {
  /**
   * The trigger element that will show the presence tooltip on hover
   */
  children: React.ReactElement;
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
 * - Automatic positioning with collision detection
 * - Accessible tooltip with ARIA attributes and live region updates
 * - Real-time updates when presence data changes
 *
 * @example
 * // Basic usage
 * <PresenceList>
 *   <Button>Show Participants</Button>
 * </PresenceList>
 *
 */
export const PresenceList = ({ children }: PresenceListProps) => {
  const { presenceData } = usePresenceListener();
  const [presenceText, setPresenceText] = useState('No one is currently present');

  useEffect(() => {
    const newText = buildPresenceSentence(presenceData);
    setPresenceText(newText);
  }, [presenceData]);

  return (
    <Tooltip title={presenceText} position={'auto'}>
      {children}
    </Tooltip>
  );
};
