import React from 'react';
import { useOccupancy, useTyping } from '@ably/chat/react';
import Avatar, { AvatarData } from '../atoms/Avatar';
import TypingIndicators from './TypingIndicators.tsx';
import { useAvatar } from '../../context/AvatarContext';
import { useCurrentRoom } from '../../context/CurrentRoomContext.tsx';

interface RoomListItemProps {
  roomId: string;
  onClick: () => void;
  currentUserId: string;
  avatar?: AvatarData; // Optional avatar data for the room (from props)
}

/**
 * RoomListItem component displays a room in the sidebar
 * Uses the AvatarProvider to get room avatars
 */
const RoomListItem: React.FC<RoomListItemProps> = React.memo(
  ({ roomId, onClick, currentUserId, avatar: propAvatar }) => {
    const { currentRoomId } = useCurrentRoom();
    const { getAvatarForRoom } = useAvatar();

    // Get occupancy data
    const { connections, presenceMembers } = useOccupancy();
    // Get typing data
    const { currentlyTyping } = useTyping();

    // Get the room avatar from props or from the AvatarProvider
    const roomAvatar = propAvatar || getAvatarForRoom(roomId);

    const isSelected = roomId === currentRoomId;

    const isRoomActive = () => {
      // Check if anyone is present in the room
      return (presenceMembers || 0) > 0;
    };

    const getPresentCount = () => {
      return presenceMembers || 0;
    };

    const getTotalCount = () => {
      // Use connections that include both presence and other connections
      return connections || 0;
    };

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

    return (
      <div
        className={`flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800
                    cursor-pointer transition-colors
                    ${isSelected ? 'bg-gray-100 dark:bg-gray-800 border-r-2 border-blue-500' : ''}`}
        onClick={onClick}
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
          {isRoomActive() && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
          )}

          {/* Present count badge */}
          {getPresentCount() > 0 && (
            <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
              {getPresentCount() > 9 ? '9+' : getPresentCount()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {roomAvatar.displayName}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Room participant count */}
              <span className="text-xs text-gray-400">{getTotalCount()}</span>
            </div>
          </div>

          {typingText && <TypingIndicators />}
        </div>
      </div>
    );
  }
);

export default RoomListItem;
