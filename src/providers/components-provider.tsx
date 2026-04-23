import React, { ReactNode, useMemo } from 'react';

import { ComponentOverrides, ComponentsContext } from '../context/components-context.tsx';
import { useComponents } from '../hooks/use-components.tsx';

/**
 * Props for {@link ComponentsProvider}.
 */
export interface ComponentsProviderProps {
  /** Children rendered inside the provider scope. */
  children?: ReactNode;
  /**
   * The overrides to apply to this subtree. Each entry either replaces the
   * default shipped component (`ComponentType`) or suppresses it (`null`).
   *
   * Nested providers merge with their parent: children inherit every
   * override from the enclosing scope, and may individually replace or
   * hide any of them.
   *
   * The prop value should be stable between renders — wrap it in
   * `useMemo` on the consumer side, otherwise every render will
   * invalidate the merged value and re-render every downstream consumer.
   */
  overrides?: ComponentOverrides;
}

/**
 * Provides component overrides to descendant UI-kit components.
 *
 * The provider inherits overrides from any enclosing `ComponentsProvider`,
 * shallow-merges the new ones on top, and memoizes the merged object so
 * downstream consumers only re-render when an override changes.
 *
 * @example
 * Hide the emoji picker and swap the avatar application-wide:
 *
 * ```tsx
 * const overrides = useMemo(
 *   () => ({
 *     EmojiPicker: null,
 *     Avatar: BrandAvatar,
 *   }),
 *   []
 * );
 *
 * <ComponentsProvider overrides={overrides}>
 *   <ChatWindow ... />
 * </ComponentsProvider>
 * ```
 *
 * @example
 * Scope an override to a subtree:
 *
 * ```tsx
 * <ComponentsProvider overrides={{ Avatar: BrandAvatar }}>
 *   <ChatWindow ... />
 *   <ComponentsProvider overrides={{ MessageActions: null }}>
 *     <ReadOnlyRoom ... />
 *   </ComponentsProvider>
 * </ComponentsProvider>
 * ```
 *
 * @public
 */
export const ComponentsProvider = ({ children, overrides }: ComponentsProviderProps) => {
  const parent = useComponents();
  const merged = useMemo<ComponentOverrides>(
    () => ({ ...parent, ...overrides }),
    [parent, overrides]
  );
  return <ComponentsContext.Provider value={merged}>{children}</ComponentsContext.Provider>;
};
