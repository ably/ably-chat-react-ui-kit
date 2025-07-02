import { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { ConnectionStatus } from '@ably/chat';

import { App } from '../app/app.tsx';
import { ChatClientProvider, MockChatClient } from '../../.storybook/mocks/mock-ably-chat';
import { AvatarProvider } from '../providers/avatar-provider';
import { ChatSettingsProvider, ThemeProvider } from '../providers';

// Extend the component props for Storybook to include mockOverrides
type StoryProps = React.ComponentProps<typeof App> & {
  mockOverrides?: any;
};

const meta: Meta<StoryProps> = {
  title: 'App/App',
  component: App,
  decorators: [
    (Story, context) => (
      <ChatClientProvider client={new MockChatClient()} mockOverrides={context.args.mockOverrides}>
        <ThemeProvider>
          <ChatSettingsProvider>
            <AvatarProvider>
              <div className="h-screen w-full bg-gray-50 dark:bg-gray-950">
                <Story />
              </div>
            </AvatarProvider>
          </ChatSettingsProvider>
        </ThemeProvider>
      </ChatClientProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: {
    initialRoomNames: ['general', 'random', 'announcements'],
    width: '70vw',
    height: '90vh',
  },
  argTypes: {
    mockOverrides: {
      table: { disable: true }, // Hide from controls since it's not a component prop
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EmptyRooms: Story = {
  args: {
    initialRoomNames: [],
  },
};

export const SingleRoom: Story = {
  args: {
    initialRoomNames: ['general'],
  },
};

export const ManyRooms: Story = {
  args: {
    initialRoomNames: [
      'general',
      'random',
      'announcements',
      'team-alpha',
      'project-beta',
      'design-reviews',
      'engineering',
      'marketing',
      'support',
      'watercooler',
      'urgent-issues',
      'feature-requests',
    ],
  },
};

export const LoadingState: Story = {
  args: {
    mockOverrides: {
      connectionStatus: ConnectionStatus.Connecting,
    },
  },
};

export const DisconnectedState: Story = {
  args: {
    mockOverrides: {
      connectionStatus: ConnectionStatus.Disconnected,
    },
  },
};

export const FailedConnectionState: Story = {
  args: {
    mockOverrides: {
      connectionStatus: ConnectionStatus.Failed,
    },
  },
};

export const ReadOnlyMode: Story = {
  args: {
    initialRoomNames: ['general', 'announcements'],
    mockOverrides: {
      chatSettings: {
        allowMessageEdits: false,
        allowMessageDeletes: false,
        allowMessageReactions: false,
      },
    },
  },
};

export const BusyChat: Story = {
  args: {
    initialRoomNames: ['general', 'random'],
    mockOverrides: {
      presenceData: Array.from({ length: 15 }, (_, i) => ({
        clientId: `User${i + 1}`,
        data: { name: `User ${i + 1}` },
      })),
      currentlyTyping: ['User1', 'User3', 'User7'],
      messages: Array.from({ length: 50 }, (_, i) => ({
        id: `m-${i + 1}`,
        serial: `msg_${i + 1}`,
        clientId: `User${(i % 15) + 1}`,
        text: `Message ${i + 1}: ${i % 3 === 0 ? 'This is a longer message with more content to demonstrate text wrapping and layout.' : i % 4 === 0 ? 'Short msg' : 'Regular message content here.'}`,
        createdAt: new Date(Date.now() - 1000 * 60 * (50 - i)),
        updatedAt: new Date(Date.now() - 1000 * 60 * (50 - i)),
        isUpdated: i % 10 === 0,
        isDeleted: false,
        reactions:
          i % 6 === 0
            ? {
                distinct: {
                  '👍': { total: 3, clientIds: ['User1', 'User2', 'User3'] },
                  '❤️': { total: 2, clientIds: ['User4', 'User5'] },
                  '😊': { total: 1, clientIds: ['User6'] },
                },
              }
            : { distinct: {} },
      })),
      occupancy: {
        connections: 15,
        presenceMembers: 15,
      },
    },
  },
};

export const QuietChat: Story = {
  args: {
    initialRoomNames: ['general'],
    mockOverrides: {
      presenceData: [
        { clientId: 'storybook-user', data: { name: 'You' } },
        { clientId: 'Alice', data: { name: 'Alice' } },
      ],
      currentlyTyping: [],
      messages: [
        {
          id: 'm-1',
          serial: 'msg_1',
          clientId: 'Alice',
          text: 'Hey there! 👋',
          createdAt: new Date(Date.now() - 1000 * 60 * 30),
          updatedAt: new Date(Date.now() - 1000 * 60 * 30),
          isUpdated: false,
          isDeleted: false,
          reactions: { distinct: {} },
        },
        {
          id: 'm-2',
          serial: 'msg_2',
          clientId: 'storybook-user',
          text: 'Hello! How are you doing?',
          createdAt: new Date(Date.now() - 1000 * 60 * 25),
          updatedAt: new Date(Date.now() - 1000 * 60 * 25),
          isUpdated: false,
          isDeleted: false,
          reactions: { distinct: {} },
        },
      ],
      occupancy: {
        connections: 2,
        presenceMembers: 2,
      },
    },
  },
};
