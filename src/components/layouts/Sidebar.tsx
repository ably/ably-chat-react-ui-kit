import React, { useState, useCallback, useMemo } from 'react';
import { ChatRoomProvider } from '@ably/chat/react';
import RoomListItem from '../molecules/RoomListItem';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Avatar from '../atoms/Avatar';
import DropdownMenu from '../molecules/DropdownMenu';
import CreateRoomModal from '../molecules/CreateRoomModal';
import { useTheme } from '../../hooks/useTheme';
import { useAvatar } from '../../context/AvatarContext.tsx';
import { useCurrentRoom } from '../../context/CurrentRoomContext';

// Memoized RoomListItem that uses context to determine if it's selected
const MemoizedRoomListItemWithContext: React.FC<{
  roomId: string;
  onClick: () => void;
  currentUserId: string;
}> = React.memo(({ roomId, onClick, currentUserId }) => {
  const currentRoomId = useCurrentRoom();
  const selected = roomId === currentRoomId;

  return (
    <RoomListItem
      room={roomId}
      selected={selected}
      onClick={onClick}
      currentUserId={currentUserId}
    />
  );
});

// Add a tiny memoised component that *does* consume the context
const CollapsedAvatarStrip: React.FC<{
  roomIds: string[];
  onSelectRoom: (id: string) => void;
}> = React.memo(({ roomIds, onSelectRoom }) => {
  const currentRoomId = useCurrentRoom(); // context read lives here
  const { getAvatarForRoom } = useAvatar();
  return (
    <div className="flex flex-col items-center gap-2 p-2">
      {roomIds.map((roomId) => {
        const { src, color, initials } = getAvatarForRoom(roomId, roomId); // or helper
        const selected = roomId === currentRoomId;

        return (
          <div
            key={roomId}
            className={`relative cursor-pointer transition-transform hover:scale-110 ${
              selected ? 'ring-2 ring-blue-500 rounded-full' : ''
            }`}
            onClick={() => onSelectRoom(roomId)}
            title={roomId}
          >
            <Avatar alt={roomId} src={src} color={color} size="md" initials={initials} />
            {selected && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
            )}
          </div>
        );
      })}
    </div>
  );
});

interface SidebarProps {
  roomIds: string[];
  onSelectRoom: (id: string) => void;
  onCreateRoom?: (roomName: string) => void;
  currentUserId: string;
  width?: string | number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  roomIds,
  onSelectRoom,
  onCreateRoom,
  currentUserId,
  width = '20rem', // 320px default
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  console.log('[RENDER] Sidebar', { roomIds, currentUserId, isCollapsed });
  const { theme, toggleTheme } = useTheme();
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);

  // Handle toggle collapse
  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  // Memoize the handleCreateRoom function to prevent unnecessary re-renders
  const handleCreateRoom = useCallback(
    async (roomName: string) => {
      if (onCreateRoom) {
        onCreateRoom(roomName);
      }
    },
    [onCreateRoom]
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
        {isCollapsed ? (
          /* Collapsed view – just avatars */
          <CollapsedAvatarStrip roomIds={roomIds} onSelectRoom={onSelectRoom} />
        ) : (
          /* Expanded view – full room list */
          <div>
            {roomIds.map((roomId) => (
              <ChatRoomProvider
                key={roomId}
                id={roomId}
                release={false}
                options={{ occupancy: { enableEvents: true } }}
              >
                <MemoizedRoomListItemWithContext
                  roomId={roomId}
                  onClick={() => onSelectRoom(roomId)}
                  currentUserId={currentUserId}
                />
              </ChatRoomProvider>
            ))}
          </div>
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
