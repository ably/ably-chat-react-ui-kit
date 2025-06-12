import { ConnectionStatus } from '@ably/chat';
import { useChatConnection } from '@ably/chat/react';
import React, { useCallback, useState } from 'react';

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

/**
 * Main chat application component.
 *
 * @param props - The props for the App component.
 */
export const App: React.FC<AppProps> = ({ initialRoomNames }) => {
  const { currentStatus } = useChatConnection();
  const [activeRoomName, setActiveRoomName] = useState<string | undefined>();
  const [defaultRoomOptions] = useState({ occupancy: { enableEvents: true } });

  // Function to handle room selection change
  const handleChangeSelectedRoom = useCallback((roomName?: string) => {
    setActiveRoomName(roomName);
  }, []);

  // Show loading state if not connected (cannot make REST or WS Calls)
  // TODO: Fix enum comparison
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  if (currentStatus !== ConnectionStatus.Connected) {
    return (
      <AppLayout width="50vw" height="50vh">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Connecting to Ably Chat...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      width="70vw"
      height="70vh"
      sidebar={
        <Sidebar
          initialRoomNames={initialRoomNames}
          defaultRoomOptions={defaultRoomOptions}
          onChangeActiveRoom={handleChangeSelectedRoom}
          activeRoomName={activeRoomName}
        />
      }
    >
      <ChatWindow
        activeRoomName={activeRoomName}
        attach={false}
        release={false}
        customHeaderContent={<RoomInfo />}
        customFooterContent={<RoomReaction />}
        defaultRoomOptions={defaultRoomOptions}
      />
    </AppLayout>
  );
};
