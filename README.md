# Ably Chat React UI Components (Early Alpha)

A library of configurable UI components for building chat applications with the Ably Chat SDK. This package provides
ready-to-use React components that integrate seamlessly with [`@ably/chat`](https://github.com/ably/ably-chat-js) to
handle real-time messaging, presence, typing indicators, and more.

## Installation

```bash
npm install ably-chat-react-ui-components
```

### Peer Dependencies

This package requires the following peer dependencies:

```bash
npm install @ably/chat react react-dom
```

## Usage

Import and use the components in your React application:

```tsx
import { App, ChatWindow, Sidebar } from 'ably-chat-react-ui-components';
import 'ably-chat-react-ui-components/dist/styles.css';
```

## Providers Setup

Before using any components, you need to set up the required React context providers. These providers manage the chat
client connection, theming, and avatar generation.

### Basic Provider Setup

```tsx
import { ChatClient } from '@ably/chat';
import { ChatClientProvider } from '@ably/chat/react';
import { ThemeProvider, AvatarProvider, ChatSettingsProvider } from 'ably-chat-react-ui-components';
import * as Ably from 'ably';

// Create Ably Realtime client
const ablyClient = new Ably.Realtime({
  key: 'YOUR_ABLY_API_KEY', // Replace with your Ably API key
  clientId: 'your-chat-client-id',
});

const chatClient = new ChatClient(ablyClient);

function App() {
  return (
    <ThemeProvider options={{ persist: true, defaultTheme: 'light' }}>
      <AvatarProvider>
        <ChatSettingsProvider>
          <ChatClientProvider client={chatClient}>
            {/* Your chat components go here */}
            <YourChatComponents />
          </ChatClientProvider>
        </ChatSettingsProvider>
      </AvatarProvider>
    </ThemeProvider>);
}
```

### Provider Responsibilities

- **`ChatClientProvider`** – Provides the Ably Chat client for real-time messaging
- **`ThemeProvider`** – Manages light/dark theme state and persistence
- **`AvatarProvider`** – Handles avatar generation and caching for users and rooms
- **`ChatRoomProvider`** – Provides room-specific context (wrap around room-specific components)

### Room-Specific Components

Components that operate on specific chat rooms need to be wrapped in a `ChatRoomProvider`:

```tsx
import { ChatRoomProvider } from '@ably/chat/react';

function RoomSpecificComponent() {
  return (
    <ChatRoomProvider name="general" attach={true}>
      {/* Room-specific components like ChatWindow */}
    </ChatRoomProvider>
  );
}
```

## Core Components

> **Note:** All examples below assume you have the [basic provider setup](#basic-provider-setup) in place.

### App

The main application component that provides a complete chat interface out of the box. It includes:

- Integrated sidebar for room navigation
- Chat area with message display and input
- Theme support (light/dark mode)
- Avatar management
- Responsive layout

```tsx
import { App } from 'ably-chat-react-ui-components';

// Within your provider setup:
<App />
```

### ActiveChatWindow

A comprehensive chat interface for individual rooms featuring:

- Message history with pagination
- Real-time message display
- Message editing and deletion
- Reactions support
- Typing indicators
- Customizable header and footer content

```tsx
import { ChatRoomProvider } from '@ably/chat/react';
import { ActiveChatWindow } from 'ably-chat-react-ui-components';

// Within your provider setup:
<ChatRoomProvider roomName="general">
  <ActiveChatWindow
    roomName="general"
    customHeaderContent={<RoomInfo />}
    initialHistoryLimit={50}
  />
</ChatRoomProvider>;
```

### Sidebar

A collapsible navigation component for managing multiple chat rooms:

- Room list with activity indicators
- Room creation and management
- Presence and occupancy display
- Theme toggle integration
- Typing indicators per room

```tsx
import { Sidebar } from 'ably-chat-react-ui-components';

// Within your provider setup:
<Sidebar
  initialRoomNames={['general', 'support', 'random']}
  activeRoomName={activeRoom}
  onChangeActiveRoom={setActiveRoom}
  isCollapsed={isCollapsed}
  onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
  width="300px"
/>;
```

## Quick Start Example

Here's a complete minimal example:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChatClient } from '@ably/chat';
import * as Ably from 'ably';
import { ChatClientProvider } from '@ably/chat/react';
import 'ably-chat-react-ui-components/dist/styles.css';
import { App, ThemeProvider, AvatarProvider, ChatSettingsProvider } from 'ably-chat-react-ui-components';

// Vite will replace this at build time
const ABLY_API_KEY = import.meta.env.VITE_ABLY_API_KEY as string;

// Create Ably Realtime client
export const ablyClient = new Ably.Realtime({
  key: "your-ably-api-key", // Replace with your Ably API key
  clientId: "your-chat-client-id", // Set your client ID
});

// Create Chat client using the Ably client
export const chatClient = new ChatClient(ablyClient);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider options={{ persist: true, defaultTheme: 'light' }}>
      <AvatarProvider>
        <ChatSettingsProvider>
          <ChatClientProvider client={chatClient}>
            <App initialRoomNames={['my-first-room']} />
          </ChatClientProvider>
        </ChatSettingsProvider>
      </AvatarProvider>
    </ThemeProvider>
  </React.StrictMode>
);
```

## Development

### Prerequisites

- Node.js (v20 or higher)
- npm
- An Ably API key

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ably/ably-chat-react-ui-components.git
   cd ably-chat-react-ui-components
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file and add your Ably API key:
   ```
   VITE_ABLY_API_KEY=your_ably_api_key_here
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

### Storybook

To explore components in isolation and view their documentation:

1. **Start Storybook:**
   ```bash
   npm run storybook
   ```

This will start Storybook at `http://localhost:6006` where you can interact with individual components and see their
various states and configurations.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build the library for production
- `npm run storybook` - Start Storybook development server
- `npm run build-storybook` - Build Storybook for deployment
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Built With

- **[@ably/chat](https://github.com/ably/ably-chat-js)** - Provides all underlying chat real-time functionality
- **React 18** - UI framework
- **TypeScript** - Type safety and development experience
- **Tailwind CSS** - Styling and theming
- **Vite** - Build tool and development server
- **Storybook** - Component development and documentation

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

## Contributing

We welcome contributions! Please see our [MAINTAINERS.md](MAINTAINERS.md) for guidelines on how to contribute to this
project.
