import React, { useState } from 'react';
import { ChatRoomProvider } from '@ably/chat/react';
import { ChatWindow } from './ChatWindow';
import RoomInfo from '../molecules/RoomInfo';
import RoomReaction from '../molecules/RoomReaction.tsx';
import { RoomOptions } from '@ably/chat';

interface ChatAreaProps {
  activeRoomName?: string; // Optional, can be undefined if no room is selected
  defaultRoomOptions?: RoomOptions; // Default options for the room
}

export const ChatArea: React.FC<ChatAreaProps> = ({ activeRoomName, defaultRoomOptions }) => {
  const [roomOptions] = useState<RoomOptions>(
    defaultRoomOptions || { occupancy: { enableEvents: true } }
  );
  if (!activeRoomName) {
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
      key={activeRoomName}
      name={activeRoomName}
      attach={false}
      release={false}
      options={roomOptions}
    >
      <ChatWindow
        roomId={activeRoomName}
        customHeaderContent={<RoomInfo roomId={activeRoomName} />}
        customFooterContent={<RoomReaction />}
      />
    </ChatRoomProvider>
  );
};
