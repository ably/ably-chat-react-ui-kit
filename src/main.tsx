import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App.tsx';
import './index.css';
import { chatClient } from './config/ably';
import { ChatClientProvider } from '@ably/chat/react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChatClientProvider client={chatClient}>
      <App />
    </ChatClientProvider>
  </React.StrictMode>
);
