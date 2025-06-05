import React from 'react';
import { usePresenceListener } from '@ably/chat/react';

/**
 * Props for the PresenceIndicators component
 */
interface PresenceIndicatorsProps {
  /** Additional CSS classes to apply to the component */
  className?: string;
}

/**
 * PresenceIndicators component displays text showing how many people are present
 * 
 * Features:
 * - Shows count of unique users present in the room
 * - Automatically updates when presence changes
 * - Uses green text when people are present, gray when empty
 * - Properly handles singular/plural text
 */
const PresenceIndicators: React.FC<PresenceIndicatorsProps> = ({ className = '' }) => {
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
        isAnyonePresent
          ? 'text-green-500'
          : 'text-gray-500 dark:text-gray-400'
      } ${className}`}
      role="status"
      aria-live="polite"
    >
      {getPresenceText()}
    </p>
  );
};

export default PresenceIndicators;
