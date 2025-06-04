import React, { useContext, useState, createContext } from 'react';

interface CurrentRoomContextType {
  currentRoomId: string | null;
  setCurrentRoom: (roomId: string | null) => void;
}

// Create the context with default values
export const CurrentRoomContext = createContext<CurrentRoomContextType>({
  currentRoomId: null,
  setCurrentRoom: () => {},
});

// Provider component for the current room context
export const CurrentRoomProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  return (
    <CurrentRoomContext.Provider
      value={{
        currentRoomId,
        setCurrentRoom: setCurrentRoomId,
      }}
    >
      {children}
    </CurrentRoomContext.Provider>
  );
};

// Hook to use the current room context
export const useCurrentRoom = () => {
  return useContext(CurrentRoomContext);
};
