import { ComponentType, createContext } from 'react';

import type { AvatarProps } from '../components/atoms/avatar.tsx';
import type { EmojiPickerProps } from '../components/molecules/emoji-picker.tsx';
import type { EmojiWheelProps } from '../components/molecules/emoji-wheel.tsx';
import type { MessageActionsProps } from '../components/molecules/message-actions.tsx';
import type { NoMoreMessagesFooterProps } from '../components/molecules/no-more-messages-footer.tsx';

/**
 * A component override.
 *
 * - A `ComponentType<P>` replaces the default component.
 * - `null` suppresses rendering at every call site that consumes this slot.
 */
export type ComponentOverride<P> = ComponentType<P> | null;

/**
 * The set of UI components that can be overridden through the
 * {@link ComponentsProvider}.
 *
 * Each entry is optional; anything not supplied falls through to the
 * default component shipped with the UI kit. Supplying `null` hides the
 * slot entirely, which is useful for disabling built-in UI (for example,
 * passing `EmojiPicker: null` to a `MessageInput` that should not expose
 * emojis).
 */
export interface ComponentOverrides {
  /** Renders user and room avatars. */
  Avatar?: ComponentOverride<AvatarProps>;
  /** Renders the emoji picker inside `MessageInput` and `ChatMessage`. */
  EmojiPicker?: ComponentOverride<EmojiPickerProps>;
  /** Renders the radial emoji-selection wheel used by `RoomReaction`. */
  EmojiWheel?: ComponentOverride<EmojiWheelProps>;
  /** Renders the hover toolbar of message actions (edit, delete, react). */
  MessageActions?: ComponentOverride<MessageActionsProps>;
  /**
   * Renders the footer shown in `ChatMessageList` once history has been
   * fully loaded.
   */
  NoMoreMessagesFooter?: ComponentOverride<NoMoreMessagesFooterProps>;
}

/**
 * Context value holding component overrides.
 *
 * The default is an empty object, so the provider is opt-in: unwrapped
 * consumers transparently get the shipped defaults.
 *
 * @internal
 */
export const ComponentsContext = createContext<ComponentOverrides>({});
