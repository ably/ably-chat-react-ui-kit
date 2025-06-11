import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app';
import './styles.css';
import { ChatClientProvider } from '@ably/chat/react';
import * as Ably from 'ably';
import { ChatClient } from '@ably/chat';
import { AvatarProvider, ChatSettingsProvider, ThemeProvider } from './context';

// Vite will replace this at build time
const ABLY_API_KEY = import.meta.env.VITE_ABLY_API_KEY as string;

// Create Ably Realtime client
export const ablyClient = new Ably.Realtime({
  key: ABLY_API_KEY,
  clientId: 'demo-user-' + Math.random().toString(36).substring(2, 9),
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
