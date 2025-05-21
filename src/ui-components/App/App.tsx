import { useState } from 'react';
import { ChatClientProvider } from '@ably/chat/react';
import { Room } from '../Room';
import { RoomList } from '../RoomList';
import { RoomSettings } from '../RoomSettings';
import { ChatClient } from '@ably/chat';
import React from 'react';
import { ReactionTypeProvider } from '../../providers';

interface AppProps {
  chatClient: ChatClient;
  initialRooms?: Array<{ id: string; name?: string }>;
  className?: string;
}

function AppContent() {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId);
  };

  return (
    <div className="flex h-full">
      <div className="w-1/3 h-full flex flex-col pr-4">
        <RoomList
          onRoomSelect={handleRoomSelect}
          selectedRoomId={selectedRoomId || undefined}
          className="flex-grow"
        />
      </div>

      <div className="w-2/3 h-full flex flex-col max-h-full">
        {selectedRoomId ? (
          <div className="flex flex-col h-full max-h-full">
            <div className="card flex justify-between items-center border-b py-2 px-4 flex-shrink-0 h-14">
              <h2 className="header-title">Room: {selectedRoomId}</h2>
              <div className="header-actions">
                <button onClick={() => setShowSettings(!showSettings)} className="btn-secondary">
                  {showSettings ? 'Hide Settings' : 'Settings'}
                </button>
              </div>
            </div>

            <Room id={selectedRoomId} height="100%" className="flex-grow overflow-hidden">
              {showSettings && (
                <div className="absolute top-12 right-0 w-80 z-10">
                  <RoomSettings onClose={() => setShowSettings(false)} />
                </div>
              )}
            </Room>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full card bg-gray-50">
            <p className="text-gray-500">Select a room to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function App({ chatClient, initialRooms = [], className = '' }: AppProps) {
  // Check if there's a room ID in the URL
  const params = new URLSearchParams(window.location.search);
  const roomIdFromUrl = params.get('room');

  // If there's a room ID in the URL and it's not in initialRooms, add it
  if (roomIdFromUrl && !initialRooms.some((room) => room.id === roomIdFromUrl)) {
    initialRooms.push({ id: roomIdFromUrl });
  }

  // If there are no rooms, add a default one
  if (initialRooms.length === 0) {
    initialRooms.push({ id: 'general', name: 'General' });
  }

  return (
    <div className={`flex justify-center items-center h-screen ${className}`}>
      <div className="w-3/5 h-4/5 flex flex-col">
        <ChatClientProvider client={chatClient}>
          <ReactionTypeProvider>
            <AppContent />
          </ReactionTypeProvider>
        </ChatClientProvider>
      </div>
    </div>
  );
}
