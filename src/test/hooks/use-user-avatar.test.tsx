import '@testing-library/jest-dom';

import { act,renderHook } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AvatarData } from '../../components/atoms/avatar.tsx';
import { AvatarContext, AvatarContextType } from '../../context/avatar-context.tsx';
import { useUserAvatar } from '../../hooks/use-user-avatar.tsx';

describe('useUserAvatar Hook', () => {
  const mockUserAvatar: AvatarData = {
    displayName: 'Test User',
    initials: 'TU',
    color: '#3B82F6',
  };

  const updatedUserAvatar: AvatarData = {
    ...mockUserAvatar,
    displayName: 'Updated User Name',
    color: '#EF4444',
    src: 'https://example.com/avatar.jpg',
  };

  const getAvatarForUser = vi.fn();
  const createAvatarForUser = vi.fn();
  const setUserAvatar = vi.fn();

  const mockAvatarContext: AvatarContextType = {
    getAvatarForUser,
    createAvatarForUser,
    getAvatarForRoom: vi.fn(),
    createAvatarForRoom: vi.fn(),
    setUserAvatar,
    setRoomAvatar: vi.fn(),
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
    getAvatarForUser.mockReset();
    createAvatarForUser.mockReset();
    setUserAvatar.mockReset();
  });

  it('should get existing avatar from context', () => {
    getAvatarForUser.mockReturnValue(mockUserAvatar);

    const { result } = renderHook(() => useUserAvatar({ clientId: 'user-123' }), { wrapper });

    // Should have called getAvatarForUser
    expect(getAvatarForUser).toHaveBeenCalledWith('user-123');
    
    // Should not have called createAvatarForUser
    expect(createAvatarForUser).not.toHaveBeenCalled();
    
    // Should return the avatar
    expect(result.current.userAvatar).toEqual(mockUserAvatar);
  });

  it('should create new avatar if none exists', () => {
    getAvatarForUser.mockReturnValue(undefined);
    createAvatarForUser.mockReturnValue(mockUserAvatar);

    const { result } = renderHook(
      () => useUserAvatar({ clientId: 'user-123', displayName: 'Test User' }),
      { wrapper }
    );

    // Should have called getAvatarForUser
    expect(getAvatarForUser).toHaveBeenCalledWith('user-123');
    
    // Should have called createAvatarForUser
    expect(createAvatarForUser).toHaveBeenCalledWith('user-123', 'Test User');
    
    // Should return the created avatar
    expect(result.current.userAvatar).toEqual(mockUserAvatar);
  });

  it('should update user avatar', () => {
    getAvatarForUser.mockReturnValue(mockUserAvatar);

    const { result } = renderHook(() => useUserAvatar({ clientId: 'user-123' }), { wrapper });

    // Update the avatar
    act(() => {
      result.current.setUserAvatar({
        displayName: 'Updated User Name',
        color: '#EF4444',
        src: 'https://example.com/avatar.jpg',
      });
    });

    // Should have called setUserAvatar
    expect(setUserAvatar).toHaveBeenCalledWith('user-123', {
      displayName: 'Updated User Name',
      color: '#EF4444',
      src: 'https://example.com/avatar.jpg',
    });
    
    // Local state should be updated
    expect(result.current.userAvatar).toEqual(updatedUserAvatar);
  });

  it('should use clientId as displayName if not provided', () => {
    getAvatarForUser.mockReturnValue(undefined);
    createAvatarForUser.mockImplementation((clientId: string, displayName: string) => ({
      displayName: displayName || clientId,
      initials: 'U1',
      color: '#3B82F6',
    }));

    const { result } = renderHook(() => useUserAvatar({ clientId: 'user-123' }), { wrapper });

    // Should have called createAvatarForUser with clientId and undefined displayName
    expect(createAvatarForUser).toHaveBeenCalledWith('user-123', undefined);
    
    // Should have used clientId as displayName
    expect(result.current.userAvatar?.displayName).toBe('user-123');
  });
});
