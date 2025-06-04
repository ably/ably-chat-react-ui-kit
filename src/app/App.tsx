import React, { useMemo } from 'react';
import { ThemeProvider } from '../context/ThemeContext.tsx';
import { useChatClient } from '@ably/chat/react';
import { AppLayout } from '../components/layouts';
import { Sidebar } from '../components/layouts';
import { ChatArea } from '../components/layouts/ChatArea';
import { AvatarProvider } from '../context/AvatarContext';
import { CurrentRoomProvider } from '../context/CurrentRoomContext';

// Memoize the Sidebar component to prevent unnecessary re-renders
const MemoizedSidebar = React.memo(Sidebar);

// ChatWindowWithRoom has been moved to ChatArea.tsx

/**
 * Main chat application component
 * Uses AvatarProvider for centralized avatar management
 */
const ChatApp: React.FC = () => {
  console.log('[RENDER] ChatApp');
  const chatClient = useChatClient();

  // Memoize the ChatRoomProvider options to prevent recreating on every render
  const chatRoomOptions = useMemo(
    () => ({
      occupancy: { enableEvents: true },
    }),
    []
  );

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

  return (
    <ThemeProvider>
      <CurrentRoomProvider>
        <AppLayout width="50vw" height="50vh">
          <MemoizedSidebar currentUserId={chatClient.clientId} />
          <ChatArea chatRoomOptions={chatRoomOptions} />
        </AppLayout>
      </CurrentRoomProvider>
    </ThemeProvider>
  );
};

/**
 * Main application component
 * Wraps the ChatApp with AvatarProvider for centralized avatar management
 * Memoized to prevent unnecessary re-renders
 */
export const App: React.FC = React.memo(() => {
  console.log('[RENDER] App');
  return (
    <AvatarProvider>
      <ChatApp />
    </AvatarProvider>
  );
});
