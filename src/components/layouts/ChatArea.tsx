import React from 'react';
import { ChatRoomProvider } from '@ably/chat/react';
import { useAppState } from '../../context/AppStateContext';
import { ChatWindow } from './ChatWindow';

interface ChatAreaProps {}

export const ChatArea: React.FC<ChatAreaProps> = () => {
  const { currentRoomId, getCurrentRoomOptions } = useAppState();

  if (!currentRoomId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Select a room to start chatting
          </h3>
          <p className="text-gray-500">Choose a room from the sidebar or create a new one</p>
        </div>
      </div>
    );
  }

  return (
    <ChatRoomProvider
      key={currentRoomId}
      name={currentRoomId}
      attach={false}
      release={false}
      options={getCurrentRoomOptions()}
    >
      <ChatWindow roomId={currentRoomId} />
    </ChatRoomProvider>
  );
};
