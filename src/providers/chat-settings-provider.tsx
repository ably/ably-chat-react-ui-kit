import React, { ReactNode } from 'react';

import {
  ChatSettings,
  ChatSettingsContext,
  ChatSettingsContextType,
} from '../context/chat-settings-context.tsx';

export const DEFAULT_SETTINGS: ChatSettings = {
  allowMessageUpdatesOwn: true,
  allowMessageUpdatesAny: false,
  allowMessageDeletesOwn: true,
  allowMessageDeletesAny: false,
  allowMessageReactions: true,
};

/**
 * Props for the ChatSettingsProvider component.
 *
 */
export interface ChatSettingsProviderProps {
  /** Child components that will have access to chat settings */
  children?: ReactNode;
  /**
   * Initial global settings. Will be merged with defaults.
   * @defaultValue `{}`
   */
  initialGlobalSettings?: Partial<ChatSettings>;
  /**
   * Initial room-specific settings mapping.
   * @defaultValue `{}`
   */
  initialRoomSettings?: Record<string, Partial<ChatSettings>>;
}

/**
 * Provider component that manages global and room-level chat settings.
 *
 * This component provides a context for managing chat functionality settings
 * across an application. It supports both global default settings and
 * room-specific overrides. The settings control whether certain UI features are enabled/disabled,
 * but do not affect the underlying Ably Chat functionality. If you wish to ensure no user can edit or delete messages,
 * you must also configure the Ably client capabilities accordingly.
 *
 * @example
 * ```tsx
 * const globalSettings = {
 *   allowMessageUpdatesOwn: true,
 *   allowMessageUpdatesAny: false,
 *   allowMessageDeletesOwn: true,
 *   allowMessageDeletesAny: false,
 *   allowMessageReactions: true
 * };
 *
 * const roomSettings = {
 *   'general': {
 *     allowMessageUpdatesOwn: true,
 *     allowMessageUpdatesAny: true // Allow user to update any message in general room
 *   },
 *   'announcements': {
 *     allowMessageUpdatesOwn: false,
 *     allowMessageUpdatesAny: false,
 *     allowMessageDeletesOwn: false,
 *     allowMessageDeletesAny: true // Allow user to delete any messages in announcements
 *   }
 * };
 *
 * <ChatSettingsProvider
 *   initialGlobalSettings={globalSettings}
 *   initialRoomSettings={roomSettings}
 * >
 *   <ChatApp />
 * </ChatSettingsProvider>
 * ```
 *
 * @param ChatSettingsProviderProps - Props for the provider component
 * @returns {@link ChatSettingsProvider} component that wraps children components.
 *
 * @public
 */
export const ChatSettingsProvider = ({
  initialGlobalSettings = {},
  initialRoomSettings = {},
  children,
}: ChatSettingsProviderProps) => {
  // Merge initial global settings with defaults
  const globalSettings: ChatSettings = {
    ...DEFAULT_SETTINGS,
    ...initialGlobalSettings,
  };

  /**
   * Get effective settings for a room by merging global and room-specific settings.
   * Returns a frozen copy to prevent accidental mutations.
   */
  const getEffectiveSettings = (roomName?: string): ChatSettings => {
    if (!roomName) {
      return Object.freeze({ ...globalSettings });
    }

    const roomSpecificSettings = initialRoomSettings[roomName];

    return Object.freeze({
      ...globalSettings,
      ...roomSpecificSettings,
    });
  };

  const contextValue: ChatSettingsContextType = {
    globalSettings: Object.freeze({ ...globalSettings }),
    roomSettings: initialRoomSettings,
    getEffectiveSettings,
  };

  return (
    <ChatSettingsContext.Provider value={contextValue}>{children}</ChatSettingsContext.Provider>
  );
};
