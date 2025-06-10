import React, { useState, useCallback, useMemo } from 'react';
import { ChatRoomProvider, useChatClient } from '@ably/chat/react';
import { RoomListItem } from './RoomListItem.tsx';
import { Button } from '../atoms/Button.tsx';
import { Icon } from '../atoms/Icon.tsx';
import { DropdownMenu } from './DropdownMenu.tsx';
import { CreateRoomModal } from './CreateRoomModal.tsx';
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
  /** Default options for new rooms */
  defaultRoomOptions?: RoomOptions;
  /** Callback when the active room changes */
  onChangeActiveRoom: (roomName?: string) => void;
  /** Additional CSS classes for the sidebar */
  className?: string;
  /** Whether the sidebar is collapsed (controlled by layout) */
  isCollapsed?: boolean;
  /** Handler for toggling collapse (provided by layout) */
  onToggleCollapse?: () => void;
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
 * <SidebarLayout
 *   sidebar={
 *   <Sidebar
 *   initialRoomNames={['general', 'random']}
 *   activeRoomName="general"
 *   onChangeActiveRoom={handleRoomChange}/>
 *   }>
 *   </SidebarLayout>
 *
 * @example
 * // With custom width and styling
 * <Sidebar
 *   className="shadow-lg"
 *   onChangeActiveRoom={handleRoomChange}
 * />
 */
export const Sidebar: React.FC<SidebarProps> = ({
  initialRoomNames = [],
  defaultRoomOptions,
  activeRoomName,
  onChangeActiveRoom,
  className = '',
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [roomNames, setRoomNames] = useState<string[]>(initialRoomNames);
  const { theme, toggleTheme } = useTheme();
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const { getAvatarForRoom } = useAvatar();
  const chatClient = useChatClient();

  // ... rest of your room management logic stays the same ...
  const handleLeaveRoom = useCallback(
    async (roomNameToLeave: string) => {
      try {
        await chatClient.rooms.release(roomNameToLeave);
        setRoomNames((prevRoomNames) => {
          const newRoomNames = prevRoomNames.filter((id) => id !== roomNameToLeave);
          if (roomNameToLeave === activeRoomName) {
            if (newRoomNames.length > 0) {
              onChangeActiveRoom(newRoomNames[0]);
            } else {
              onChangeActiveRoom(undefined);
            }
          }
          return newRoomNames;
        });
      } catch (error) {
        console.error('Failed to release room:', error);
      }
    },
    [activeRoomName, onChangeActiveRoom, chatClient]
  );

  const handleCreateRoom = useCallback(
    async (roomName: string) => {
      setRoomNames((prevRoomNames) => {
        if (prevRoomNames.includes(roomName)) {
          onChangeActiveRoom(roomName);
          return prevRoomNames;
        }
        getAvatarForRoom(roomName);
        onChangeActiveRoom(roomName);
        return [...prevRoomNames, roomName];
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

  return (
    <aside
      className={clsx(
        'bg-white dark:bg-gray-900',
        'border-r border-gray-200 dark:border-gray-800',
        'flex flex-col h-full',
        className
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        {!isCollapsed ? (
          <>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Chats <span className="text-sm font-normal text-gray-500">({roomNames.length})</span>
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
        <div>
          {roomNames.map((roomName) => (
            <ChatRoomProvider
              key={roomName}
              name={roomName}
              attach={true}
              release={true}
              options={defaultRoomOptions}
            >
              <RoomListItem
                key={roomName}
                roomName={roomName}
                isSelected={roomName === activeRoomName}
                onClick={() => onChangeActiveRoom(roomName)}
                onLeave={() => handleLeaveRoom(roomName)}
                isCollapsed={isCollapsed}
              />
            </ChatRoomProvider>
          ))}
        </div>
      </div>

      <CreateRoomModal
        isOpen={showCreateRoomModal}
        onClose={() => setShowCreateRoomModal(false)}
        onCreateRoom={handleCreateRoom}
      />
    </aside>
  );
};
