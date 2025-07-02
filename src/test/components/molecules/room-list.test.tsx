import { type ChatRoomProviderProps } from '@ably/chat/react';
import { fireEvent,render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RoomList } from '../../../components/molecules/room-list.tsx';
import { RoomListItemProps } from '../../../components/molecules/room-list-item.tsx';

// Mock the ChatRoomProvider
vi.mock('@ably/chat/react', () => ({
  ChatRoomProvider: ({ children, name, options }: ChatRoomProviderProps) => (
    <div data-testid="chat-room-provider" data-room-name={name} data-options={JSON.stringify(options)}>
      {children}
    </div>
  ),
}));

// Mock the RoomListItem component
vi.mock('../../../components/molecules/room-list-item.tsx', () => ({
  RoomListItem: ({ roomName, isSelected, isCollapsed, onClick, onLeave }: RoomListItemProps) => (
    <div 
      data-testid="room-list-item"
      data-room-name={roomName}
      data-selected={isSelected}
      data-collapsed={isCollapsed}
    >
      <button 
        data-testid={`select-room-${roomName}`} 
        onClick={onClick}
      >
        Select {roomName}
      </button>
      <button 
        data-testid={`leave-room-${roomName}`} 
        onClick={onLeave}
      >
        Leave {roomName}
      </button>
    </div>
  ),
}));

describe('RoomList', () => {
  const mockOnSelect = vi.fn();
  const mockOnLeave = vi.fn();
  const roomNames = ['room1', 'room2', 'room3'];
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders a list of rooms', () => {
    render(
      <RoomList 
        roomNames={roomNames}
        onSelect={mockOnSelect}
        onLeave={mockOnLeave}
      />
    );
    
    // Check if all rooms are rendered
    const roomProviders = screen.getAllByTestId('chat-room-provider');
    expect(roomProviders).toHaveLength(3);
    
    // Check if room names are passed correctly
    expect(roomProviders[0]).toHaveAttribute('data-room-name', 'room1');
    expect(roomProviders[1]).toHaveAttribute('data-room-name', 'room2');
    expect(roomProviders[2]).toHaveAttribute('data-room-name', 'room3');
    
    // Check if RoomListItems are rendered
    const roomItems = screen.getAllByTestId('room-list-item');
    expect(roomItems).toHaveLength(3);
  });
  
  it('marks the active room as selected', () => {
    render(
      <RoomList 
        roomNames={roomNames}
        activeRoomName="room2"
        onSelect={mockOnSelect}
        onLeave={mockOnLeave}
      />
    );
    
    const roomItems = screen.getAllByTestId('room-list-item');
    
    // Check if only the active room is marked as selected
    expect(roomItems[0]).toHaveAttribute('data-selected', 'false');
    expect(roomItems[1]).toHaveAttribute('data-selected', 'true');
    expect(roomItems[2]).toHaveAttribute('data-selected', 'false');
  });
  
  it('applies collapsed mode to all room items', () => {
    render(
      <RoomList 
        roomNames={roomNames}
        isCollapsed={true}
        onSelect={mockOnSelect}
        onLeave={mockOnLeave}
      />
    );
    
    const roomItems = screen.getAllByTestId('room-list-item');
    
    // Check if all rooms are in collapsed mode
    for (const item of roomItems) {
      expect(item).toHaveAttribute('data-collapsed', 'true');
    }
  });
  
  it('calls onSelect when a room is clicked', () => {
    render(
      <RoomList 
        roomNames={roomNames}
        onSelect={mockOnSelect}
        onLeave={mockOnLeave}
      />
    );
    
    // Click on the second room
    fireEvent.click(screen.getByTestId('select-room-room2'));
    
    // Check if onSelect was called with the correct room name
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith('room2');
  });
  
  it('calls onLeave when leave button is clicked', () => {
    render(
      <RoomList 
        roomNames={roomNames}
        onSelect={mockOnSelect}
        onLeave={mockOnLeave}
      />
    );
    
    // Click on the leave button for the third room
    fireEvent.click(screen.getByTestId('leave-room-room3'));
    
    // Check if onLeave was called with the correct room name
    expect(mockOnLeave).toHaveBeenCalledTimes(1);
    expect(mockOnLeave).toHaveBeenCalledWith('room3');
  });
  
  it('renders nothing when roomNames is empty', () => {
    const { container } = render(
      <RoomList 
        roomNames={[]}
        onSelect={mockOnSelect}
        onLeave={mockOnLeave}
      />
    );
    
    // Check if nothing is rendered
    expect(container.firstChild).toBeNull();
  });
  
  it('passes defaultRoomOptions to ChatRoomProvider', () => {
    const defaultRoomOptions = {
      occupancy: {enableEvents: true}
    };
    
    render(
      <RoomList 
        roomNames={roomNames}
        defaultRoomOptions={defaultRoomOptions}
        onSelect={mockOnSelect}
        onLeave={mockOnLeave}
      />
    );

    const roomProviders = screen.getAllByTestId('chat-room-provider');
    expect(roomProviders).toHaveLength(3);
    expect(roomProviders[0]).toHaveAttribute('data-room-name', 'room1');
    expect(roomProviders[0]).toHaveAttribute('data-options', JSON.stringify(defaultRoomOptions));
    expect(roomProviders[1]).toHaveAttribute('data-room-name', 'room2');
    expect(roomProviders[1]).toHaveAttribute('data-options', JSON.stringify(defaultRoomOptions));
    expect(roomProviders[2]).toHaveAttribute('data-room-name', 'room3');
    expect(roomProviders[2]).toHaveAttribute('data-options', JSON.stringify(defaultRoomOptions));
  });
});
