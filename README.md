# Ably Chat React UI Components (Alpha)

Custom lightweight UI components for use with [@ably/chat](https://github.com/ably/ably-chat-js). This is currently in alpha and is not yet feature-complete. It is designed to be used with React and provides a set of components for building chat applications on top of the Ably Chat SDK.


## Installation

```bash
npm install ably-chat-react-ui-compents @ably/chat
```

## Layout and Styling

The UI Kit uses a responsive layout with the following structure:

- **Room List**: To view available chat rooms
- **Chat Window**: To display messages, send messages, view typing indicators and send message reactions.
- **Message Bubbles**: To display chat messages with sender/receiver styles.
- **Settings Panel**: To configure room options, such as enabling/disabling typing indicators.

## Quick Start

```tsx
import React from 'react';
import { App } from 'ably-chat-react-ui-compents';
import { ChatClient } from '@ably/chat';

const App = () => {
  // Initialize the Realtime client
   const realtimeClient = new Ably.Realtime('YOUR_ABLY_API_KEY');
  // Initialize Ably Chat client
  const client = new ChatClient(realtimeClient)

  return (
    <div style={{ height: '100vh' }}>
      <App
        client={client}
      />
    </div>
  );
};

export default App;
```

## Custom Usage

You can use individual components to build your own custom chat UI:

```tsx
import React, { useState } from 'react';
import {
  ChatProvider,
  TypingProvider,
  RoomList,
  Room,
  RoomSettings,
} from 'ably-chat-react-ui-compents';
import { ChatClient } from '@ably/chat';

const CustomChat = () => {
  // State for selected room and settings visibility
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  return (
        <ChatProvider client={client} currentUser={currentUser}>
            <div className="flex justify-center items-center h-screen">
              <div className="w-4/5 h-4/5 flex flex-col">
                <div className="flex h-full">
                  {/* Room List (1/4 width) */}
                  <div className="w-1/4 h-full flex flex-col pr-4">
                    <RoomList
                      onRoomSelect={setSelectedRoomId}
                      selectedRoomId={selectedRoomId}
                      className="flex-grow"
                    />
                  </div>

                  {/* Chat Window (3/4 width) */}
                  <div className="w-3/4 h-full flex flex-col max-h-full">
                    {selectedRoomId ? (
                      <div className="flex flex-col h-full max-h-full">
                        {/* Room Header with Settings Button */}
                        <div className="card flex justify-between items-center border-b py-2 px-4 flex-shrink-0 h-14">
                          <h2>Room: {selectedRoomId}</h2>
                          <button onClick={() => setShowSettings(!showSettings)}>
                            {showSettings ? 'Hide Settings' : 'Settings'}
                          </button>
                        </div>

                        {/* Room Component */}
                        <Room
                          id={selectedRoomId}
                          className="flex-grow overflow-hidden"
                        >
                          {showSettings && (
                            <div className="absolute top-12 right-0 w-80 z-10">
                              <RoomSettings onClose={() => setShowSettings(false)} />
                            </div>
                          )}
                        </Room>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full card">
                        <p className="text-gray-500">Select a room to start chatting</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
        </ChatProvider>
  );
};
```

## Components

### Atomic Components

- `InputField` - Text input field with label and helper text
- `MessageBubble` - Displays a chat message with sender/receiver styles

### Composite Components

- `RoomList` - Displays a list of available chat rooms with fixed height and scrolling
- `Room` - Container for a chat room with fixed height and overflow handling
- `ChatWindow` - Displays messages with input area and typing indicators
- `RoomSettings` - Settings panel for configuring room options

### Layout Components

- `App` - Main application component with responsive layout

## Development

### Code Quality Tools

This project uses ESLint and Prettier to ensure code quality and consistent formatting:

- **ESLint**: Analyzes code for potential errors and enforces coding standards
- **Prettier**: Ensures consistent code formatting

#### Available Scripts

- `npm run lint`: Checks for linting issues in the codebase
- `npm run lint:fix`: Automatically fixes linting issues where possible
- `npm run format`: Formats all TypeScript, TSX, and CSS files using Prettier
- `npm run format:check`: Checks if all files are properly formatted without making changes

Then add the following to your package.json:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.css": "prettier --write"
  }
}
```

## License

MIT
