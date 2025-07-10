import { createContext } from 'react';

export interface ChatSettings {
  /** Whether users can update their messages after sending */
  allowMessageUpdates: boolean;
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
 * React context for chat settings management.
 *
 * @internal
 */
export const ChatSettingsContext = createContext<ChatSettingsContextType | undefined>(undefined);
