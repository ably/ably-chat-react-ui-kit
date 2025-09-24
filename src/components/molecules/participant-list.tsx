import { PresenceMember } from '@ably/chat';
import React from 'react';

import { Button } from '../atoms/button.tsx';
import { Icon } from '../atoms/icon.tsx';
import { Participant } from './participant.tsx';

/**
 * Props for the ParticipantList component
 */
export interface ParticipantListProps {
  /**
   * Array of Ably Chat presence members currently in the room.
   * Used to display all participants with their online status.
   */
  presenceData: PresenceMember[];

  /**
   * Client ID of the current Ably Connection for the room.
   * Used to sort the current user to the top of the list and for self-identification.
   */
  currentClientId: string;

  /**
   * Set of client IDs for users who are currently typing.
   * Used to show typing indicators next to participant names.
   */
  currentlyTyping: Set<string>;

  /**
   * Callback function to toggle the list open/closed state.
   * Called when the close button is clicked or when backdrop interaction occurs.
   */
  onToggle: () => void;

  /**
   * Absolute positioning coordinates for rendering the modal.
   * The modal will be positioned relative to the viewport using these coordinates.
   * Typically calculated based on the trigger element's position.
   */
  position: { top: number; left: number };
}

/**
 * ParticipantList component displays a positioned modal showing all room participants
 *
 * Features:
 * - Modal overlay with absolute positioning based on provided coordinates
 * - Participant list with avatars, names, and status indicators
 * - Smart sorting: current user appears first, followed by alphabetical order
 * - Typing indicators for active participants
 * - Participant count display in header
 * - Scrollable list with fixed maximum height for large participant counts
 * - Accessible modal dialog with proper ARIA attributes and focus management
 * - Theme-aware styling supporting both light and dark modes
 *
 * @example
 * // Integration with presence and typing hooks
 * const { presenceData } = usePresenceListener();
 * const { currentlyTyping } = useTyping();
 * const { clientId } = useChatClient();
 *
 * {participantListOpen && (<ParticipantList
 *   presenceData={presenceData || []}
 *   currentClientId={clientId}
 *   currentlyTyping={currentlyTyping}
 *   onToggle={toggleParticipantList}
 *   position={{ top: 100, left: 200 }}
 * />)}
 */
export const ParticipantList = ({
  presenceData,
  currentClientId,
  currentlyTyping,
  onToggle,
  position,
}: ParticipantListProps) => {
  // Calculate present count from unique clientIds in presence data
  const presentCount = presenceData.length || 0;

  // Sort participants: current user first, then by clientId
  const sortedParticipants = [...presenceData].sort((a, b) => {
    if (a.clientId === currentClientId && b.clientId !== currentClientId) return -1;
    if (a.clientId !== currentClientId && b.clientId === currentClientId) return 1;
    return a.clientId.localeCompare(b.clientId);
  });

  return (
    <div
      className="ably-participant-list"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translateX(-50%)',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="participants-heading"
    >
      {/* Header */}
      <div className="ably-participant-list__header">
        <div className="ably-participant-list__header-content">
          <h3 id="participants-heading" className="ably-participant-list__title">
            Participants ({presentCount})
          </h3>
          <Button variant="ghost" size="sm" onClick={onToggle} aria-label="Close participants list">
            <Icon name="close" size="sm" aria-hidden={true} />
          </Button>
        </div>
        <p className="ably-participant-list__count" aria-live="polite">
          {presentCount} {presentCount === 1 ? 'person' : 'people'} present
        </p>
      </div>

      {/* Participants List */}
      <div className="ably-participant-list__content" role="list" aria-label="Room participants">
        {sortedParticipants.map((member) => {
          // Get the avatar for this user from the AvatarProvider
          return (
            <Participant
              key={member.clientId}
              clientId={member.clientId}
              isPresent={true}
              isSelf={member.clientId === currentClientId}
              isTyping={currentlyTyping.has(member.clientId)}
            />
          );
        })}
      </div>
    </div>
  );
};
