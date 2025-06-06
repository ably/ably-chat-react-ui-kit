import React, { useEffect } from 'react';
import { useOccupancy, useRoom, useTyping } from '@ably/chat/react';
import Avatar, { AvatarData } from '../atoms/Avatar';
import TypingIndicators from './TypingIndicators.tsx';
import { useAvatar } from '../../context/AvatarContext';
import { useCurrentRoom } from '../../context/CurrentRoomContext.tsx';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';

/**
 * Props for the RoomListItem component
 */
interface RoomListItemProps {
  /** Unique identifier for the room */
  roomId: string;
  /** Callback function when the room is clicked */
  onClick: () => void;
  /** Callback function when the leave button is clicked */
  onLeave: () => void;
  /** ID of the current user */
  currentUserId: string;
  /** Optional avatar data for the room (from props) */
  avatar?: AvatarData;
  /** Whether the component should render in collapsed mode (avatar only) */
  isCollapsed?: boolean;
}

/**
 * RoomListItem component displays a room in the sidebar
 *
 * Features:
 * - Shows room avatar with presence indicators
 * - Displays room name and participant count
 * - Shows typing indicators when users are typing
 * - Highlights the currently selected room
 * - Integrates with Ably's occupancy and typing data
 * - Supports collapsed mode (avatar only) for compact sidebar display
 */
const RoomListItem: React.FC<RoomListItemProps> = React.memo(
  ({ roomId, onClick, onLeave, currentUserId, avatar: propAvatar, isCollapsed = false }) => {
    const [roomAvatarData, setRoomAvatarData] = React.useState<AvatarData | undefined>(undefined);
    const { getAvatarForRoom } = useAvatar();
    const { currentRoomId } = useCurrentRoom();
    const { room } = useRoom();
    // Get occupancy data
    const { connections, presenceMembers } = useOccupancy();
    // Get typing data
    const { currentlyTyping } = useTyping();

    // useEffect(() => {
    //   // attach the room when the component renders
    //   // detaching and release is handled at the top app level for now
    //   room?.attach();
    //   return () => {
    //     // Detach the room when the component unmounts
    //     room?.detach();
    //   };
    // }, [room]);

    useEffect(() => {
      // Get the avatar for the room, either from props or AvatarProvider
      const avatar = propAvatar || getAvatarForRoom(roomId);
      setRoomAvatarData(avatar);
    }, [getAvatarForRoom, propAvatar, roomId]);

    // Get the room avatar from props or from the AvatarProvider
    const roomAvatar = propAvatar || getAvatarForRoom(roomId);

    const isSelected = roomId === currentRoomId;

    /**
     * Checks if the room has any active users
     *
     * @returns True if at least one user is present in the room
     */
    const isRoomActive = () => {
      // Check if anyone is present in the room
      return (presenceMembers || 0) > 0;
    };

    /**
     * Gets the count of users present in the room
     *
     * @returns Number of present users
     */
    const getPresentCount = () => {
      return presenceMembers || 0;
    };

    /**
     * Gets the total count of connections to the room
     *
     * @returns Total number of connections
     */
    const getTotalCount = () => {
      // Use connections that include both presence and other connections
      return connections || 0;
    };

    /**
     * Generates a human-readable string about who is typing
     *
     * @returns A formatted string or null if no one is typing
     */
    const getTypingUsers = () => {
      // Filter out current user from typing set
      const typingUserIds = Array.from(currentlyTyping).filter(
        (clientId) => clientId !== currentUserId
      );

      if (typingUserIds.length === 0) return null;

      if (typingUserIds.length === 1) {
        return `${typingUserIds[0]} is typing...`;
      } else if (typingUserIds.length === 2) {
        return `${typingUserIds[0]} and ${typingUserIds[1]} are typing...`;
      } else {
        return `${typingUserIds[0]} and ${typingUserIds.length - 1} others are typing...`;
      }
    };

    const typingText = getTypingUsers();
    const presentCount = getPresentCount();
    const totalCount = getTotalCount();
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
            title={roomAvatar.displayName}
            role="button"
            aria-label={`${roomAvatar.displayName} room${isSelected ? ' (selected)' : ''}`}
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
        aria-label={`${roomAvatar.displayName} room${isSelected ? ' (selected)' : ''}${isActive ? `, ${presentCount} online` : ''}`}
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
            alt={roomAvatar.displayName}
            src={roomAvatar.src}
            color={roomAvatar.color}
            size="md"
            initials={roomAvatar.initials}
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
          {presentCount > 0 && (
            <div
              className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium"
              aria-hidden="true"
              title={`${presentCount} ${presentCount === 1 ? 'person' : 'people'} online`}
            >
              {presentCount > 9 ? '9+' : presentCount}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {roomAvatar.displayName}
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
                aria-label={`Leave ${roomAvatar.displayName} room`}
                title={`Leave ${roomAvatar.displayName}`}
              >
                <Icon name="close" size="sm" />
              </Button>
              {/* Room participant count */}
              <span
                className="text-xs text-gray-400"
                title={`${totalCount} total ${totalCount === 1 ? 'connection' : 'connections'}`}
              >
                {totalCount}
              </span>
            </div>
          </div>

          {typingText && (
            <div aria-live="polite">
              <TypingIndicators />
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default RoomListItem;
