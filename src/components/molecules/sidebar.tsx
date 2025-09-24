import { RoomOptions } from '@ably/chat';
import { clsx } from 'clsx';
import React, { useState } from 'react';

import { useTheme } from '../../hooks/use-theme.tsx';
import { Button } from '../atoms/button.tsx';
import { Icon } from '../atoms/icon.tsx';
import { CreateRoomModal } from './create-room-modal.tsx';
import { DropdownMenu } from './dropdown-menu.tsx';
import { RoomList } from './room-list.tsx';

/**
 * Props for the Sidebar component
 */
export interface SidebarProps {
  /** Rooms to display. */
  roomNames: string[];
  /** Currently-active room (optional). */
  activeRoomName?: string;
  /** Ably options passed to each `ChatRoomProvider`. */
  defaultRoomOptions?: RoomOptions;
  /** Adds (or joins) a room. Should also set it active, if desired. */
  addRoom: (name: string) => void;
  /** Sets the active room. Pass `undefined` to clear. */
  setActiveRoom: (name?: string) => void;
  /** Leaves a room (and handles provider release if needed). */
  leaveRoom: (name: string) => void;
  /** Optional CSS class names for additional styling. */
  className?: string;
  /** Whether the sidebar is in collapsed mode (avatar-only). */
  isCollapsed?: boolean;
  /** Callback to toggle the collapsed state. */
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
 * const [rooms, setRooms]   = useState<string[]>([]);
 * const [active, setActive] = useState<string>();
 *
 * const addRoom   = (name: string) => setRooms(r => r.includes(name) ? r : [...r, name]);
 * const leaveRoom = (name: string) => setRooms(r => r.filter(n => n !== name));
 *
 * <Sidebar
 *   roomNames={rooms}
 *   activeRoomName={active}
 *   defaultRoomOptions={{ rewind: 50 }}
 *   addRoom={addRoom}
 *   setActiveRoom={setActive}
 *   leaveRoom={leaveRoom}
 * />
 */
export const Sidebar = ({
  roomNames,
  activeRoomName,
  defaultRoomOptions,
  addRoom,
  setActiveRoom,
  leaveRoom,
  className = '',
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className={clsx('ably-sidebar', className)}>
      {/* Header */}
      <div className="ably-sidebar__header">
        {isCollapsed ? (
          <div className="ably-sidebar__header-collapsed">
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size="md" />
            </Button>
            {onToggleCollapse && (
              <Button variant="ghost" size="sm" onClick={onToggleCollapse}>
                <Icon name="chevronright" size="md" />
              </Button>
            )}
          </div>
        ) : (
          <>
            <h1 className="ably-sidebar__title">
              Chats <span className="ably-sidebar__count">({roomNames.length})</span>
            </h1>

            <div className="ably-sidebar__actions">
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                <Icon name={theme === 'dark' ? 'sun' : 'moon'} size="md" />
              </Button>

              <DropdownMenu
                trigger={
                  <Button variant="ghost" size="sm">
                    <Icon name="more" size="md" />
                  </Button>
                }
                items={[
                  {
                    id: 'create-room',
                    label: 'Create Room',
                    icon: '➕',
                    onClick: () => {
                      setShowCreateModal(true);
                    },
                  },
                ]}
              />

              {onToggleCollapse && (
                <Button variant="ghost" size="sm" onClick={onToggleCollapse}>
                  <Icon name="chevronleft" size="md" />
                </Button>
              )}
            </div>
          </>
        )}
      </div>

      <div className="ably-sidebar__content">
        <RoomList
          roomNames={roomNames}
          activeRoomName={activeRoomName}
          defaultRoomOptions={defaultRoomOptions}
          onSelect={setActiveRoom}
          onLeave={leaveRoom}
          isCollapsed={isCollapsed}
        />
      </div>
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
        }}
        onCreateRoom={(name) => {
          addRoom(name);
          setShowCreateModal(false);
        }}
      />
    </aside>
  );
};

Sidebar.displayName = 'Sidebar';
