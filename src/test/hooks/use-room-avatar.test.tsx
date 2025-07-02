import '@testing-library/jest-dom';

import { act,renderHook } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AvatarData } from '../../components/atoms/avatar.tsx';
import { AvatarContext, AvatarContextType } from '../../context/avatar-context.tsx';
import { useRoomAvatar } from '../../hooks/use-room-avatar.tsx';

describe('useRoomAvatar Hook', () => {
  const mockRoomAvatar: AvatarData = {
    displayName: 'Test Room',
    initials: 'TR',
    color: '#3B82F6',
  };

  const updatedRoomAvatar: AvatarData = {
    ...mockRoomAvatar,
    displayName: 'Updated Room Name',
    color: '#EF4444',
  };

  const getAvatarForRoom = vi.fn();
  const createAvatarForRoom = vi.fn();
  const setRoomAvatar = vi.fn();

  const mockAvatarContext: AvatarContextType = {
    getAvatarForRoom,
    createAvatarForRoom,
    getAvatarForUser: vi.fn(),
    createAvatarForUser: vi.fn(),
    setUserAvatar: vi.fn(),
    setRoomAvatar,
    getUserAvatars: vi.fn(),
    getRoomAvatars: vi.fn(),
    clearUserAvatars: vi.fn(),
    clearRoomAvatars: vi.fn(),
    clearAllAvatars: vi.fn(),
    onAvatarChange: vi.fn(),
    exportAvatars: vi.fn(),
    importAvatars: vi.fn(),
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AvatarContext.Provider value={mockAvatarContext}>{children}</AvatarContext.Provider>
  );

  beforeEach(() => {
    getAvatarForRoom.mockReset();
    createAvatarForRoom.mockReset();
    setRoomAvatar.mockReset();
  });

  it('should get existing avatar from context', () => {
    getAvatarForRoom.mockReturnValue(mockRoomAvatar);

    const { result } = renderHook(() => useRoomAvatar({ roomName: 'test-room' }), { wrapper });

    // Should have called getAvatarForRoom
    expect(getAvatarForRoom).toHaveBeenCalledWith('test-room');
    
    // Should not have called createAvatarForRoom
    expect(createAvatarForRoom).not.toHaveBeenCalled();
    
    // Should return the avatar
    expect(result.current.roomAvatar).toEqual(mockRoomAvatar);
  });

  it('should create new avatar if none exists', () => {
    getAvatarForRoom.mockReturnValue(undefined);
    createAvatarForRoom.mockReturnValue(mockRoomAvatar);

    const { result } = renderHook(
      () => useRoomAvatar({ roomName: 'test-room', displayName: 'Test Room' }),
      { wrapper }
    );

    // Should have called getAvatarForRoom
    expect(getAvatarForRoom).toHaveBeenCalledWith('test-room');
    
    // Should have called createAvatarForRoom
    expect(createAvatarForRoom).toHaveBeenCalledWith('test-room', 'Test Room');
    
    // Should return the created avatar
    expect(result.current.roomAvatar).toEqual(mockRoomAvatar);
  });

  it('should update room avatar', () => {
    getAvatarForRoom.mockReturnValue(mockRoomAvatar);

    const { result } = renderHook(() => useRoomAvatar({ roomName: 'test-room' }), { wrapper });

    // Update the avatar
    act(() => {
      result.current.setRoomAvatar({
        displayName: 'Updated Room Name',
        color: '#EF4444',
      });
    });

    // Should have called setRoomAvatar
    expect(setRoomAvatar).toHaveBeenCalledWith('test-room', {
      displayName: 'Updated Room Name',
      color: '#EF4444',
    });
    
    // Local state should be updated
    expect(result.current.roomAvatar).toEqual(updatedRoomAvatar);
  });

  it('should use roomName as displayName if not provided', () => {
    getAvatarForRoom.mockReturnValue(undefined);
    createAvatarForRoom.mockImplementation((roomName: string, displayName: string) => ({
      displayName: displayName || roomName,
      initials: 'TR',
      color: '#3B82F6',
    }));

    const { result } = renderHook(() => useRoomAvatar({ roomName: 'test-room' }), { wrapper });

    // Should have called createAvatarForRoom with roomName and undefined displayName
    expect(createAvatarForRoom).toHaveBeenCalledWith('test-room', undefined);
    
    // Should have used roomName as displayName
    expect(result.current.roomAvatar?.displayName).toBe('test-room');
  });
});
