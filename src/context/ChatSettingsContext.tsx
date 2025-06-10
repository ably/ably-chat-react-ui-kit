import React, { createContext, useContext, ReactNode } from 'react';

/**
 * Interface representing chat settings that can be configured globally or per room.
 *
 */
export interface ChatSettings {
  /** Whether users can edit their messages after sending */
  allowMessageEdits: boolean;
  /** Whether users can delete their messages */
  allowMessageDeletes: boolean;
  /** Whether users can add reactions to messages */
  allowMessageReactions: boolean;
}

/**
 * Context interface providing access to chat settings globally and per room.
 *
 */
export interface ChatSettingsContextType {
  /** Global default settings applied to all rooms */
  globalSettings: ChatSettings;
  /** Room-specific setting overrides */
  roomSettings: Record<string, Partial<ChatSettings>>;
  /**
   * Get effective settings for a room by merging global and room-specific settings.
   * Room settings take precedence over global settings.
   *
   * @param roomName - Optional room name. If not provided, returns global settings
   * @returns Merged settings for the specified room or global settings
   */
  getEffectiveSettings: (roomName?: string) => ChatSettings;
}

/**
 * Default chat settings applied when no custom settings are provided.
 *
 * @internal
 */
const DEFAULT_SETTINGS: ChatSettings = {
  allowMessageEdits: true,
  allowMessageDeletes: true,
  allowMessageReactions: true,
};

/**
 * React context for chat settings management.
 *
 * @internal
 */
const ChatSettingsContext = createContext<ChatSettingsContextType>({
  globalSettings: DEFAULT_SETTINGS,
  roomSettings: {},
  getEffectiveSettings: () => ({ ...DEFAULT_SETTINGS }),
});

/**
 * Props for the ChatSettingsProvider component.
 *
 */
export interface ChatSettingsProviderProps {
  /** Child components that will have access to chat settings */
  children: ReactNode;
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
 *
 * @example
 * ```tsx
 * const globalSettings = {
 *   allowMessageEdits: false,
 *   allowMessageDeletes: true,
 *   allowMessageReactions: true
 * };
 *
 * const roomSettings = {
 *   'general': { allowMessageEdits: true },
 *   'announcements': {
 *     allowMessageEdits: false,
 *     allowMessageDeletes: false
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
export const ChatSettingsProvider: React.FC<ChatSettingsProviderProps> = ({
  children,
  initialGlobalSettings = {},
  initialRoomSettings = {},
}) => {
  // Merge initial global settings with defaults
  const globalSettings: ChatSettings = {
    ...DEFAULT_SETTINGS,
    ...initialGlobalSettings,
  };

  /**
   * Get effective settings for a room by merging global and room-specific settings.
   * Returns a frozen copy to prevent accidental mutations.
   *
   * @param roomName - Optional room name to get settings for
   * @returns Effective chat settings (room-specific merged with global, or just global)
   */
  const getEffectiveSettings = (roomName?: string): ChatSettings => {
    // If no room is specified, return global settings
    if (!roomName) {
      return Object.freeze({ ...globalSettings });
    }

    // Get room-specific settings if they exist
    const roomSpecificSettings = initialRoomSettings[roomName] || {};

    // Merge global settings with room-specific settings (room settings take precedence)
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

/**
 * Hook to access the chat settings context.
 *
 * Provides access to global settings, room settings, and the function
 * to get effective settings for specific rooms.
 *
 * @example
 * ```tsx
 * const { globalSettings, getEffectiveSettings } = useChatSettings();
 * const roomSettings = getEffectiveSettings('general');
 * ```
 *
 * @returns The chat settings context value
 * @throws Error if used outside of ChatSettingsProvider
 *
 * @public
 */
export const useChatSettings = () => {
  const context = useContext(ChatSettingsContext);

  if (!context) {
    throw new Error('useChatSettings must be used within a ChatSettingsProvider');
  }

  return context;
};
