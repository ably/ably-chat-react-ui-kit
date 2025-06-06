import React, { useContext, useState, createContext, useCallback, useMemo, useEffect } from 'react';

/**
 * Type definition for room identifiers
 */
type RoomId = string | null;

/**
 * Callback function type for room change events
 */
type RoomChangeCallback = (roomId: RoomId, previousRoomId: RoomId) => void;

/**
 * Shape of the CurrentRoomContext value
 */
interface CurrentRoomContextType {
  /**
   * The currently active room ID, null if no room is selected
   */
  currentRoomId: RoomId;

  /**
   * Sets the current active room
   * @param roomId - The room ID to set as current, or null to clear
   */
  setCurrentRoom: (roomId: RoomId) => void;

  /**
   * Indicates if there's a current room selected
   */
  hasCurrentRoom: boolean;

  /**
   * Clears the current room selection
   */
  clearCurrentRoom: () => void;

  /**
   * Registers a callback to be called when the room changes
   * @param callback - Function to call when room changes
   * @returns Cleanup function to remove the callback
   */
  onRoomChange: (callback: RoomChangeCallback) => () => void;
}

/**
 * Props for the CurrentRoomProvider component
 */
interface CurrentRoomProviderProps {
  /**
   * Child components that will have access to the current room context
   */
  children: React.ReactNode;

  /**
   * Initial room ID to set when the provider mounts
   */
  initialRoomId?: RoomId;

  /**
   * Callback fired when the room changes
   */
  onRoomChange?: RoomChangeCallback;
}

/**
 * React context for managing the currently active room across the application
 * Provides room state management with change notifications and utility methods
 */
export const CurrentRoomContext = createContext<CurrentRoomContextType | undefined>(undefined);

/**
 * CurrentRoomProvider manages the currently active room state and provides it to child components
 *
 * Features:
 * - Current room state management
 * - Room change notifications
 * - Utility methods for room operations
 * - Initial room support
 * - Type-safe room ID handling
 *
 * @example
 * // Basic usage
 * <CurrentRoomProvider>
 *   <ChatApplication />
 * </CurrentRoomProvider>
 *
 * @example
 * // With initial room and change handler
 * <CurrentRoomProvider
 *   initialRoomId="room-123"
 *   onRoomChange={(newRoom, prevRoom) => {
 *     console.log(`Room changed from ${prevRoom} to ${newRoom}`);
 *   }}
 * >
 *   <ChatApplication />
 * </CurrentRoomProvider>
 */
export const CurrentRoomProvider: React.FC<CurrentRoomProviderProps> = ({
  children,
  initialRoomId = null,
  onRoomChange: externalOnRoomChange,
}) => {
  const [currentRoomId, setCurrentRoomId] = useState<RoomId>(initialRoomId);
  const [changeCallbacks, setChangeCallbacks] = useState<Set<RoomChangeCallback>>(new Set());

  // Handle room changes with notifications
  const setCurrentRoom = useCallback(
    (roomId: RoomId) => {
      setCurrentRoomId((prevRoomId) => {
        if (prevRoomId !== roomId) {
          // Notify all registered callbacks
          changeCallbacks.forEach((callback) => {
            try {
              callback(roomId, prevRoomId);
            } catch (error) {
              // TODO: Replace with proper error reporting service in production
              if (process.env.NODE_ENV === 'development') {
                console.error('Error in room change callback:', error);
              }
            }
          });

          // Notify external callback if provided
          if (externalOnRoomChange) {
            try {
              externalOnRoomChange(roomId, prevRoomId);
            } catch (error) {
              if (process.env.NODE_ENV === 'development') {
                console.error('Error in external room change callback:', error);
              }
            }
          }
        }
        return roomId;
      });
    },
    [changeCallbacks, externalOnRoomChange]
  );

  // Clear current room
  const clearCurrentRoom = useCallback(() => {
    setCurrentRoom(null);
  }, [setCurrentRoom]);

  // Register room change callback
  const onRoomChange = useCallback((callback: RoomChangeCallback) => {
    setChangeCallbacks((prev) => new Set(prev).add(callback));

    // Return cleanup function
    return () => {
      setChangeCallbacks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(callback);
        return newSet;
      });
    };
  }, []);

  // Derived state
  const hasCurrentRoom = useMemo(() => currentRoomId !== null, [currentRoomId]);

  // Context value with memoization to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      currentRoomId,
      setCurrentRoom,
      hasCurrentRoom,
      clearCurrentRoom,
      onRoomChange,
    }),
    [currentRoomId, setCurrentRoom, hasCurrentRoom, clearCurrentRoom, onRoomChange]
  );

  return <CurrentRoomContext.Provider value={contextValue}>{children}</CurrentRoomContext.Provider>;
};

/**
 * Hook to access the current room context
 *
 * @returns The current room context value
 * @throws Error if used outside of a CurrentRoomProvider
 *
 * @example
 * // Basic usage
 * const { currentRoomId, setCurrentRoom } = useCurrentRoom();
 *
 * @example
 * // Using all features
 * const {
 *   currentRoomId,
 *   setCurrentRoom,
 *   hasCurrentRoom,
 *   clearCurrentRoom,
 *   onRoomChange
 * } = useCurrentRoom();
 *
 * // Register for room change notifications
 * useEffect(() => {
 *   const cleanup = onRoomChange((newRoom, prevRoom) => {
 *     // Handle room change
 *   });
 *   return cleanup;
 * }, [onRoomChange]);
 */
export const useCurrentRoom = (): CurrentRoomContextType => {
  const context = useContext(CurrentRoomContext);

  if (context === undefined) {
    throw new Error(
      'useCurrentRoom must be used within a CurrentRoomProvider. ' +
        'Make sure your component is wrapped with <CurrentRoomProvider>.'
    );
  }

  return context;
};
