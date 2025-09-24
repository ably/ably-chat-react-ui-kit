import { useOccupancy } from '@ably/chat/react';
import { clsx } from 'clsx';
import React from 'react';

import { useRoomAvatar } from '../../hooks/use-room-avatar.tsx';
import { Avatar, AvatarData } from '../atoms/avatar.tsx';
import { Button } from '../atoms/button.tsx';
import { Icon } from '../atoms/icon.tsx';
import { TypingIndicators } from './typing-indicators.tsx';

/**
 * Props for the RoomListItem component
 */
export interface RoomListItemProps {
  /**
   * Unique identifier for the room.
   * Used for room identification and avatar generation when no custom avatar is provided.
   */
  roomName: string;

  /**
   * Whether this room is currently selected/active in the UI.
   * Controls visual highlighting and selection indicators.
   * When true, shows selection styling and active indicators.
   */
  isSelected: boolean;

  /**
   * Callback function triggered when the room item is clicked.
   * Should handle room navigation and selection logic.
   * Called for clicks on the main room area (not action buttons).
   */
  onClick: () => void;

  /**
   * Callback function triggered when the leave button is clicked.
   * Should handle room departure logic and UI updates.
   * Called only when the leave button is explicitly clicked.
   */
  onLeave: () => void;

  /**
   * Optional custom avatar data for the room.
   * If not provided, uses the useRoomAvatar hook to generate/retrieve avatar data.
   * Allows for custom room branding and visual identity.
   */
  avatar?: AvatarData;

  /**
   * Whether the component should render in collapsed mode (avatar only).
   * When true, displays only the room avatar with a selection indicator.
   * When false, shows full room information including name, counts, and actions.
   * @default false
   */
  isCollapsed?: boolean;

  /**
   * Whether typing indicators should be displayed for this room.
   * Controls the visibility of real-time typing status below the room name.
   * @default true
   */
  typingIndicatorsEnabled?: boolean;
}

/**
 * RoomListItem component displays a room entry in the sidebar with activity indicators and controls
 *
 * Core Features:
 * - Room avatar with automatic fallback to generated avatars via useRoomAvatar hook
 * - Activity indicators (presence count, activity status)
 * - Room selection with visual feedback and hover states
 * - Typing indicators showing who is currently typing (when enabled)
 * - Leave room functionality with hover-revealed action button
 * - Collapsed mode for compact sidebar display (avatar-only)
 * - Connection count display for total room occupancy (connections)
 * - Accessible design with proper ARIA attributes and keyboard navigation
 * - Theme-aware styling supporting both light and dark modes
 *
 * @example
 * // Basic usage in sidebar room list
 * <RoomListItem
 *   roomName="general"
 *   isSelected={currentRoom === "general"}
 *   onClick={() => setCurrentRoom("general")}
 *   onLeave={() => leaveRoom("general")}
 * />
 *
 * @example
 * // With custom avatar and collapsed mode
 * <RoomListItem
 *   roomName="design-team"
 *   isSelected={false}
 *   onClick={handleRoomSelect}
 *   onLeave={handleRoomLeave}
 *   avatar={{
 *     displayName: "Design Team",
 *     src: "/team-avatars/design.jpg",
 *     color: "bg-purple-500"
 *   }}
 *   isCollapsed={sidebarCollapsed}
 *   typingIndicatorsEnabled={true}
 * />
 *
 *
 */
export const RoomListItem = React.memo(function RoomListItem({
  roomName,
  isSelected,
  onClick,
  onLeave,
  avatar: propAvatar,
  isCollapsed = false,
  typingIndicatorsEnabled = true,
}: RoomListItemProps) {
  // Get occupancy data
  const { connections, presenceMembers } = useOccupancy();

  const { roomAvatar } = useRoomAvatar({ roomName });
  const roomAvatarData = propAvatar || roomAvatar;
  /**
   * Checks if the room has any active users
   *
   * @returns True if at least one user is present in the room
   */
  const isRoomActive = () => {
    // Check if anyone is present in the room
    return presenceMembers > 0;
  };

  const isActive = isRoomActive();

  // If collapsed, render just the avatar with selection indicator
  if (isCollapsed) {
    return (
      <div className="ably-room-list-item--collapsed">
        <div
          className={clsx(
            'ably-room-list-item__collapsed-avatar',
            isSelected && 'ably-room-list-item__collapsed-avatar--selected'
          )}
          onClick={onClick}
          title={roomAvatarData?.displayName || roomName}
          role="button"
          aria-label={`${roomAvatarData?.displayName || roomName} room${isSelected ? ' (selected)' : ''}`}
          aria-pressed={isSelected}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick();
            }
          }}
        >
          <Avatar
            alt={roomAvatarData?.displayName}
            src={roomAvatarData?.src}
            color={roomAvatarData?.color}
            size="md"
            initials={roomAvatarData?.initials}
          />
          {isSelected && (
            <div className="ably-room-list-item__activity-indicator" />
          )}
        </div>
      </div>
    );
  }

  // Otherwise render the full room list item
  return (
    <div
      className={clsx(
        'ably-room-list-item',
        isSelected && 'ably-room-list-item--selected'
      )}
      onClick={onClick}
      role="button"
      aria-label={`${roomAvatarData?.displayName || roomName} room${isSelected ? ' (selected)' : ''}${isActive ? `, ${String(presenceMembers)} online` : ''}`}
      aria-pressed={isSelected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="ably-room-list-item__avatar">
        <Avatar
          alt={roomAvatarData?.displayName}
          src={roomAvatarData?.src}
          color={roomAvatarData?.color}
          size="md"
          initials={roomAvatarData?.initials}
        />

        {/* Present indicator */}
        {isActive && (
          <div
            className="ably-room-list-item__activity-indicator"
            aria-hidden="true"
            title="Room is active"
          />
        )}

        {/* Present count badge */}
        {presenceMembers > 0 && (
          <div
            className="ably-room-list-item__presence-badge"
            aria-hidden="true"
            title={`${String(presenceMembers)} ${presenceMembers === 1 ? 'person' : 'people'} online`}
          >
            {presenceMembers > 9 ? '9+' : presenceMembers}
          </div>
        )}
      </div>

      <div className="ably-room-list-item__content">
        <div className="ably-room-list-item__header">
          <h3 className="ably-room-list-item__name">
            {roomAvatarData?.displayName}
          </h3>
          <div className="ably-room-list-item__actions">
            {/* Leave button - only visible on hover */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onLeave();
              }}
              className="ably-room-list-item__leave-button"
              aria-label={`Leave ${roomAvatarData?.displayName || 'room'}`}
              title={`Leave ${roomAvatarData?.displayName || 'room'}`}
            >
              <Icon name="close" size="sm" />
            </Button>
            {/* Room participant count */}
            <span
              className="ably-room-list-item__count"
              title={`${String(connections)} total ${connections === 1 ? 'connection' : 'connections'}`}
            >
              {connections}
            </span>
          </div>
        </div>
        <div aria-live="polite">
          {typingIndicatorsEnabled && <TypingIndicators maxClients={1} />}
        </div>
      </div>
    </div>
  );
});
