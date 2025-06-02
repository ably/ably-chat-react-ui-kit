import React from 'react';
import { useOccupancy, useTyping } from '@ably/chat/react';
import Avatar from '../atoms/Avatar';

interface RoomListItemProps {
  room: string; // Now just the roomId
  selected: boolean;
  onClick: () => void;
  currentUserId: string;
}

const RoomListItem: React.FC<RoomListItemProps> = ({
  room: roomId,
  selected,
  onClick,
  currentUserId,
}) => {
  // Get real-time occupancy data
  const { connections, presenceMembers } = useOccupancy();

  // Get real-time typing data
  const { currentlyTyping } = useTyping();

  // Helper functions for display
  const getRoomDisplayName = () => {
    return roomId.replace(/^room-\d+-/, '').replace(/-/g, ' ');
  };

  const getRoomAvatarColor = () => {
    // Generate consistent color for rooms
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-green-500',
      'bg-orange-500',
      'bg-red-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-teal-500',
      'bg-cyan-500',
      'bg-emerald-500',
      'bg-violet-500',
    ];
    let hash = 0;
    const roomName = getRoomDisplayName();
    for (let i = 0; i < roomName.length; i++) {
      hash = ((hash << 5) - hash + roomName.charCodeAt(i)) & 0xffffffff;
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getRoomInitials = () => {
    const name = getRoomDisplayName();
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const isRoomActive = () => {
    // Check if anyone is present in the room using real-time data
    return (presenceMembers || 0) > 0;
  };

  const getPresentCount = () => {
    // Use real-time presence count from SDK
    return presenceMembers || 0;
  };

  const getTotalCount = () => {
    // Use real-time connection count from SDK
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
      className={`flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
        selected ? 'bg-gray-100 dark:bg-gray-800 border-r-2 border-blue-500' : ''
      }`}
      onClick={onClick}
    >
      <div className="relative">
        <Avatar
          alt={getRoomDisplayName()}
          color={getRoomAvatarColor()}
          size="md"
          initials={getRoomInitials()}
        />

        {/* Present indicator */}
        {isRoomActive() && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
        )}

        {/* Present count badge for group rooms */}
        {getPresentCount() > 0 && (
          <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
            {getPresentCount() > 9 ? '9+' : getPresentCount()}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {getRoomDisplayName()}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Room participant count */}
            <span className="text-xs text-gray-400">{getTotalCount()}</span>
          </div>
        </div>

        {/* Show typing indicator */}
        {typingText && (
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 italic">{typingText}</p>
        )}
      </div>
    </div>
  );
};

export default RoomListItem;
