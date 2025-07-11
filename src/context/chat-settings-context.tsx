import { createContext } from 'react';

/**
 * Interface defining chat feature settings that control UI behavior
 */
export interface ChatSettings {
  /** Whether users can update their own messages after sending */
  allowMessageUpdatesOwn: boolean;
  /** Whether users can update any message (not just their own) */
  allowMessageUpdatesAny: boolean;
  /** Whether users can delete their own messages */
  allowMessageDeletesOwn: boolean;
  /** Whether users can delete any message (not just their own) */
  allowMessageDeletesAny: boolean;
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
