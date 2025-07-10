import { PresenceMember } from '@ably/chat';
import React from 'react';

/**
 * Props for the PresenceCount component
 */
export interface PresenceCountProps {
  /**
   * Array of Ably Chat presence members currently active in the room.
   * Each member represents a unique participant with clientId.
   * When null/undefined, the count defaults to 0 and the badge is hidden.
   */
  presenceData: PresenceMember[];
}

/**
 * PresenceCount component displays a small circular badge showing the number of online participants
 *
 * Features:
 * - Small circular badge positioned absolutely for overlay on avatars or containers
 * - Green background color indicating positive/active status
 * - Smart display logic: hides completely when count is zero
 * - Caps display at "99+" for very large numbers to maintain badge size
 * - Accessible with proper ARIA attributes for screen readers
 * - Compact 24x24px (w-6 h-6) size suitable for overlaying on avatars
 *
 * @example
 * // With presence data from hooks
 * const { presenceData } = usePresenceListener();
 *
 * <div className="relative">
 *   <RoomIcon roomName={roomName} />
 *   <PresenceCount presenceData={presenceData || []} />
 * </div>
 *
 * @example
 * // Different count scenarios
 * // No badge shown (count = 0)
 * <PresenceCount presenceData={[]} />
 *
 * // Shows "1" (count = 1)
 * <PresenceCount presenceData={[{ clientId: "user1" }]} />
 *
 * // Shows "99+" (count > 99)
 * <PresenceCount presenceData={arrayWith150Members} />
 */
export const PresenceCount = ({ presenceData }: PresenceCountProps) => {
  const presentCount = presenceData.length || 0;

  if (presentCount === 0) {
    return;
  }

  return (
    <div
      className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium"
      aria-label={`${String(presentCount)} ${presentCount === 1 ? 'person' : 'people'} online`}
      role="status"
    >
      {presentCount > 99 ? '99+' : presentCount}
    </div>
  );
};
