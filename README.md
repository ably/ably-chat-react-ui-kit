![Ably Chat Header](images/Chat-UI-Kits-github-v1.1.png)

# Ably Chat React UI Kit

A library of configurable UI components for building chat applications with the Ably Chat SDK. This package provides
ready-to-use React components that integrate seamlessly with [`@ably/chat`](https://github.com/ably/ably-chat-js) to
handle real-time messaging, presence, typing indicators, and more.

## Getting started

Everything you need to get started with Ably Chat React UI Kit:

* [About Ably Chat.](https://ably.com/docs/chat)
* [Getting started with Ably Chat in JavaScript.](https://ably.com/docs/chat/getting-started/javascript)
* [Getting started with Ably Chat in React.](https://ably.com/docs/chat/getting-started/react)
* [Getting started with Ably Chat React UI Kit.](https://ably.com/docs/chat/getting-started/react-ui-kit)
* [SDK and usage docs in JavaScript.](https://ably.com/docs/chat/setup?lang=javascript)
* [SDK and usage docs in React.](https://ably.com/docs/chat/setup?lang=react)
* [SDK and usage docs for React UI kit.](https://ably.com/docs/chat/react-ui-kit/setup)
* [API documentation (JavaScript).](https://sdk.ably.com/builds/ably/ably-chat-js/main/typedoc/modules/chat-js.html)
* [API documentation (React Hooks).](https://sdk.ably.com/builds/ably/ably-chat-js/main/typedoc/modules/chat-react.html)
* [API documentation (React UI kit).](https://sdk.ably.com/builds/ably/ably-chat-react-ui-kit/main/storybook/)
* [Chat Example App.](https://github.com/ably/ably-chat-js/tree/main/demo)
* [Chat Example App using Ably Chat React UI Kit.](https://github.com/ably/ably-chat-react-ui-kit/tree/main/examples/group-chat)
* Play with the [livestream chat demo.](https://ably-livestream-chat-demo.vercel.app/)

### Installation

```bash
npm install @ably/chat-react-ui-kit @ably/chat ably react react-dom
```

## Supported Platforms

This SDK supports the following platforms:

| Platform     | Support                                                                                                    |
|--------------|------------------------------------------------------------------------------------------------------------|
| Browsers     | All major desktop browsers, including Chrome, Firefox, Edge and Opera. Internet Explorer is not supported. |
| Node.js      | Version 20 or newer.                                                                                       |
| TypeScript   | Fully supported, the library is written in TypeScript.                                                     |
| React        | Version 18 or newer. Includes providers and hooks for deep integration with the React ecosystem.           |

> [!NOTE] The Chat UI Components SDK can be installed from NPM and requires the core Ably Chat SDK as a peer dependency.
>

## Core Components

### App Component

Full application component that provides a complete chat interface out of the box:
- Integrated sidebar for room navigation
- Chat area with message display and input
- Theme support (light/dark mode)
- Avatar management

### ChatWindow
A comprehensive chat interface for individual rooms featuring:
- Message history with pagination
- Real-time message display
- Message editing and deletion
- Reactions support
- Typing indicators

### Sidebar
A collapsible navigation component for managing multiple chat rooms:
- Room list with activity indicators
- Room creation and management
- Presence and occupancy display
- Theme toggle integration

## Usage

The following example demonstrates how to set up a complete chat application using the core components. This includes initializing the Ably client, wrapping your app with the required providers, and rendering the `App` component with a sidebar and chat window:

```tsx
import * as Ably from 'ably';
import { ChatClient } from '@ably/chat';
import { ChatClientProvider } from '@ably/chat/react';
import {
  App,
  ThemeProvider,
  AvatarProvider,
  ChatSettingsProvider,
} from '@ably/chat-react-ui-kit';

// Don't forget to import the styles
import '@ably/chat-react-ui-kit/dist/style.css';

// Initialize Ably Realtime client with your API key and a unique client ID
const ablyClient = new Ably.Realtime({
  key: '<your-ably-api-key>',
  clientId: 'user-' + Math.random().toString(36).slice(2, 9),
});

// Create a Chat client using the Ably Realtime client
const chatClient = new ChatClient(ablyClient);

function MyApp() {
  return (
    // ThemeProvider: Enables light/dark mode theming with optional persistence
    <ThemeProvider options={{ persist: true, defaultTheme: 'light' }}>
      {/* AvatarProvider: Manages user avatar state across the application */}
      <AvatarProvider>
        {/* ChatSettingsProvider: Provides chat configuration context */}
        <ChatSettingsProvider>
          {/* ChatClientProvider: Makes the chat client available to all child components */}
          <ChatClientProvider client={chatClient}>
            {/*
              App: The main chat application component
              - Renders a Sidebar for room navigation (create, select, leave rooms)
              - Renders a ChatWindow for the active room with messages, typing indicators, and reactions
              - initialRoomNames: Pre-populate the sidebar with these room names
            */}
            <App initialRoomNames={['general', 'random']} />
          </ChatClientProvider>
        </ChatSettingsProvider>
      </AvatarProvider>
    </ThemeProvider>
  );
}
```

### Using Individual Components

For more control, you can use `ChatWindow` and `Sidebar` independently:

```tsx
import { useState } from 'react';
import { ChatRoomProvider } from '@ably/chat/react';
import {
  ChatWindow,
  Sidebar,
  ThemeProvider,
} from '@ably/chat-react-ui-kit';

// Assumes ChatClientProvider is already set up in a parent component

function CustomChatApp() {
  const [rooms, setRooms] = useState<string[]>(['general']);
  const [activeRoom, setActiveRoom] = useState<string | undefined>('general');

  const addRoom = (name: string) => {
    setRooms((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setActiveRoom(name);
  };

  const leaveRoom = (name: string) => {
    setRooms((prev) => {
      const next = prev.filter((r) => r !== name);
      // Update active room based on the new list to avoid stale state
      if (next.length === 0) {
        setActiveRoom(undefined);
      } else if (name === activeRoom) {
        setActiveRoom(next[0]);
      }
      return next;
    });
  };

  return (
    <ThemeProvider>
      <div className="flex h-screen">
        {/* Sidebar: Manages room list, creation, and selection */}
        <Sidebar
          roomNames={rooms}
          activeRoomName={activeRoom}
          addRoom={addRoom}
          setActiveRoom={setActiveRoom}
          leaveRoom={leaveRoom}
        />

        {/* ChatWindow: Displays messages, input, typing indicators for the active room */}
        {activeRoom && (
          <ChatRoomProvider key={activeRoom} name={activeRoom}>
            <ChatWindow
              roomName={activeRoom}
              enableTypingIndicators={true}
            />
          </ChatRoomProvider>
        )}
      </div>
    </ThemeProvider>
  );
}
```

## Releases

The [CHANGELOG.md](./CHANGELOG.md) contains details of the latest releases for this SDK. You can also view all Ably releases on [changelog.ably.com](https://changelog.ably.com).

## Contribute

Read the [MAINTAINERS.md](./MAINTAINERS.md) guidelines to contribute to Ably or [Share feedback or request](https://forms.gle/mBw9M53NYuCBLFpMA) a new feature.

## Support and known issues

For help or technical support, visit Ably's [support page](https://ably.com/support). You can also view the [community reported Github issues](https://github.com/ably/ably-chat-react-ui-kit/issues) or raise one yourself.
