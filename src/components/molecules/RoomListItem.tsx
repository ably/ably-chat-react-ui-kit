import React from 'react';
import { useOccupancy } from '@ably/chat/react';
import { Avatar, AvatarData } from '../atoms';
import { TypingIndicators } from './TypingIndicators';
import { Icon } from '../atoms';
import { Button } from '../atoms';
import { useRoomAvatar } from '../../hooks';

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

export const RoomListItem: React.FC<RoomListItemProps> = React.memo(
  ({
    roomName,
    isSelected,
    onClick,
    onLeave,
    avatar: propAvatar,
    isCollapsed = false,
    typingIndicatorsEnabled = true,
  }) => {
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
        <div className="flex justify-center p-2">
          <div
            className={`relative cursor-pointer transition-transform hover:scale-110 ${
              isSelected ? 'ring-2 ring-blue-500 rounded-full' : ''
            }`}
            onClick={onClick}
            title={roomAvatarData?.displayName}
            role="button"
            aria-label={`${roomAvatarData?.displayName} room${isSelected ? ' (selected)' : ''}`}
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
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
            )}
          </div>
        </div>
      );
    }

    // Otherwise render the full room list item
    return (
      <div
        className={`group flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800
                    cursor-pointer transition-colors
                    ${isSelected ? 'bg-gray-100 dark:bg-gray-800 border-r-2 border-blue-500' : ''}`}
        onClick={onClick}
        role="button"
        aria-label={`${roomAvatarData?.displayName} room${isSelected ? ' (selected)' : ''}${isActive ? `, ${presenceMembers} online` : ''}`}
        aria-pressed={isSelected}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
      >
        <div className="relative">
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
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"
              aria-hidden="true"
              title="Room is active"
            />
          )}

          {/* Present count badge */}
          {presenceMembers > 0 && (
            <div
              className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium"
              aria-hidden="true"
              title={`${presenceMembers} ${presenceMembers === 1 ? 'person' : 'people'} online`}
            >
              {presenceMembers > 9 ? '9+' : presenceMembers}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {roomAvatarData?.displayName}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Leave button - only visible on hover */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onLeave();
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 p-1"
                aria-label={`Leave ${roomAvatarData?.displayName} room`}
                title={`Leave ${roomAvatarData?.displayName}`}
              >
                <Icon name="close" size="sm" />
              </Button>
              {/* Room participant count */}
              <span
                className="text-xs text-gray-400"
                title={`${connections} total ${connections === 1 ? 'connection' : 'connections'}`}
              >
                {connections}
              </span>
            </div>
          </div>
          <div aria-live="polite">
            <TypingIndicators enabled={typingIndicatorsEnabled} maxClients={1} />
          </div>
        </div>
      </div>
    );
  }
);
