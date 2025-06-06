import React, { useContext, useState, createContext, useCallback, useMemo } from 'react';
import { RoomOptions } from '@ably/chat';

/**
 * Application state interface, stores the current room ID, room options, and global options
 */
interface AppState {
  /**
   * The currently active room ID, null if no room is selected
   */
  currentRoomId?: string;

  /**
   * Room-specific options mapped by room ID
   */
  roomOptions: Record<string, RoomOptions>;

  /**
   * Global room options applied to all rooms unless overridden
   */
  globalRoomOptions?: RoomOptions;
}

/**
 * Shape of the AppStateContext value
 */
interface AppStateContextType {
  /**
   * The currently active room ID, undefined if no room is selected
   */
  currentRoomId?: string;

  /**
   * Sets the current active room
   * @param roomId - The room ID to set as current, or undefined to clear
   */
  setCurrentRoom: (roomId?: string) => void;

  /**
   * Indicates if there's a current room selected
   */
  hasCurrentRoom: boolean;

  /**
   * Clears the current room selection
   */
  clearCurrentRoom: () => void;

  /**
   * Gets options for the specified room, combining global and room-specific options
   * @param roomId - The room ID to get options for
   */
  getRoomOptions: (roomId: string) => RoomOptions | undefined;

  /**
   * Gets options for the current room, or global options if no room is selected
   */
  getCurrentRoomOptions: () => RoomOptions | undefined;

  /**
   * Sets options for a specific room
   * @param roomId - The room ID to set options for
   * @param options - The options to set
   */
  setRoomOptions: (roomId: string, options: Partial<RoomOptions>) => void;

  /**
   * Sets global options applied to all new rooms unless overridden
   * @param options - The global options to set
   */
  setGlobalRoomOptions: (options: Partial<RoomOptions>) => void;
}

/**
 * Props for the AppStateProvider component
 */
interface AppStateProviderProps {
  /**
   * Child components that will have access to the app state context
   */
  children: React.ReactNode;

  /**
   * Initial room ID to set when the provider mounts
   */
  initialRoomId?: string;

  /**
   * Initial global room options
   */
  initialGlobalOptions?: RoomOptions;
}

/**
 * React context for managing application state across the application
 * Provides room state management.
 */
export const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

/**
 * AppStateProvider manages the application state and provides it to child components
 *
 * Features:
 * - Current room state management
 * - Room options management (global and per-room)
 *
 * @example
 * // Basic usage
 * <AppStateProvider>
 *   <ChatApplication />
 * </AppStateProvider>
 *
 * @example
 * // With initial room and options
 * <AppStateProvider
 *   initialRoomId="room-123"
 *   initialGlobalOptions={{ occupancy: { enableEvents: true } }}
 * >
 *   <ChatApplication />
 * </AppStateProvider>
 */
export const AppStateProvider: React.FC<AppStateProviderProps> = ({
  children,
  initialRoomId,
  initialGlobalOptions,
}) => {
  // Initialize state
  const [state, setState] = useState<AppState>({
    currentRoomId: initialRoomId,
    roomOptions: {},
    globalRoomOptions: initialGlobalOptions,
  });

  // Handle room changes
  const setCurrentRoom = useCallback((roomId?: string) => {
    setState((prevState) => {
      return {
        ...prevState,
        currentRoomId: roomId,
      };
    });
  }, []);

  // Clear current room
  const clearCurrentRoom = useCallback(() => {
    setCurrentRoom(undefined);
  }, [setCurrentRoom]);

  // Set room-specific options
  const setRoomOptions = useCallback((roomId: string, options: Partial<RoomOptions>) => {
    setState((prevState) => {
      const currentOptions = prevState.roomOptions[roomId] || {};
      const newOptions = { ...currentOptions, ...options };
      return {
        ...prevState,
        roomOptions: {
          ...prevState.roomOptions,
          [roomId]: newOptions,
        },
      };
    });
  }, []);

  // Set global room options
  const setGlobalRoomOptions = useCallback((options: Partial<RoomOptions>) => {
    setState((prevState) => {
      const newGlobalOptions = { ...prevState.globalRoomOptions, ...options };
      return {
        ...prevState,
        globalRoomOptions: newGlobalOptions,
      };
    });
  }, []);

  // Get options for a specific room
  const getRoomOptions = useCallback(
    (roomId: string): RoomOptions => {
      const roomSpecificOptions = state.roomOptions[roomId] || {};
      return { ...state.globalRoomOptions, ...roomSpecificOptions };
    },
    [state.globalRoomOptions, state.roomOptions]
  );

  // Get options for the current room
  const getCurrentRoomOptions = useCallback((): RoomOptions | undefined => {
    if (!state.currentRoomId) {
      return state.globalRoomOptions;
    }
    return getRoomOptions(state.currentRoomId);
  }, [state.currentRoomId, state.globalRoomOptions, getRoomOptions]);

  // Derived state
  const hasCurrentRoom = useMemo(() => state.currentRoomId !== null, [state.currentRoomId]);

  // Context value with memoization to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      currentRoomId: state.currentRoomId,
      setCurrentRoom,
      hasCurrentRoom,
      clearCurrentRoom,
      getRoomOptions,
      getCurrentRoomOptions,
      setRoomOptions,
      setGlobalRoomOptions,
    }),
    [
      state.currentRoomId,
      setCurrentRoom,
      hasCurrentRoom,
      clearCurrentRoom,
      getRoomOptions,
      getCurrentRoomOptions,
      setRoomOptions,
      setGlobalRoomOptions,
    ]
  );

  return <AppStateContext.Provider value={contextValue}>{children}</AppStateContext.Provider>;
};

/**
 * Hook to access the application state context
 *
 * @returns The application state context value
 * @throws Error if used outside of an AppStateProvider
 *
 * @example
 * // Basic usage
 * const { currentRoomId, setCurrentRoom } = useAppState();
 *
 * @example
 * // Using room options
 * const { getCurrentRoomOptions, setRoomOptions } = useAppState();
 * const options = getCurrentRoomOptions();
 *
 * // Update options for a specific room
 * setRoomOptions('room-123', { occupancy: { enableEvents: false } });
 *
 */
export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);

  if (context === undefined) {
    throw new Error(
      'useAppState must be used within an AppStateProvider. ' +
        'Make sure your component is wrapped with <AppStateProvider>.'
    );
  }

  return context;
};
