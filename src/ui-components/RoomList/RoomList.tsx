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
    const [availableRooms, setAvailableRooms] = useState<Room[]>(rooms ?? []);
    const [isCreating, setIsCreating] = useState(false);
    const newRoomRef = useRef<HTMLInputElement | null>(null);

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
        <div className={`bg-base-200 p-4 rounded-lg h-full flex flex-col gap-4 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-medium">Rooms</h2>
                    <span className="badge badge-neutral">{availableRooms.length}</span>
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        aria-label="More options"
                        className="btn btn-ghost btn-circle"
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
            <ul className="menu bg-base-200 rounded-box flex-1 overflow-y-auto">
                {availableRooms.map((room) => {
                    const selected = selectedRoomId === room.id;
                    return (
                        <li key={room.id}>
                            <button
                                onClick={() => onRoomSelect(room.id)}
                                className={`flex items-center gap-4 ${selected ? 'active' : ''}`}
                            >
                                <div className="avatar placeholder">
                                    <div className="bg-neutral text-neutral-content rounded-full w-10">
                                        <span className="text-lg">
                                            {room.name?.charAt(0) ?? room.id.charAt(0)}
                                        </span>
                                    </div>
                                </div>
                                <span className="truncate">{room.name || room.id}</span>
                            </button>
                        </li>
                    );
                })}

                {/* Create room section */}
                {allowCreateRoom && (
                    <li>
                        {!isCreating ? (
                            <button
                                type="button"
                                onClick={() => setIsCreating(true)}
                                className="flex items-center gap-4"
                            >
                                <div className="avatar placeholder">
                                    <div className="bg-neutral/20 text-neutral-content rounded-full w-10">
                                        <span className="text-xl">+</span>
                                    </div>
                                </div>
                                <span>New room</span>
                            </button>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex items-center gap-4 p-2">
                                <div className="avatar placeholder">
                                    <div className="bg-neutral/20 text-neutral-content rounded-full w-10">
                                        <span className="text-xl">+</span>
                                    </div>
                                </div>
                                <input
                                    ref={newRoomRef}
                                    type="text"
                                    placeholder="Room name..."
                                    onBlur={cancelCreate}
                                    onKeyDown={(e) => e.key === 'Escape' && cancelCreate()}
                                    className="input input-bordered w-full"
                                />
                            </form>
                        )}
                    </li>
                )}
            </ul>
        </div>
    );
}