import { ConnectionStatus, RoomOptions } from '@ably/chat';
import { ChatRoomProvider, useChatConnection } from '@ably/chat/react';
import React, { useCallback, useState } from 'react';

import { AppLoading } from '../components/atoms/app-loading.tsx';
import { AppLayout } from '../components/layouts/app-layout.tsx';
import { ChatWindow } from '../components/molecules/chat-window.tsx';
import { EmptyState } from '../components/molecules/empty-state.tsx';
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
      {/* Render the active chat window if a room is selected, otherwise show empty state */}
      {activeRoom ? (
        <ChatRoomProvider
          key={activeRoom}
          name={activeRoom}
          attach={false}
          release={false}
          options={DEFAULT_ROOM_OPTIONS}
        >
          <ChatWindow
            roomName={activeRoom}
            customHeaderContent={<RoomInfo />}
            customFooterContent={<RoomReaction />}
          />
        </ChatRoomProvider>
      ) : (
        <div className="flex flex-col h-full">
          <EmptyState
            icon={
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            }
            title={'Select a room to start chatting'}
            message={'Choose a room or create a new one to begin your conversation'}
            ariaLabel="No chat room selected"
          />
        </div>
      )}
    </AppLayout>
  );
};
