import React, { useContext } from 'react';

// Create the context with a default value of null
export const CurrentRoomContext = React.createContext<string | null>(null);

// Hook to use the current room context
export const useCurrentRoom = (): string | null => {
  return useContext(CurrentRoomContext);
};
