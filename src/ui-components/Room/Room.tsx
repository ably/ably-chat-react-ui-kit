import { ReactNode } from 'react';
import { ChatRoomProvider } from '@ably/chat/react';
import { ChatWindow } from '../ChatWindow';
import React from 'react';

interface RoomProps {
  id: string;
  children?: ReactNode;
  className?: string;
  height?: string;
  showTypingIndicator?: boolean;
  options?: {
    occupancy?: {
      enableEvents?: boolean;
    };
    typing?: {
      heartbeatThrottleMs?: number;
    };
  };
}

export function Room({
  id,
  children,
  className = '',
  height = '100%',
  showTypingIndicator = true,
  options = { occupancy: { enableEvents: true } },
}: RoomProps) {

  return (
    <ChatRoomProvider id={id} release={true} attach={true} options={options}>
      <div className={`flex flex-col ${className}`}>
        <ChatWindow height={height} showTypingIndicator={showTypingIndicator} />
        {children}
      </div>
    </ChatRoomProvider>
  );
}
