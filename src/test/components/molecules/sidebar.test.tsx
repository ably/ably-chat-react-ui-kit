import { fireEvent,render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach,describe, expect, it, vi } from 'vitest';

import { ButtonProps } from '../../../components/atoms/button.tsx';
import { IconProps } from '../../../components/atoms/icon.tsx';
import { CreateRoomModalProps } from '../../../components/molecules/create-room-modal.tsx';
import { DropdownMenuProps } from '../../../components/molecules/dropdown-menu.tsx';
import { RoomListProps } from '../../../components/molecules/room-list.tsx';
import { Sidebar } from '../../../components/molecules/sidebar.tsx';
import { useTheme } from '../../../hooks/use-theme.tsx';


vi.mock('../../../hooks/use-theme.tsx', () => ({
  useTheme: vi.fn().mockReturnValue({
    theme: 'light',
    toggleTheme: vi.fn(),
  }),
}));

vi.mock('../../../components/atoms/button.tsx', () => ({
  Button: ({ children, onClick, variant, size, className }: ButtonProps) => (
    <button
      data-testid="button"
      data-variant={variant}
      data-size={size}
      className={className}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

vi.mock('../../../components/atoms/icon.tsx', () => ({
  Icon: ({ name, size }: IconProps) => (
    <div data-testid={`icon-${name}`} data-size={size}>
      {name} icon
    </div>
  ),
}));

vi.mock('../../../components/molecules/create-room-modal.tsx', () => ({
  CreateRoomModal: ({ isOpen, onClose, onCreateRoom }: CreateRoomModalProps) => (
    isOpen ? (
      <div data-testid="create-room-modal">
        <button data-testid="close-modal" onClick={onClose}>Close</button>
        <button data-testid="create-room" onClick={() => { onCreateRoom('new-room'); }}>Create Room</button>
      </div>
    ) : null
  ),
}));

vi.mock('../../../components/molecules/dropdown-menu.tsx', () => ({
  DropdownMenu: ({ trigger, items }: DropdownMenuProps) => (
    <div data-testid="dropdown-menu">
      {trigger}
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <button data-testid={`dropdown-item-${item.id}`} onClick={item.onClick}>
              {item.icon} {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  ),
}));

vi.mock('../../../components/molecules/room-list.tsx', () => ({
  RoomList: ({ roomNames, activeRoomName, defaultRoomOptions, onSelect, onLeave, isCollapsed }: RoomListProps) => (
    <div 
      data-testid="room-list"
      data-room-count={roomNames.length}
      data-active-room={activeRoomName}
      data-collapsed={isCollapsed}
      data-default-room-options={JSON.stringify(defaultRoomOptions)}
    >
      {roomNames.map((roomName) => (
        <div key={roomName} data-testid={`room-${roomName}`}>
          <button data-testid={`select-${roomName}`} onClick={() => { onSelect(roomName); }}>
            Select {roomName}
          </button>
          <button data-testid={`leave-${roomName}`} onClick={() => { onLeave(roomName); }}>
            Leave {roomName}
          </button>
        </div>
      ))}
    </div>
  ),
}));

describe('Sidebar', () => {
  const mockAddRoom = vi.fn();
  const mockSetActiveRoom = vi.fn();
  const mockLeaveRoom = vi.fn();
  const mockToggleCollapse = vi.fn();
  const mockToggleTheme = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    (useTheme as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
    });
  });

  it('renders with default props', () => {
    const roomNames = ['room1', 'room2', 'room3'];

    render(
      <Sidebar
        roomNames={roomNames}
        addRoom={mockAddRoom}
        setActiveRoom={mockSetActiveRoom}
        leaveRoom={mockLeaveRoom}
      />
    );

    // Check if the component renders the header
    const header = screen.getByRole('heading', { level: 1 });
    expect(header).toBeInTheDocument();
    expect(header).toHaveTextContent('Chats (3)');

    // Check if the room list is rendered
    const roomList = screen.getByTestId('room-list');
    expect(roomList).toBeInTheDocument();
    expect(roomList).toHaveAttribute('data-room-count', '3');
    expect(roomList).toHaveAttribute('data-collapsed', 'false');
    
    // Check if theme toggle button is rendered
    expect(screen.getByTestId('icon-moon')).toBeInTheDocument();
    
    // Check if dropdown menu is rendered
    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
  });
  
  it('renders in collapsed mode', () => {
    const roomNames = ['room1', 'room2'];
    
    render(
      <Sidebar
        roomNames={roomNames}
        addRoom={mockAddRoom}
        setActiveRoom={mockSetActiveRoom}
        leaveRoom={mockLeaveRoom}
        isCollapsed={true}
        onToggleCollapse={mockToggleCollapse}
      />
    );
    
    // Check if the component is in collapsed mode
    expect(screen.queryByText('Chats (2)')).not.toBeInTheDocument();
    
    // Check if the room list is in collapsed mode
    const roomList = screen.getByTestId('room-list');
    expect(roomList).toHaveAttribute('data-collapsed', 'true');
    
    // Check if the expand button is rendered
    expect(screen.getByTestId('icon-chevronright')).toBeInTheDocument();
  });
  
  it('toggles theme when theme button is clicked', () => {
    render(
      <Sidebar
        roomNames={['room1']}
        addRoom={mockAddRoom}
        setActiveRoom={mockSetActiveRoom}
        leaveRoom={mockLeaveRoom}
      />
    );
    
    // Click the theme toggle button
    const themeButtons = screen.getAllByTestId('button');
    const themeButton = themeButtons.find(button => 
      button.contains(screen.getByTestId('icon-moon'))
    );
    expect(themeButton).toBeInTheDocument();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    fireEvent.click(themeButton!);
    
    // Check if toggleTheme was called
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });
  
  it('shows dark mode icon when theme is dark', () => {
    (useTheme as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: 'dark',
      toggleTheme: mockToggleTheme,
    });
    
    render(
      <Sidebar
        roomNames={['room1']}
        addRoom={mockAddRoom}
        setActiveRoom={mockSetActiveRoom}
        leaveRoom={mockLeaveRoom}
      />
    );
    
    // Check if sun icon is rendered for dark mode
    expect(screen.getByTestId('icon-sun')).toBeInTheDocument();
  });
  
  it('toggles collapse when collapse button is clicked', () => {
    render(
      <Sidebar
        roomNames={['room1']}
        addRoom={mockAddRoom}
        setActiveRoom={mockSetActiveRoom}
        leaveRoom={mockLeaveRoom}
        onToggleCollapse={mockToggleCollapse}
      />
    );
    
    // Find and click the collapse button
    const collapseButtons = screen.getAllByTestId('button');
    const collapseButton = collapseButtons.find(button => 
      button.contains(screen.getByTestId('icon-chevronleft'))
    );

    expect(collapseButton).toBeInTheDocument();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    fireEvent.click(collapseButton!);
    
    // Check if onToggleCollapse was called
    expect(mockToggleCollapse).toHaveBeenCalledTimes(1);
  });
  
  it('opens create room modal when dropdown item is clicked', () => {
    render(
      <Sidebar
        roomNames={['room1']}
        addRoom={mockAddRoom}
        setActiveRoom={mockSetActiveRoom}
        leaveRoom={mockLeaveRoom}
      />
    );
    
    // Initially, modal should not be visible
    expect(screen.queryByTestId('create-room-modal')).not.toBeInTheDocument();
    
    // Click the create room dropdown item
    fireEvent.click(screen.getByTestId('dropdown-item-create-room'));
    
    // Modal should now be visible
    expect(screen.getByTestId('create-room-modal')).toBeInTheDocument();
  });
  
  it('creates a room when create button is clicked in modal', () => {
    render(
      <Sidebar
        roomNames={['room1']}
        addRoom={mockAddRoom}
        setActiveRoom={mockSetActiveRoom}
        leaveRoom={mockLeaveRoom}
      />
    );
    
    // Open the modal
    fireEvent.click(screen.getByTestId('dropdown-item-create-room'));
    
    // Click the create room button in the modal
    fireEvent.click(screen.getByTestId('create-room'));
    
    // Check if addRoom was called with the new room name
    expect(mockAddRoom).toHaveBeenCalledWith('new-room');
    
    // Modal should be closed
    expect(screen.queryByTestId('create-room-modal')).not.toBeInTheDocument();
  });
  
  it('closes modal without creating room when close button is clicked', () => {
    render(
      <Sidebar
        roomNames={['room1']}
        addRoom={mockAddRoom}
        setActiveRoom={mockSetActiveRoom}
        leaveRoom={mockLeaveRoom}
      />
    );
    
    // Open the modal
    fireEvent.click(screen.getByTestId('dropdown-item-create-room'));
    
    // Click the close button in the modal
    fireEvent.click(screen.getByTestId('close-modal'));
    
    // Check if addRoom was not called
    expect(mockAddRoom).not.toHaveBeenCalled();
    
    // Modal should be closed
    expect(screen.queryByTestId('create-room-modal')).not.toBeInTheDocument();
  });
  
  it('passes defaultRoomOptions to RoomList', () => {
    const defaultRoomOptions = { occupancy: {enableEvents: true } };
    
    render(
      <Sidebar
        roomNames={['room1']}
        addRoom={mockAddRoom}
        setActiveRoom={mockSetActiveRoom}
        leaveRoom={mockLeaveRoom}
        defaultRoomOptions={defaultRoomOptions}
      />
    );

    // Check if RoomList receives the defaultRoomOptions
    const roomList = screen.getByTestId('room-list');
    expect(roomList).toBeInTheDocument();
    expect(roomList).toHaveAttribute('data-default-room-options', JSON.stringify(defaultRoomOptions));
  });
  
  it('applies custom className when provided', () => {
    render(
      <Sidebar
        roomNames={['room1']}
        addRoom={mockAddRoom}
        setActiveRoom={mockSetActiveRoom}
        leaveRoom={mockLeaveRoom}
        className="custom-class"
      />
    );
    
    // Check if the root container has the custom class
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('custom-class');
  });
});
