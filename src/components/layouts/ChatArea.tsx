import React from 'react';
import { useCurrentRoom } from '../../context/CurrentRoomContext';
import { ChatRoomProvider } from '@ably/chat/react';
import { ChatWindow } from './ChatWindow';
import { RoomOptions } from '@ably/chat';

interface ChatAreaProps {
  chatRoomOptions: RoomOptions;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ chatRoomOptions }) => {
  const { currentRoomId } = useCurrentRoom();
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
      options={chatRoomOptions}
    >
      <div className="flex-1 h-full">
        <ChatWindow roomId={currentRoomId} />
      </div>
    </ChatRoomProvider>
  );
};
