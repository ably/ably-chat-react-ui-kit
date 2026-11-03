import { ChatClient, ChatClientOptions, createChatClient } from '@ably/chat';
import * as Ably from '@ably/pubsub-device';

import { pubsubRealtimeClientWithToken } from './realtime-client.js';

export const newChatClient = (
  options?: ChatClientOptions,
  pubsubClient?: Ably.PubSubClient
): ChatClient => {
  pubsubClient = pubsubClient ?? pubsubRealtimeClientWithToken();

  return createChatClient(pubsubClient, options);
};
