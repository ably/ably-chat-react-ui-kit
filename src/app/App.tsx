import React, { useCallback, useState } from 'react';
import { ThemeProvider } from '../context/ThemeContext.tsx';
import { useChatClient } from '@ably/chat/react';
import { AppLayout } from '../components/layouts';
import { Sidebar } from '../components/layouts';
import { ChatArea } from '../components/layouts/ChatArea';
import { AvatarProvider } from '../context/AvatarContext';

/**
 * Main chat application component
 */
const ChatApp: React.FC = () => {
  const chatClient = useChatClient();
  const [initialRoomNames] = useState<string[]>(['my-first-room']);
  const [activeRoomName, setActiveRoomName] = useState<string | undefined>(undefined);

  // Function to handle room selection change
  const handleChangeSelectedRoom = useCallback((roomName?: string) => {
    setActiveRoomName(roomName);
  }, []);

  // Show loading state if no chat client yet
  if (!chatClient) {
    return (
      <ThemeProvider>
        <AppLayout width="50vw" height="50vh">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Connecting to Ably Chat...</p>
            </div>
          </div>
        </AppLayout>
      </ThemeProvider>
    );
  }

  // TODO: Context provider for chat window (feature flags, edit/delete etc..)
  return (
    <ThemeProvider options={{ persist: true, defaultTheme: 'light' }}>
      <AppLayout width="70vw" height="70vh">
        <Sidebar
          initialRoomNames={initialRoomNames}
          onChangeActiveRoom={handleChangeSelectedRoom}
          activeRoomName={activeRoomName}
        />
        <ChatArea activeRoomName={activeRoomName} />
      </AppLayout>
    </ThemeProvider>
  );
};

/**
 * Main application component
 * Wraps the ChatApp with AvatarProvider for centralized avatar management
 */
export const App: React.FC = React.memo(() => {
  return (
    <AvatarProvider>
      <ChatApp />
    </AvatarProvider>
  );
});
