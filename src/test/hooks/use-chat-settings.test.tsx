import '@testing-library/jest-dom';

import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
  ChatSettings,
  ChatSettingsContext,
  ChatSettingsContextType,
} from '../../context/chat-settings-context.tsx';
import { useChatSettings } from '../../hooks/use-chat-settings.tsx';

describe('useChatSettings Hook', () => {
  const mockGlobalSettings: ChatSettings = {
    allowMessageUpdatesOwn: true,
    allowMessageUpdatesAny: false,
    allowMessageDeletesOwn: true,
    allowMessageDeletesAny: false,
    allowMessageReactions: true,
  };

  const mockRoomSettings: Record<string, Partial<ChatSettings>> = {
    general: { allowMessageUpdatesOwn: false },
    announcements: {
      allowMessageUpdatesOwn: false,
      allowMessageDeletesOwn: false,
    },
  };

  const mockGetEffectiveSettings = vi.fn((roomName?: string) => {
    if (!roomName) {
      return mockGlobalSettings;
    }

    return {
      ...mockGlobalSettings,
      ...mockRoomSettings[roomName],
    };
  });

  const mockContextValue: ChatSettingsContextType = {
    globalSettings: mockGlobalSettings,
    roomSettings: mockRoomSettings,
    getEffectiveSettings: mockGetEffectiveSettings,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ChatSettingsContext.Provider value={mockContextValue}>{children}</ChatSettingsContext.Provider>
  );

  it('should return the chat settings context', () => {
    const { result } = renderHook(() => useChatSettings(), { wrapper });

    expect(result.current).toBe(mockContextValue);
    expect(result.current.globalSettings).toBe(mockGlobalSettings);
    expect(result.current.roomSettings).toBe(mockRoomSettings);
    expect(result.current.getEffectiveSettings).toBe(mockGetEffectiveSettings);
  });

  it('should correctly get effective settings for a room', () => {
    const { result } = renderHook(() => useChatSettings(), { wrapper });

    // Test global settings
    const globalSettings = result.current.getEffectiveSettings();
    expect(globalSettings).toEqual(mockGlobalSettings);

    // Test room with overrides
    const generalSettings = result.current.getEffectiveSettings('general');
    expect(generalSettings).toEqual({
      ...mockGlobalSettings,
      allowMessageUpdatesOwn: false,
    });

    // Test room with multiple overrides
    const announcementsSettings = result.current.getEffectiveSettings('announcements');
    expect(announcementsSettings).toEqual({
      ...mockGlobalSettings,
      allowMessageUpdatesOwn: false,
      allowMessageDeletesOwn: false,
    });

    // Test non-existent room (should use global settings)
    const nonExistentRoomSettings = result.current.getEffectiveSettings('non-existent');
    expect(nonExistentRoomSettings).toEqual(mockGlobalSettings);
  });
});
