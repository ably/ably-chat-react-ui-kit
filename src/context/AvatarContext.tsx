import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { AvatarData } from '../components/atoms/Avatar';

interface AvatarContextType {
  // Methods for getting avatars
  getAvatarForUser: (userId: string, displayName?: string) => AvatarData;
  getAvatarForRoom: (roomId: string, roomName?: string) => AvatarData;

  // Methods for updating avatars
  setUserAvatar: (userId: string, avatar: Partial<AvatarData>) => void;
  setRoomAvatar: (roomId: string, avatar: Partial<AvatarData>) => void;

  // Get all avatars
  getUserAvatars: () => Record<string, AvatarData>;
  getRoomAvatars: () => Record<string, AvatarData>;
}

// Create the context with a default value
const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

// Available colors for avatars
const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-red-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-yellow-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-emerald-500',
  'bg-violet-500',
];

interface AvatarProviderProps {
  children: ReactNode;
}

export const AvatarProvider: React.FC<AvatarProviderProps> = ({ children }) => {
  // State to store user and room avatars
  const [userAvatars, setUserAvatars] = useState<Record<string, AvatarData>>({});
  const [roomAvatars, setRoomAvatars] = useState<Record<string, AvatarData>>({});

  /**
   * Generates a deterministic color based on a string
   * @param text - The text to generate a color from
   * @returns A Tailwind CSS color class
   */
  const generateColor = useCallback((text: string): string => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash + text.charCodeAt(i)) & 0xffffffff;
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }, []);

  /**
   * Generates initials from a display name
   * @param displayName - The name to generate initials from
   * @returns Up to 2 characters of initials
   */
  const generateInitials = useCallback((displayName: string): string => {
    const words = displayName.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return displayName.substring(0, 2).toUpperCase();
  }, []);

  /**
   * Gets or creates an avatar for a user
   * @param userId - The unique identifier for the user
   * @param displayName - Optional display name (defaults to userId if not provided)
   * @returns An AvatarData object for the user
   */
  const getAvatarForUser = useCallback(
    (userId: string, displayName?: string): AvatarData => {
      // If we already have an avatar for this user, return it
      if (userAvatars[userId]) {
        return userAvatars[userId];
      }

      // Otherwise, create a new avatar
      const name = displayName || userId;
      const newAvatar: AvatarData = {
        displayName: name,
        color: generateColor(userId),
        initials: generateInitials(name),
      };

      // Store the new avatar
      setUserAvatars((prev) => ({
        ...prev,
        [userId]: newAvatar,
      }));

      return newAvatar;
    },
    [userAvatars, generateColor, generateInitials]
  );

  /**
   * Gets or creates an avatar for a room
   * @param roomId - The unique identifier for the room
   * @param roomName - Optional room name (defaults to roomId if not provided)
   * @returns An AvatarData object for the room
   */
  const getAvatarForRoom = useCallback(
    (roomId: string, roomName?: string): AvatarData => {
      // If we already have an avatar for this room, return it
      if (roomAvatars[roomId]) {
        return roomAvatars[roomId];
      }

      // Otherwise, create a new avatar
      const name = roomName || roomId.replace(/^room-\d+-/, '').replace(/-/g, ' ');
      const newAvatar: AvatarData = {
        displayName: name,
        color: generateColor(roomId),
        initials: generateInitials(name),
      };

      // Store the new avatar
      setRoomAvatars((prev) => ({
        ...prev,
        [roomId]: newAvatar,
      }));

      return newAvatar;
    },
    [roomAvatars, generateColor, generateInitials]
  );

  /**
   * Updates an existing user avatar or creates a new one
   * @param userId - The unique identifier for the user
   * @param avatar - Partial avatar data to update
   */
  const setUserAvatar = useCallback(
    (userId: string, avatar: Partial<AvatarData>) => {
      setUserAvatars((prev) => {
        const existing = prev[userId] || {
          displayName: userId,
          color: generateColor(userId),
          initials: generateInitials(userId),
        };

        return {
          ...prev,
          [userId]: {
            ...existing,
            ...avatar,
          },
        };
      });
    },
    [generateColor, generateInitials]
  );

  /**
   * Updates an existing room avatar or creates a new one
   * @param roomId - The unique identifier for the room
   * @param avatar - Partial avatar data to update
   */
  const setRoomAvatar = useCallback(
    (roomId: string, avatar: Partial<AvatarData>) => {
      setRoomAvatars((prev) => {
        const name = roomId.replace(/^room-\d+-/, '').replace(/-/g, ' ');
        const existing = prev[roomId] || {
          displayName: name,
          color: generateColor(roomId),
          initials: generateInitials(name),
        };

        return {
          ...prev,
          [roomId]: {
            ...existing,
            ...avatar,
          },
        };
      });
    },
    [generateColor, generateInitials]
  );

  /**
   * Returns all user avatars
   */
  const getUserAvatars = useCallback(() => {
    return userAvatars;
  }, [userAvatars]);

  /**
   * Returns all room avatars
   */
  const getRoomAvatars = useCallback(() => {
    return roomAvatars;
  }, [roomAvatars]);

  // Create the context value and memoize it to prevent unnecessary re-renders
  const value = useMemo(() => ({
    getAvatarForUser,
    getAvatarForRoom,
    setUserAvatar,
    setRoomAvatar,
    getUserAvatars,
    getRoomAvatars,
  }), [
    getAvatarForUser,
    getAvatarForRoom,
    setUserAvatar,
    setRoomAvatar,
    getUserAvatars,
    getRoomAvatars,
  ]);

  return <AvatarContext.Provider value={value}>{children}</AvatarContext.Provider>;
};

/**
 * Hook to use the avatar context
 * @returns The avatar context
 * @throws Error if used outside of an AvatarProvider
 */
export const useAvatar = (): AvatarContextType => {
  const context = useContext(AvatarContext);
  if (context === undefined) {
    throw new Error('useAvatar must be used within an AvatarProvider');
  }
  return context;
};
