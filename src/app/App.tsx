import React, { useCallback, useState } from 'react';
import { useChatClient } from '@ably/chat/react';
import { AppLayout } from '../components/layouts';
import { ChatSettingsProvider } from '../context';
import { Sidebar } from '../components/molecules/Sidebar.tsx';
import { ChatWindow } from '../components/molecules/ChatWindow.tsx';
import { RoomInfo, RoomReaction } from '../components/molecules';

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
  const chatClient = useChatClient();
  const [activeRoomName, setActiveRoomName] = useState<string | undefined>(undefined);
  const [defaultRoomOptions] = useState({ occupancy: { enableEvents: true } });

  // Function to handle room selection change
  const handleChangeSelectedRoom = useCallback((roomName?: string) => {
    setActiveRoomName(roomName);
  }, []);

  // Show loading state if no chat client yet
  if (!chatClient) {
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
    <ChatSettingsProvider>
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
        children={
          <ChatWindow
            activeRoomName={activeRoomName}
            attach={false}
            release={false}
            customHeaderContent={<RoomInfo />}
            customFooterContent={<RoomReaction />}
            defaultRoomOptions={defaultRoomOptions}
          />
        }
      ></AppLayout>
    </ChatSettingsProvider>
  );
};
