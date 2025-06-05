import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { ChatRoomProvider, useRoom } from '@ably/chat/react';
import RoomListItem from '../molecules/RoomListItem';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Avatar from '../atoms/Avatar';
import DropdownMenu from '../molecules/DropdownMenu';
import CreateRoomModal from '../molecules/CreateRoomModal';
import { useTheme } from '../../hooks/useTheme';
import { useAvatar } from '../../context/AvatarContext.tsx';
import { useCurrentRoom } from '../../context/CurrentRoomContext';

// CollapsedRoomAvatar functionality has been moved into RoomListItem component

// Sidebar component props definition
interface SidebarProps {
  initialRoomIds?: string[];
  currentUserId: string;
  width?: string | number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  initialRoomIds = [], // Default to empty array
  currentUserId,
  width = '20rem', // 320px default
}) => {
  // Local state for room IDs
  const [roomIds, setRoomIds] = useState<string[]>(initialRoomIds);
  // ref to store the room IDs to avoid unnecessary re-renders
  const roomIdsRef = useRef<string[]>(initialRoomIds);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  console.log('[RENDER] Sidebar', { roomIds, currentUserId, isCollapsed });
  const { theme, toggleTheme } = useTheme();
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const { setCurrentRoom } = useCurrentRoom();
  const { getAvatarForRoom } = useAvatar();

  // Handle room selection
  const handleSelectRoom = useCallback(
    (roomId: string) => {
      setCurrentRoom(roomId);
    },
    [setCurrentRoom]
  );

  // Handle toggle collapse
  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  // Memoize the handleCreateRoom function to prevent unnecessary re-renders
  const handleCreateRoom = useCallback(
    async (roomName: string) => {
      // Check if the room already exists, and switch to it if it does
      if (roomIdsRef.current.includes(roomName)) {
        setCurrentRoom(roomName);
        return;
      }

      // Add new room and select it
      getAvatarForRoom(roomName); // Ensure avatar is created for the new room
      setRoomIds((prev) => [...prev, roomName]);
      setCurrentRoom(roomName);
    },
    [setCurrentRoom, getAvatarForRoom]
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
              options={{ occupancy: { enableEvents: true } }}
            >
              {/* Use RoomListItem for both collapsed and expanded views */}
              <RoomListItem
                roomId={roomId}
                onClick={() => handleSelectRoom(roomId)}
                currentUserId={currentUserId}
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
