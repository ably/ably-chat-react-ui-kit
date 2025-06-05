import React from 'react';
import { ChatRoomProvider } from '@ably/chat/react';
import { useCurrentRoom } from '../../context/CurrentRoomContext';
import { ChatWindow } from './ChatWindow';
import { AvatarData } from '../atoms/Avatar';

interface ChatAreaProps {
  chatRoomOptions?: any;
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

  // Create proper avatar data for the room
  const roomAvatar: AvatarData = {
    src: `https://api.dicebear.com/6.x/initials/svg?seed=${currentRoomId}`,
    displayName: `Room ${currentRoomId}`,
  };

  return (
    <ChatRoomProvider
      key={currentRoomId}
      name={currentRoomId}
      attach={false}
      release={false}
      options={chatRoomOptions}
    >
      <ChatWindow roomId={currentRoomId} roomAvatar={roomAvatar} />
    </ChatRoomProvider>
  );
};
