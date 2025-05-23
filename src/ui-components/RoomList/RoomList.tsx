import React, { useEffect, useRef, useState } from 'react';

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
    const [isCreating, setIsCreating] = useState(false);
    const newRoomRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        setAvailableRooms(rooms);
    }, [rooms]);

    // Auto-focus the input whenever it appears
    useEffect(() => {
        if (isCreating) {
            newRoomRef.current?.focus();
        }
    }, [isCreating]);

    const createRoom = (name: string) => {
        const newId = name.trim().toLowerCase().replace(/\s+/g, '-');
        if (!newId) return;

        if (!availableRooms.some((r) => r.id === newId)) {
            setAvailableRooms([...availableRooms, { id: newId, name }]);
        }
        onRoomSelect(newId);
    };

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        const name = newRoomRef.current?.value ?? '';
        createRoom(name);
        setIsCreating(false);
    };

    const cancelCreate = () => setIsCreating(false);

    return (
        <div
            data-collapsed="false"
            className={`
        relative group flex flex-col h-full overflow-hidden
        bg-muted/10 dark:bg-muted/20 gap-4 p-2 data-[collapsed=true]:p-2
        ${className}
      `}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2 text-2xl">
                    <p className="font-medium">Rooms</p>
                    <span className="text-zinc-300">({availableRooms.length})</span>
                </div>
            </div>

            {/* Room list */}
            <nav className="grid flex-1 gap-1 overflow-y-auto px-2 group-[[data-collapsed=true]]:justify-center">
                {availableRooms.map((room) => {
                    const selected = selectedRoomId === room.id;
                    return (
                        <button
                            key={room.id}
                            onClick={() => onRoomSelect(room.id)}
                            className={`
                inline-flex h-16 items-center gap-4 rounded-md px-5 text-left text-sm font-medium transition-colors
                focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
                ${
                                selected
                                    ? 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 dark:bg-muted dark:text-white dark:hover:bg-muted'
                                    : 'hover:bg-accent hover:text-accent-foreground'
                            }
              `}
                        >
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent/50 text-base font-semibold uppercase">
                {room.name?.charAt(0) ?? room.id.charAt(0)}
              </span>
                            <span className="truncate max-w-28">{room.name || room.id}</span>
                        </button>
                    );
                })}

                {/* “Create room” row */}
                {allowCreateRoom && (
                    <>
                        {!isCreating ? (
                            // “+” button state
                            <button
                                type="button"
                                onClick={() => setIsCreating(true)}
                                className="inline-flex h-16 items-center justify-center gap-4 rounded-md px-5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xl">
                  +
                </span>
                                <span className="truncate max-w-28">New room</span>
                            </button>
                        ) : (
                            // Inline text-input state
                            <form onSubmit={handleSubmit} className="inline-flex h-16 items-center gap-4 rounded-md bg-accent/10 px-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xl">
                  +
                </span>
                                <input
                                    ref={newRoomRef}
                                    type="text"
                                    placeholder="Room name…"
                                    onBlur={cancelCreate}
                                    onKeyDown={(e) => e.key === 'Escape' && cancelCreate()}
                                    className="w-full bg-transparent text-sm focus:outline-none"
                                />
                            </form>
                        )}
                    </>
                )}
            </nav>
        </div>
    );
}