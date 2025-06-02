import * as Ably from 'ably';
import { ChatClient, LogLevel } from '@ably/chat';

// For demo purposes, you would replace this with your actual Ably API key
// In a real application, you should use token authentication instead of API keys on the client side
const ABLY_API_KEY = 'DZXzPg.dkVR2g:mmDNPV4imhuphA79J5jU6Rb3tBVC307MjFfLNesmCZg';

// Create Ably Realtime client
export const ablyClient = new Ably.Realtime({
  key: ABLY_API_KEY,
  // Use a consistent clientId for the session
  clientId: 'demo-user-' + Math.random().toString(36).substr(2, 9),
});

// Create Chat client using the Ably client
export const chatClient = new ChatClient(ablyClient, {logLevel: LogLevel.Debug, logHandler:console.log});
