import {useState} from 'react';
import {ChatClientProvider} from '@ably/chat/react';
import {Room} from '../Room';
import {RoomList} from '../RoomList';
import {RoomSettings} from '../RoomSettings';
import {ChatClient} from '@ably/chat';
import React from 'react';
import {ReactionTypeProvider} from '../../providers';
import {PanelGroup, Panel, PanelResizeHandle} from "react-resizable-panels";

interface AppProps {
    chatClient: ChatClient;
    initialRooms?: Array<{ id: string; name?: string }>;
    className?: string;
}

function AppContent() {
    const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(undefined);
    const [showSettings, setShowSettings] = useState(false);

    const handleRoomSelect = (roomId: string) => {
        setSelectedRoomId(roomId);
    };

    return (
        /* fills the parent container, but never grows beyond it */
        <div className="z-10 border rounded-lg w-full h-full text-sm flex">
            {/* 100 % width so the resize-panel logic can work properly */}
            <div className="w-full h-full">
                <div className="h-full w-full overflow-hidden">
                    <PanelGroup direction="horizontal" className="flex w-full h-full">
                        {/* Left Panel */}
                        <Panel
                            defaultSize={30}
                            minSize={20}
                            maxSize={40}
                            className="bg-gray-100 p-4 h-full"
                        >
                            <div className="h-full flex flex-col ">
                                <RoomList
                                    onRoomSelect={handleRoomSelect}
                                    selectedRoomId={selectedRoomId}
                                />
                            </div>
                        </Panel>

                        <PanelResizeHandle className="w-2 bg-gray-300 cursor-col-resize" />

                        {/* Right Panel – Chat Area */}
                        <Panel defaultSize={70} minSize={60} className="p-4 h-full">
                            <div className="h-full flex flex-col">
                            {selectedRoomId ? (
                                    <div className="flex flex-col h-full max-h-full">
                                        <div
                                            className="card flex justify-between items-center border-b py-2 px-4 flex-shrink-0 h-14">
                                            <h2 className="header-title">Room: {selectedRoomId}</h2>
                                            <div className="header-actions">
                                                <button onClick={() => setShowSettings(!showSettings)}
                                                        className="btn-secondary">
                                                    {showSettings ? 'Hide Settings' : 'Settings'}
                                                </button>
                                            </div>
                                        </div>

                                        <Room id={selectedRoomId} height="100%" className="flex-grow overflow-hidden">
                                            {showSettings && (
                                                <div className="absolute top-12 right-0 w-80 z-10">
                                                    <RoomSettings onClose={() => setShowSettings(false)}/>
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
                        </Panel>
                    </PanelGroup>
                </div>
            </div>
        </div>
    );
}

export function App({chatClient, initialRooms = [], className = ''}: AppProps) {
    // Check if there's a room ID in the URL
    const params = new URLSearchParams(window.location.search);
    const roomIdFromUrl = params.get('room');

    // If there's a room ID in the URL and it's not in initialRooms, add it
    if (roomIdFromUrl && !initialRooms.some((room) => room.id === roomIdFromUrl)) {
        initialRooms.push({id: roomIdFromUrl});
    }

    // If there are no rooms, add a default one
    if (initialRooms.length === 0) {
        initialRooms.push({id: 'general', name: 'General'});
    }

    return (
        <div className={`flex justify-center items-center min-h-screen ${className}`}>
            <div
                className="flex flex-col border rounded-lg shadow-lg w-full"
                style={{
                    width: 'min(90vw, calc(90vh * 1.618))',
                    height: 'min(90vh, calc(90vw / 1.618))',
                }}
            >
                <ChatClientProvider client={chatClient}>
                    <ReactionTypeProvider>
                        <AppContent/>
                    </ReactionTypeProvider>
                </ChatClientProvider>
            </div>
        </div>
    );
}