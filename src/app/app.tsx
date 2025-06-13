import { ConnectionStatus, RoomOptions } from '@ably/chat';
import { useChatConnection } from '@ably/chat/react';
import React, { useCallback, useState } from 'react';

import { AppLoading } from '../components/atoms/app-loading.tsx';
import { AppLayout } from '../components/layouts/app-layout.tsx';
import { ChatWindow } from '../components/molecules/chat-window.tsx';
import { RoomInfo } from '../components/molecules/room-info.tsx';
import { RoomReaction } from '../components/molecules/room-reaction.tsx';
import { Sidebar } from '../components/molecules/sidebar.tsx';

/**
 * Props for the App component.
 *
 * @property initialRoomNames - An optional array of room names to populate the sidebar initially.
 */
interface AppProps {
  initialRoomNames?: string[];
}

const DEFAULT_ROOM_OPTIONS: RoomOptions = {
  occupancy: { enableEvents: true },
};
/**
 * Main chat application component.
 *
 * @param props - The props for the App component.
 */
export const App: React.FC<AppProps> = ({ initialRoomNames }) => {
  const { currentStatus } = useChatConnection();
  const [roomNames, setRoomNames] = useState<string[]>(initialRoomNames || []);
  const [activeRoom, setActiveRoom] = useState<string | undefined>();

  // Function to handle room selection change
  const handleChangeSelectedRoom = useCallback((roomName?: string) => {
    setActiveRoom(roomName);
  }, []);

  const addRoom = useCallback((name: string) => {
    setRoomNames((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setActiveRoom(name);
  }, []);

  const leaveRoom = useCallback(
    (name: string) => {
      setRoomNames((prev) => {
        const next = prev.filter((n) => n !== name);
        if (next.length === 0) {
          setActiveRoom(undefined);
        } else {
          if (name === activeRoom) setActiveRoom(next[0]);
        }
        return next;
      });
    },
    [activeRoom]
  );

  // Show loading state if not connected (cannot make REST or WS Calls)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  if (currentStatus !== ConnectionStatus.Connected) {
    return <AppLoading />;
  }

  return (
    <AppLayout
      width="70vw"
      height="70vh"
      sidebar={
        <Sidebar
          roomNames={roomNames}
          addRoom={addRoom}
          defaultRoomOptions={DEFAULT_ROOM_OPTIONS}
          setActiveRoom={handleChangeSelectedRoom}
          leaveRoom={leaveRoom}
        />
      }
    >
      <ChatWindow
        activeRoomName={activeRoom}
        attach={false}
        release={false}
        customHeaderContent={<RoomInfo />}
        customFooterContent={<RoomReaction />}
        defaultRoomOptions={DEFAULT_ROOM_OPTIONS}
      />
    </AppLayout>
  );
};
