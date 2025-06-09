import React, { useState, useCallback, useMemo } from 'react';
import { ChatRoomProvider, useChatClient } from '@ably/chat/react';
import { RoomListItem } from '../molecules/RoomListItem';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { DropdownMenu } from '../molecules/DropdownMenu';
import { CreateRoomModal } from '../molecules/CreateRoomModal';
import { useTheme } from '../../hooks';
import { useAvatar } from '../../context/AvatarContext.tsx';
import { RoomOptions } from '@ably/chat';

// Sidebar component props definition
export interface SidebarProps {
  initialRoomNames?: string[];
  activeRoomName?: string; // Optional, can be undefined if no room is selected
  width?: string | number;
  onChangeActiveRoom: (roomId?: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  initialRoomNames = [], // Default to empty array
  width = '20rem', // 320px default
  activeRoomName,
  onChangeActiveRoom,
}) => {
  // Local state for room IDs
  const [roomIds, setRoomIds] = useState<string[]>(initialRoomNames);
  const [defaultRoomOptions] = useState<RoomOptions>({ occupancy: { enableEvents: true } });
  // ref to store the room IDs to avoid unnecessary re-renders
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const { theme, toggleTheme } = useTheme();
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const { getAvatarForRoom } = useAvatar();
  const chatClient = useChatClient();

  // Handle toggle collapse
  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  // Update handleLeaveRoom (remove ref updates):
  const handleLeaveRoom = useCallback(
    async (roomIdToLeave: string) => {
      try {
        await chatClient.rooms.release(roomIdToLeave);

        setRoomIds((prevRoomIds) => {
          const newRoomIds = prevRoomIds.filter((id) => id !== roomIdToLeave);

          // Handle active room switching
          if (roomIdToLeave === activeRoomName) {
            if (newRoomIds.length > 0) {
              onChangeActiveRoom(newRoomIds[0]);
            } else {
              onChangeActiveRoom(undefined);
            }
          }

          return newRoomIds;
        });
      } catch (error) {
        console.error('Failed to release room:', error);
      }
    },
    [activeRoomName, onChangeActiveRoom, chatClient]
  );

  // Update handleCreateRoom:
  const handleCreateRoom = useCallback(
    async (roomName: string) => {
      setRoomIds((prevRoomIds) => {
        // Check if the room already exists using the current state
        if (prevRoomIds.includes(roomName)) {
          onChangeActiveRoom(roomName);
          return prevRoomIds; // No state change needed
        }

        // Add new room
        getAvatarForRoom(roomName);
        onChangeActiveRoom(roomName);
        return [...prevRoomIds, roomName];
      });
    },
    [onChangeActiveRoom, getAvatarForRoom]
  );

  // Memoize the dropdownItems array to prevent it from being recreated on every render
  const dropdownItems = useMemo(
    () => [
      {
        id: 'create-room',
        label: 'Create Room',
        icon: '➕',
        onClick: () => setShowCreateRoomModal(true),
      },
    ],
    []
  );

  // Memoize the sidebarStyle object to prevent it from being recreated on every render
  const sidebarStyle = useMemo(
    () => ({
      width: isCollapsed ? '4rem' : typeof width === 'number' ? `${width}px` : width,
      transition: 'width 0.3s ease-in-out',
    }),
    [isCollapsed, width]
  );

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
              <Button variant="ghost" size="sm" onClick={handleToggleCollapse}>
                <Icon name="chevronleft" size="md" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size="md" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleToggleCollapse}>
              <Icon name="chevronright" size="md" />
            </Button>
          </div>
        )}
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto">
        <div>
          {roomIds.map((roomId) => (
            <ChatRoomProvider
              key={roomId}
              name={roomId}
              attach={false}
              release={false}
              options={defaultRoomOptions}
            >
              {/* Use RoomListItem for both collapsed and expanded views */}
              <RoomListItem
                key={roomId}
                roomId={roomId}
                isSelected={roomId === activeRoomName}
                onClick={() => onChangeActiveRoom(roomId)}
                onLeave={() => handleLeaveRoom(roomId)}
                isCollapsed={isCollapsed}
              />
            </ChatRoomProvider>
          ))}
        </div>
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
