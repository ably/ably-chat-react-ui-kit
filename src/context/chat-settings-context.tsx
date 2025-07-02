import { createContext } from 'react';

import { ChatSettings, DEFAULT_SETTINGS } from '../providers/chat-settings-provider.tsx';

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
 * React context for chat settings management.
 *
 * @internal
 */
export const ChatSettingsContext = createContext<ChatSettingsContextType>({
  globalSettings: DEFAULT_SETTINGS,
  roomSettings: {},
  getEffectiveSettings: () => ({ ...DEFAULT_SETTINGS }),
});
