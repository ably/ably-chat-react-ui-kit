import React from 'react';
import { usePresenceListener } from '@ably/chat/react';

/**
 * Props for the PresenceIndicators component
 */
export interface PresenceIndicatorsProps {
  /**
   * Additional CSS classes to apply to the component's text element.
   * Merged with the component's default styling for customization.
   * Useful for adjusting text size, spacing, or alignment within parent layouts.
   */
  className?: string;
}

/**
 * PresenceIndicators component displays human-readable text about room participant count
 *
 * Features:
 * - Automatic deduplication of participants by clientId (handles multiple connections)
 * - Smart color indication: green when participants present, gray when empty
 * - Proper singular/plural text formatting ("1 person" vs "N people")
 * - Accessible live region for screen reader announcements of presence changes
 * - Automatically updates when presence data changes
 *
 * @example
 * // Basic usage within RoomInfo component (actual usage)
 * <div className="flex items-center gap-2">
 *   <PresenceIndicators />
 *   <TypingIndicators className="text-xs" />
 * </div>
 *
 * @example
 * // Different presence scenarios and display
 * // 0 participants: "0 people present" (gray text)
 * // 1 participant: "1 person present" (green text)
 * // 5 participants: "5 people present" (green text)
 * // Duplicate clientIds are automatically deduplicated
 */
export const PresenceIndicators: React.FC<PresenceIndicatorsProps> = ({ className = '' }) => {
  const { presenceData } = usePresenceListener();

  /**
   * Generates human-readable text about presence count
   *
   * @returns A string indicating how many people are present
   */
  const getPresenceText = () => {
    const presentCount = new Set(presenceData.map((p) => p.clientId)).size;
    if (presentCount === 1) return '1 person present';
    return `${presentCount} people present`;
  };

  // Determine if anyone is present
  const isAnyonePresent = (presenceData?.length || 0) > 0;

  return (
    <p
      className={`text-sm ${
        isAnyonePresent ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'
      } ${className}`}
      role="status"
      aria-live="polite"
    >
      {getPresenceText()}
    </p>
  );
};
