import { useState, useEffect } from 'react';
import { TextInputWithButton } from '../../atoms';
import React from 'react';

interface Room {
  id: string;
  name?: string;
}

interface RoomListProps {
  rooms?: Room[];
  onRoomSelect: (roomId: string) => void;
  selectedRoomId?: string;
  allowCreateRoom?: boolean;
  className?: string;
}

export function RoomList({
  rooms = [],
  onRoomSelect,
  selectedRoomId,
  allowCreateRoom = true,
  className = '',
}: RoomListProps) {
  const [availableRooms, setAvailableRooms] = useState<Room[]>(rooms);

  // If no rooms are provided, we could potentially fetch them from the server
  useEffect(() => {
    if (rooms.length > 0) {
      setAvailableRooms(rooms);
    }
  }, [rooms]);

  const handleCreateRoom = (roomName: string) => {
    // Create a new room with the given name
    // In a real app, you might want to call an API to create the room
    const newRoomId = roomName.toLowerCase().replace(/\s+/g, '-');

    // Add the new room to the list if it doesn't already exist
    if (!availableRooms.some((room) => room.id === newRoomId)) {
      const newRoom = { id: newRoomId, name: roomName };
      setAvailableRooms([...availableRooms, newRoom]);
    }

    // Select the new room
    onRoomSelect(newRoomId);
  };

  return (
    <div className={`border border-gray-300 p-4 flex flex-col h-full ${className}`}>
      <h2 className="text-lg font-semibold mb-4 flex-shrink-0">Chat Rooms</h2>

      <div className="flex-grow overflow-y-auto min-h-0">
        {availableRooms.length > 0 ? (
          <ul className="space-y-2 mb-4">
            {availableRooms.map((room) => (
              <li key={room.id}>
                <button
                  onClick={() => onRoomSelect(room.id)}
                  className={`w-full text-left px-4 py-2 rounded ${
                    selectedRoomId === room.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {room.name || room.id}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 mb-4">No rooms available.</p>
        )}
      </div>

      {allowCreateRoom && (
        <div className="mt-4 flex-shrink-0">
          <h3 className="text-sm font-medium mb-2">Create a new room</h3>
          <TextInputWithButton
            onSubmit={handleCreateRoom}
            placeholder="Enter room name"
            buttonText="Create"
          />
        </div>
      )}
    </div>
  );
}
