import { useContext } from 'react';

import { AvatarContext, type AvatarContextType } from '../context/avatar-context.tsx';

/**
 * Hook to access the avatar context with comprehensive avatar management.
 *
 * @returns The avatar context value
 * @throws Error if used outside of an AvatarProvider
 *
 * @example
 * // Basic usage
 * const { getAvatarForUser, setUserAvatar } = useAvatar();
 * const userAvatar = getAvatarForUser('user-123', 'John Doe');
 *
 * @example
 * // Listen for avatar changes
 * const { onAvatarChange } = useAvatar();
 * useEffect(() => {
 *   const cleanup = onAvatarChange((type, id, avatar, prev) => {
 *     console.log(`${type} avatar changed for ${id}`);
 *   });
 *   return cleanup;
 * }, [onAvatarChange]);
 *
 * @example
 * // Backup and restore avatars
 * const { exportAvatars, importAvatars } = useAvatar();
 * const backup = exportAvatars();
 * // ... later
 * importAvatars(backup);
 */
export const useAvatar = (): AvatarContextType => {
  const context = useContext(AvatarContext);

  if (context === undefined) {
    throw new Error(
      'useAvatar must be used within an AvatarProvider. ' +
        'Make sure your component is wrapped with <AvatarProvider>.'
    );
  }

  return context;
};
