import { ConnectionStatus, RoomOptions } from '@ably/chat';
import { ChatRoomProvider, useChatConnection } from '@ably/chat/react';
import { clsx } from 'clsx';
import React, { useCallback, useMemo, useState } from 'react';

import { AppLoading } from '../components/atoms/app-loading.tsx';
import { ChatWindow } from '../components/molecules/chat-window.tsx';
import { EmptyState } from '../components/molecules/empty-state.tsx';
import { RoomInfo } from '../components/molecules/room-info.tsx';
import { RoomReaction } from '../components/molecules/room-reaction.tsx';
import { Sidebar } from '../components/molecules/sidebar.tsx';

/**
 * Props for the App component.
 *
 * @property initialRoomNames - An optional array of room names to populate the sidebar initially.
 * @property width - Width of the app container (default: '70vw')
 * @property height - Height of the app container (default: '70vh')
 */
interface AppProps {
  initialRoomNames?: string[];
  width?: string | number;
  height?: string | number;
}


const DEFAULT_ROOM_OPTIONS: RoomOptions = {
  occupancy: { enableEvents: true },
};

/**
 * Main chat application component.
 *
 * @param props - The props for the App component.
 */
export const App = ({initialRoomNames, width = '70vw', height = '70vh' }: AppProps) => {
  const { currentStatus } = useChatConnection();
  const [roomNames, setRoomNames] = useState<string[]>(initialRoomNames || []);
  const [activeRoom, setActiveRoom] = useState<string | undefined>();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);


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

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev);
  }, []);

  // Memoize the container style
  const containerStyle = useMemo(
    () => ({
      width: typeof width === 'number' ? `${String(width)}px` : width,
      height: typeof height === 'number' ? `${String(height)}px` : height,
    }),
    [width, height]
  );


  // Show loading state if not connected (cannot make REST or WS Calls)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  if (currentStatus !== ConnectionStatus.Connected) {
    return <AppLoading />;
  }

  return (
    <div
      className={clsx(
        // Layout fundamentals
        'flex',
        // Theme and colors
        'bg-gray-50 dark:bg-gray-950',
        'text-gray-900 dark:text-gray-100',
        // Positioning and overflow
        'overflow-hidden',
        // Visual styling
        'border border-gray-200 dark:border-gray-700',
        'rounded-lg shadow-lg',
        // Centering
        'mx-auto my-8'
      )}
      style={containerStyle}
      role="main"
      aria-label="Main chat application"
    >
      {/* Sidebar */}
      <div
        className={clsx(
          'flex-shrink-0',
          'transition-all duration-300 ease-in-out',
          isSidebarCollapsed ? 'w-16' : 'w-64 md:w-72 lg:w-80'
        )}
      >
        <Sidebar
          roomNames={roomNames}
          addRoom={addRoom}
          defaultRoomOptions={DEFAULT_ROOM_OPTIONS}
          setActiveRoom={handleChangeSelectedRoom}
          leaveRoom={leaveRoom}
          activeRoomName={activeRoom}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
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
      </main>
    </div>
  );
};
