import React, {useEffect, useState} from 'react';
import {TextInputWithButton} from '../../atoms';

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

    useEffect(() => {
        setAvailableRooms(rooms);
    }, [rooms]);

    const handleCreateRoom = (roomName: string) => {
        const newRoomId = roomName.toLowerCase().replace(/\s+/g, '-');
        if (!availableRooms.some((r) => r.id === newRoomId)) {
            setAvailableRooms([...availableRooms, {id: newRoomId, name: roomName}]);
        }
        onRoomSelect(newRoomId);
    };

    return (
        <div
            data-collapsed="false"
            className={`
        relative group flex flex-col h-full bg-muted/10 dark:bg-muted/20 gap-4
        p-2 data-[collapsed=true]:p-2 overflow-hidden ${className}
      `}
        >
            {/* Header */}
            <div className="flex justify-between items-center p-2">
                <div className="flex items-center gap-2 text-2xl">
                    <p className="font-medium">Rooms</p>
                    <span className="text-zinc-300">({availableRooms.length})</span>
                </div>

                {/* Optional future icons / actions */}
                <div className="flex gap-2">
                    {/* More options */}
                    <button
                        type="button"
                        aria-label="More options"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-more-horizontal"
                        >
                            <circle cx="12" cy="12" r="1"/>
                            <circle cx="19" cy="12" r="1"/>
                            <circle cx="5" cy="12" r="1"/>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Room list */}
            <nav
                className="grid gap-1 px-2 flex-1 overflow-y-auto group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
                {availableRooms.map((room) => {
                    const isSelected = selectedRoomId === room.id;

                    return (
                        <button
                            key={room.id}
                            onClick={() => onRoomSelect(room.id)}
                            className={`
                inline-flex h-16 items-center gap-4 rounded-md px-5 text-left text-sm font-medium transition-colors
                focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
                ${isSelected
                                ? 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white'
                                : 'hover:bg-accent hover:text-accent-foreground'}
              `}
                        >
                            {/* Room avatar placeholder */}
                            <span
                                className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent/50 text-base font-semibold uppercase">
                {room.name?.charAt(0) ?? room.id.charAt(0)}
              </span>

                            {/* Truncated room info */}
                            <div className="flex max-w-28 flex-col truncate">
                                <span className="truncate">{room.name || room.id}</span>
                            </div>
                        </button>
                    );
                })}
            </nav>

            {/* Create room */}
            {allowCreateRoom && (
                <div className="p-2">
                    <h3 className="mb-2 text-sm font-medium">Create a new room</h3>
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