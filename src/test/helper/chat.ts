import { ChatClient, ChatClientOptions } from '@ably/chat';
import * as Ably from 'ably';

import { ablyRealtimeClientWithToken } from './realtime-client.js';

export const newChatClient = (
  options?: ChatClientOptions,
  realtimeClient?: Ably.Realtime
): ChatClient => {
  realtimeClient = realtimeClient ?? ablyRealtimeClientWithToken();

  return new ChatClient(realtimeClient, options);
};
