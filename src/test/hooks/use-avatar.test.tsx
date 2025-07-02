import '@testing-library/jest-dom';

import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { AvatarContext, AvatarContextType } from '../../context/avatar-context.tsx';
import { useAvatar } from '../../hooks/use-avatar.tsx';

describe('useAvatar Hook', () => {
  const mockAvatarContext: AvatarContextType = {
    getAvatarForUser: vi.fn(),
    createAvatarForUser: vi.fn(),
    getAvatarForRoom: vi.fn(),
    createAvatarForRoom: vi.fn(),
    setUserAvatar: vi.fn(),
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

  it('should return the avatar context when used within AvatarProvider', () => {
    const { result } = renderHook(() => useAvatar(), { wrapper });

    expect(result.current).toBe(mockAvatarContext);
    expect(result.current.getAvatarForUser).toBe(mockAvatarContext.getAvatarForUser);
    expect(result.current.createAvatarForUser).toBe(mockAvatarContext.createAvatarForUser);
    expect(result.current.setUserAvatar).toBe(mockAvatarContext.setUserAvatar);
  });

  it('should throw an error when used outside of AvatarProvider', () => {
    const mockConsoleLog = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Expect the hook to throw an error when rendered without a provider
    expect(() => {
      renderHook(() => useAvatar());
    }).toThrow('useAvatar must be used within an AvatarProvider');

     mockConsoleLog.mockRestore();
  });
});
