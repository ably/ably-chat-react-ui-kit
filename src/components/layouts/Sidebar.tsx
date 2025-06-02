import React, { useState } from 'react';
import { ChatRoomProvider } from '@ably/chat/react';
import RoomListItem from '../molecules/RoomListItem';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Avatar from '../atoms/Avatar';
import DropdownMenu from '../molecules/DropdownMenu';
import CreateRoomModal from '../molecules/CreateRoomModal';
import { useTheme } from '../../hooks/useTheme';

interface SidebarProps {
  roomIds: string[];
  currentRoomId: string;
  onSelectRoom: (id: string) => void;
  onCreateRoom?: (roomName: string) => void;
  currentUserId: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  width?: string | number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  roomIds,
  currentRoomId,
  onSelectRoom,
  onCreateRoom,
  currentUserId,
  isCollapsed = false,
  onToggleCollapse,
  width = '20rem', // 320px default
}) => {
  const { theme, toggleTheme } = useTheme();
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const handleCreateRoom = async (roomName: string) => {
    if (onCreateRoom) {
      await onCreateRoom(roomName);
    }
  };

  const dropdownItems = [
    {
      id: 'create-room',
      label: 'Create Room',
      icon: '➕',
      onClick: () => setShowCreateRoomModal(true),
    },
  ];

  const getRoomDisplayName = (roomId: string) => {
    return roomId.replace(/^room-\d+-/, '').replace(/-/g, ' ');
  };

  const sidebarStyle = {
    width: isCollapsed ? '4rem' : typeof width === 'number' ? `${width}px` : width,
    transition: 'width 0.3s ease-in-out',
  };

  return (
    <aside
      className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full"
      style={sidebarStyle}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        {!isCollapsed ? (
          <>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Chats <span className="text-sm font-normal text-gray-500">({roomIds.length})</span>
            </h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                <Icon name={theme === 'dark' ? 'sun' : 'moon'} size="md" />
              </Button>
              <DropdownMenu
                trigger={
                  <Button variant="ghost" size="sm">
                    <Icon name="more" size="md" />
                  </Button>
                }
                items={dropdownItems}
              />
              {onToggleCollapse && (
                <Button variant="ghost" size="sm" onClick={onToggleCollapse}>
                  <Icon name="chevronleft" size="md" />
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size="md" />
            </Button>
            {onToggleCollapse && (
              <Button variant="ghost" size="sm" onClick={onToggleCollapse}>
                <Icon name="chevronright" size="md" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto">
        {isCollapsed ? (
          // Collapsed view - just avatars
          <div className="flex flex-col items-center gap-2 p-2">
            {roomIds.map((roomId) => {
              const roomName = getRoomDisplayName(roomId);
              return (
                <div
                  key={roomId}
                  className={`relative cursor-pointer transition-transform hover:scale-110 ${
                    roomId === currentRoomId ? 'ring-2 ring-blue-500 rounded-full' : ''
                  }`}
                  onClick={() => onSelectRoom(roomId)}
                  title={roomName}
                >
                  <Avatar
                    alt={roomName}
                    src={`https://via.placeholder.com/40?text=${encodeURIComponent(roomName)}`}
                    color="bg-gray-500"
                    size="md"
                  />

                  {/* Present indicator */}
                  {roomId === currentRoomId && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // Expanded view - full room list with real-time data
          roomIds.map((roomId) => (
            <ChatRoomProvider
              key={roomId}
              id={roomId}
              release={false}
              options={{
                occupancy: { enableEvents: true },
              }}
            >
              <RoomListItem
                room={roomId}
                selected={roomId === currentRoomId}
                onClick={() => onSelectRoom(roomId)}
                currentUserId={currentUserId}
              />
            </ChatRoomProvider>
          ))
        )}
      </div>

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={showCreateRoomModal}
        onClose={() => setShowCreateRoomModal(false)}
        onCreateRoom={handleCreateRoom}
      />
    </aside>
  );
};
