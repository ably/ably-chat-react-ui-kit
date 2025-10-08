# Group Chat Demo App

A demonstration application built with Ably Chat React UI Kit. This demo provides a complete chat experience with minimal setup, featuring message history, typing indicators, user presence, and more..

## Prerequisites

- **Node.js** (version 20 or newer)
- **npm** package manager
- **Ably API Key** - Get one free at [ably.com](https://ably.com)

## Installation

1. **Clone or download** the repository:
   ```bash
   git clone git@github.com:ably/ably-chat-react-ui-kit.git
   ```
   
2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up your Ably API key**:
    - Create a `.env` file in the project root
    - Add your Ably API key:
      ```
      VITE_ABLY_API_KEY=your_ably_api_key_here
      ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** to the URL shown in the terminal (typically `http://localhost:5173`)

## What to Expect

Once running, you'll see a complete chat application interface with:
- A sidebar for room navigation
- A main chat area with message history
- The ability to create new rooms and switch between them

## Technology Stack

- **[Ably Chat SDK](https://ably.com/docs/chat)** - Real-time chat functionality
- **[Ably Chat React UI Kit](https://ably.com/docs/chat/getting-started/ui-components-getting-started)** - Pre-built React components
- **React 19**
- **TypeScript**
- **Vite**

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Learn More

- [Ably Chat Documentation](https://ably.com/docs/chat)
- [Getting Started with Ably Chat React UI Kit](https://ably.com/docs/chat/getting-started/react-ui-components)
- [Ably Chat React SDK](https://ably.com/docs/chat/getting-started/react)

## Support

For help or technical support, visit Ably's [support page](https://ably.com/support). You can also view the [community reported Github issues](https://github.com/ably/ably-chat-react-ui-kit/issues) or raise one yourself.