import { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import { ChatWindow } from '../components/molecules/chat-window.tsx';
import { RoomInfo } from '../components/molecules/room-info.tsx';
import { RoomReaction } from '../components/molecules/room-reaction.tsx';
import { ChatRoomProvider } from '../../.storybook/mocks/mock-ably-chat';
import { AvatarProvider } from '../providers/avatar-provider';
import { ChatSettingsProvider } from '../providers';

type StoryProps = React.ComponentProps<typeof ChatWindow> & {
  mockOverrides?: any;
};

const meta: Meta<StoryProps> = {
  title: 'Molecules/ChatWindow',
  component: ChatWindow,
  decorators: [
    (Story, context) => (
      <ChatRoomProvider
        name={context.args.roomName || 'general'}
        mockOverrides={context.args.mockOverrides}
      >
        <ChatSettingsProvider>
          <AvatarProvider>
            <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-950">
              <div className="h-full w-full max-w-4xl border rounded-lg overflow-hidden bg-white dark:bg-gray-900 flex flex-col">
                <Story />
              </div>
            </div>
          </AvatarProvider>
        </ChatSettingsProvider>
      </ChatRoomProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: {
    roomName: 'general',
    enableTypingIndicators: true,
    windowSize: 200,
    mockOverrides: {
      clientId: 'user1',
    },
  },
  argTypes: {
    mockOverrides: {
      table: { disable: true },
    },
    customHeaderContent: {
      control: false, // Disable control for React nodes
    },
    customFooterContent: {
      control: false, // Disable control for React nodes
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const WithCustomHeader: Story = {
  args: {
    customHeaderContent: <RoomInfo />,
  },
};

export const WithCustomFooter: Story = {
  args: {
    customFooterContent: <RoomReaction />,
  },
};

export const WithBothCustomContent: Story = {
  args: {
    customHeaderContent: <RoomInfo />,
    customFooterContent: <RoomReaction />,
  },
};
