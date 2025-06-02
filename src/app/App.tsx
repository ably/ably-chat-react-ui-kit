import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ThemeProvider } from '../context/ThemeContext.tsx';
import { useChatClient, ChatRoomProvider, useRoom } from '@ably/chat/react';
import { AppLayout, Sidebar, ChatWindow } from '../components/layouts';

const ChatWindowWithRoom = React.memo(({ roomId }: { roomId: string }) => {
  const { room } = useRoom();

  // Don't render until room is ready
  if (!room || !roomId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full">
      <ChatWindow roomId={roomId} />
    </div>
  );
});

const ChatApp: React.FC = () => {
  const chatClient = useChatClient();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [roomIds, setRoomIds] = useState<string[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  // Cleanup all rooms when component unmounts (only run on unmount)
  useEffect(() => {
    return () => {
      // Release all rooms on unmount
      if (chatClient) {
        // Get the current roomIds at cleanup time
        setRoomIds((currentRoomIds) => {
          currentRoomIds.forEach((roomId) => {
            try {
              chatClient.rooms.release(roomId);
            } catch (error) {
              console.warn(`Failed to release room ${roomId}:`, error);
            }
          });
          return currentRoomIds;
        });
      }
    };
  }, [chatClient]); // Only depend on chatClient, not roomIds

  // Memoize callback functions to prevent unnecessary re-renders
  const handleSelectRoom = useCallback((roomId: string) => {
    setCurrentRoomId(roomId);
  }, []);

  const handleCreateRoom = useCallback(async (roomName: string) => {
    const newRoomId = `room-${Date.now()}-${roomName.toLowerCase().replace(/\s+/g, '-')}`;
    setRoomIds((prev) => [...prev, newRoomId]);
    setCurrentRoomId(newRoomId);
  }, []);

  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

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
      <AppLayout width="50vw" height="50vh">
        <Sidebar
          roomIds={roomIds}
          currentRoomId={currentRoomId || ''}
          onSelectRoom={handleSelectRoom}
          onCreateRoom={handleCreateRoom}
          currentUserId={chatClient.clientId}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
        {currentRoomId ? (
          <ChatRoomProvider
            key={currentRoomId}
            id={currentRoomId}
            release={false}
            options={chatRoomOptions}
          >
            <ChatWindowWithRoom roomId={currentRoomId} />
          </ChatRoomProvider>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Select a room to start chatting
              </h3>
              <p className="text-gray-500">Choose a room from the sidebar or create a new one</p>
            </div>
          </div>
        )}
      </AppLayout>
    </ThemeProvider>
  );
};

// Root App Component with Providers
export const App: React.FC = () => {
  return <ChatApp />;
};
