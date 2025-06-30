import { useContext } from 'react';

import { ChatSettingsContext, ChatSettingsContextType } from '../context/chat-settings-context.tsx';

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
export const useChatSettings = (): ChatSettingsContextType => {
  return useContext(ChatSettingsContext);
};
