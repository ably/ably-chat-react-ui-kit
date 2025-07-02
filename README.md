![Ably Chat Header](images/JavaScriptChatSDK-github.png)

# Ably Chat React UI Components

A library of configurable UI components for building chat applications with the Ably Chat SDK. This package provides
ready-to-use React components that integrate seamlessly with [`@ably/chat`](https://github.com/ably/ably-chat-js) to
handle real-time messaging, presence, typing indicators, and more.

## Getting started

Everything you need to get started with Ably Chat React UI Components:

* [About Ably Chat.](https://ably.com/docs/chat)
* [Getting started with Ably Chat in JavaScript.](https://ably.com/docs/chat/getting-started/javascript)
* [Getting started with Ably Chat in React.](https://ably.com/docs/chat/getting-started/react)
* [Getting started with Ably Chat React UI Components.](https://ably.com/docs/chat/getting-started/react-ui-components)
* Play with the [livestream chat demo.](https://ably-livestream-chat-demo.vercel.app/)

### Installation

```bash
npm install ably-chat-react-ui-components @ably/chat react react-dom
```

## Supported Platforms

This SDK supports the following platforms:

| Platform     | Support                                                                                                    |
|--------------|------------------------------------------------------------------------------------------------------------|
| Browsers     | All major desktop browsers, including Chrome, Firefox, Edge and Opera. Internet Explorer is not supported. |
| Node.js      | Version 18 or newer.                                                                                       |
| TypeScript   | Fully supported, the library is written in TypeScript.                                                     |
| React        | Version 18 or newer. Includes providers and hooks for deep integration with the React ecosystem.           | |

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

## Releases

The [CHANGELOG.md](./CHANGELOG.md) contains details of the latest releases for this SDK. You can also view all Ably releases on [changelog.ably.com](https://changelog.ably.com).

## Contribute

Read the [MAINTAINERS.md](./MAINTAINERS.md) guidelines to contribute to Ably or [Share feedback or request](https://forms.gle/mBw9M53NYuCBLFpMA) a new feature.

## Support and known issues

For help or technical support, visit Ably's [support page](https://ably.com/support). You can also view the [community reported Github issues](https://github.com/ably/ably-chat-react-ui-components/issues) or raise one yourself.

