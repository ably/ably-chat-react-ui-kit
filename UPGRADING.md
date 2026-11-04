# Upgrading Guide

## Upgrading from 0.3.x to 0.4.0

### Node.js Version Requirement

Version 0.4.0 drops support for Node.js 20. You must upgrade to Node.js 22 or newer in your development, CI and production environments.

### @ably/chat and Ably Pub/Sub Dependencies

This release updates the peer dependency to `@ably/chat` 2.0.0, which uses `@ably/pubsub-device` instead of the `ably` package. Update your dependencies:

```bash
npm uninstall ably
npm install @ably/chat@^2.0.0 @ably/pubsub-device@^3.0.0
```

Then update how you create your clients:

```diff
- import * as Ably from 'ably';
- import { ChatClient } from '@ably/chat';
+ import { createClient } from '@ably/pubsub-device';
+ import { createChatClient } from '@ably/chat';

- const realtimeClient = new Ably.Realtime({ key: '<API_KEY>', clientId: '<client-id>' });
- const chatClient = new ChatClient(realtimeClient);
+ const pubsubClient = createClient({ key: '<API_KEY>', clientId: '<client-id>' });
+ const chatClient = createChatClient(pubsubClient);
```

See the [`@ably/chat` upgrade guide](https://github.com/ably/ably-chat-js/blob/main/UPGRADING.md) for the full list of changes in `@ably/chat` 2.0.0.

## Upgrading from 0.1.x to 0.2.0

### Node.js Version Requirement

Version 0.2.0 drops support for Node.js 18. You must upgrade to Node.js 20 or newer in your development, CI and production environments.

### @ably/chat Dependency

This release updates the peer dependency to `@ably/chat` 1.0.0. If you're managing the `@ably/chat` package separately, ensure you update it to version 1.0.0 or later:

```bash
npm install @ably/chat@^1.0.0
```
