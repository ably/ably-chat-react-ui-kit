import { RoomOptions } from '@ably/chat';
import { ChatRoomProvider } from '@ably/chat/react';
import React from 'react';

import { RoomListItem } from './room-list-item.tsx';

/**
 * Props for the RoomList component
 */
export interface RoomListProps {
  /** Array of room names to render. */
  roomNames: string[];
  /** Currently selected room. */
  activeRoomName?: string;
  /** Ably chat options applied to each `ChatRoomProvider`. */
  defaultRoomOptions?: RoomOptions;

  /** Fires when the user clicks a room. */
  onSelect: (roomName: string) => void;
  /** Fires when the user clicks the “leave” action. */
  onLeave: (roomName: string) => void;

  /** Collapsed (avatar-only) rendering mode. */
  isCollapsed?: boolean;
}

/**
 * RoomList component
 *
 * Component that renders a list of chat rooms. It displays each room as a clickable item
 * with an avatar, name, and action buttons for selecting or leaving the room. It also
 * allows for collapsed rendering mode where only the avatar is shown.
 * Each room is wrapped in a `ChatRoomProvider`, rooms will automatically attach/(detach & release) on mount/unmount.
 *
 * @example
 * <RoomList
 *   roomNames={['room1', 'room2', 'room3']}
 *   onSelect={(roomName) => console.log('Selected:', roomName)}
 *   onLeave={(roomName) => console.log('Left:', roomName)}
 * />
 *
 * @example
 * // Collapsed mode for narrow sidebars
 * <RoomList
 *   roomNames={['general', 'random']}
 *   activeRoomName="general"
 *   isCollapsed={true}
 *   onSelect={setActiveRoom}
 *   onLeave={handleLeaveRoom}
 * />
 *
 */
export const RoomList = ({
  roomNames,
  activeRoomName,
  defaultRoomOptions,
  onSelect,
  onLeave,
  isCollapsed = false,
}: RoomListProps) => (
  <>
    {roomNames.map((roomName) => (
      <ChatRoomProvider key={roomName} name={roomName} options={defaultRoomOptions}>
        <RoomListItem
          roomName={roomName}
          isSelected={roomName === activeRoomName}
          isCollapsed={isCollapsed}
          onClick={() => {
            onSelect(roomName);
          }}
          onLeave={() => {
            onLeave(roomName);
          }}
        />
      </ChatRoomProvider>
    ))}
  </>
);

RoomList.displayName = 'RoomList';
