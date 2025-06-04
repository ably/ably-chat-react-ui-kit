import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ThemeProvider } from '../context/ThemeContext.tsx';
import { useChatClient, ChatRoomProvider, useRoom } from '@ably/chat/react';
import { AppLayout, Sidebar, ChatWindow } from '../components/layouts';
import { AvatarData } from '../components/atoms/Avatar';
import { AvatarProvider, useAvatar } from '../context/AvatarContext';

/**
 * ChatWindowWithRoom component that wraps the ChatWindow with a ChatRoomProvider
 * Uses the AvatarProvider to get room avatars
 */
const ChatWindowWithRoom = React.memo(({ roomId }: { roomId: string }) => {
  const { room } = useRoom();
  const { getAvatarForRoom } = useAvatar();

  // Get the room avatar from the AvatarProvider
  const roomAvatar = getAvatarForRoom(roomId);

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
      <ChatWindow roomId={roomId} roomAvatar={roomAvatar} />
    </div>
  );
});

/**
 * Main chat application component
 * Uses AvatarProvider for centralized avatar management
 */
const ChatApp: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [roomIds, setRoomIds] = useState<string[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const chatClient = useChatClient();
  const { getAvatarForRoom, getRoomAvatars } = useAvatar();

  // Ref that holds the latest roomIds
  const roomIdsRef = useRef<string[]>([]);

  // Keep the ref updated whenever roomIds changes
  useEffect(() => {
    roomIdsRef.current = roomIds;
  }, [roomIds]);

  // Cleanup all rooms when component unmounts
  useEffect(() => {
    return () => {
      if (!chatClient) return;
      Promise.all(
        roomIdsRef.current.map((roomId) =>
          chatClient.rooms.release(roomId).catch((error) => {
            console.warn(`Failed to release room ${roomId}:`, error);
          })
        )
      ).catch((err) => console.error('Error releasing rooms:', err));
    };
  }, [chatClient]);

  // Memoize callback functions to prevent unnecessary re-renders
  const handleSelectRoom = useCallback((roomId: string) => {
    setCurrentRoomId(roomId);
  }, []);

  const handleCreateRoom = useCallback(
    (roomName: string) => {
      // Check if the room already exists, and switch to it if it does
      if (roomIds.includes(roomName)) {
        setCurrentRoomId(roomName);
        return;
      }
      // Update roomIds and currentRoomId
      setRoomIds((prev) => [...prev, roomName]);
      setCurrentRoomId(roomName);
    },
    [roomIds]
  );

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

/**
 * Main application component
 * Wraps the ChatApp with AvatarProvider for centralized avatar management
 */
export const App: React.FC = () => {
  return (
    <AvatarProvider>
      <ChatApp />
    </AvatarProvider>
  );
};
