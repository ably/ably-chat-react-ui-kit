import { useContext } from 'react';

import { ComponentOverrides, ComponentsContext } from '../context/components-context.tsx';

/**
 * Hook to read the current set of component overrides.
 *
 * Unlike {@link useChatSettings}, this hook never throws — if no
 * {@link ComponentsProvider} wraps the tree, the hook returns an empty
 * override set, so components silently fall back to their built-in defaults.
 *
 * Typical consumption at a render site:
 *
 * ```tsx
 * const { EmojiPicker = DefaultEmojiPicker } = useComponents();
 * // `EmojiPicker` is now either the shipped default, a custom
 * // component, or `null` (in which case callers should not render it).
 * ```
 *
 * @returns The current overrides (empty when no provider is present).
 *
 * @public
 */
export const useComponents = (): ComponentOverrides => useContext(ComponentsContext);
