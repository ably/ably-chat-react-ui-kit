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
import clsx from 'clsx';

/**
 * Props for the Sidebar component
 */
export interface SidebarProps {
  /** Initial list of room names to display */
  initialRoomNames?: string[];
  /** Currently active/selected room name */
  activeRoomName?: string;
  /** Width of the sidebar (CSS value or pixels) */
  width?: string | number;
  /** Callback when the active room changes */
  onChangeActiveRoom: (roomId?: string) => void;
  /** Additional CSS classes for the sidebar */
  className?: string;
}

/**
 * Sidebar component provides room navigation and management
 *
 * Features:
 * - Collapsible interface with avatar-only mode
 * - Room creation and management
 * - Theme toggle integration
 * - Active room highlighting
 * - Room count display
 *
 * @example
 * // Basic usage
 * <Sidebar
 *   initialRoomNames={['general', 'random']}
 *   activeRoomName="general"
 *   onChangeActiveRoom={handleRoomChange}
 * />
 *
 * @example
 * // With custom width and styling
 * <Sidebar
 *   width="300px"
 *   className="shadow-lg"
 *   onChangeActiveRoom={handleRoomChange}
 * />
 */
export const Sidebar: React.FC<SidebarProps> = ({
  initialRoomNames = [], // Default to empty array
  width = '20rem', // 320px default
  activeRoomName,
  onChangeActiveRoom,
  className = '',
}) => {
  const [roomIds, setRoomIds] = useState<string[]>(initialRoomNames);
  const [defaultRoomOptions] = useState<RoomOptions>({ occupancy: { enableEvents: true } });
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const { theme, toggleTheme } = useTheme();
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const { getAvatarForRoom } = useAvatar();
  const chatClient = useChatClient();

  // Handle toggle collapse
  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  // Handle leave room
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

  // Handle creating a new room
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

  const dropdownItems = [
    {
      id: 'create-room',
      label: 'Create Room',
      icon: '➕',
      onClick: () => setShowCreateRoomModal(true),
    },
  ];

  const sidebarStyle = {
    width: isCollapsed ? '4rem' : typeof width === 'number' ? `${width}px` : width,
    transition: 'width 0.3s ease-in-out',
  };

  return (
    <aside
      className={clsx(
        'bg-white dark:bg-gray-900',
        'border-r border-gray-200 dark:border-gray-800',
        'flex flex-col h-full',
        className
      )}
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
              attach={true}
              release={true}
              options={defaultRoomOptions}
            >
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
