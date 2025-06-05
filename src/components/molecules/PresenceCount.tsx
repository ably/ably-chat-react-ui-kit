import React from 'react';
import { PresenceMember } from '@ably/chat';

/**
 * Props for the PresenceCount component
 */
interface PresenceCountProps {
  /** Array of presence members to count */
  presenceData: PresenceMember[];
}

/**
 * PresenceCount component displays a badge with the number of online users
 * 
 * Features:
 * - Shows the count of online users in a small badge
 * - Caps display at "99+" for large numbers
 * - Renders nothing when count is zero
 * - Positioned absolutely by default for overlay on other elements
 */
const PresenceCount: React.FC<PresenceCountProps> = ({ presenceData }) => {
  const presentCount = presenceData?.length || 0;

  if (presentCount === 0) {
    return null;
  }

  return (
    <div 
      className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium"
      aria-label={`${presentCount} ${presentCount === 1 ? 'person' : 'people'} online`}
      role="status"
    >
      {presentCount > 99 ? '99+' : presentCount}
    </div>
  );
};

export default PresenceCount;
