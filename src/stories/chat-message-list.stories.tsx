import { Message } from '@ably/chat';
import { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { action } from 'storybook/actions';

import { AvatarProvider } from '../context';
import { ChatMessageList } from '../components/molecules/chat-message-list.tsx';

const messages = [
  {
    id: 'm-1',
    clientId: 'user1',
    text: 'Hey, how are you doing today?',
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5),
    isUpdated: false,
    isDeleted: false,
    reactions: { distinct: {} },
  },
  {
    id: 'm-2',
    clientId: 'user2',
    text: "I'm good, thanks! Working on the new chat UI.",
    createdAt: new Date(Date.now() - 1000 * 60 * 4),
    updatedAt: new Date(Date.now() - 1000 * 60 * 4),
    isUpdated: false,
    isDeleted: false,
    reactions: {
      distinct: {
        '😊': { total: 2, clientIds: ['user1', 'user2'] },
      },
    },
  },
  {
    id: 'm-3',
    clientId: 'user3',
    text: 'Nice! Looking forward to seeing it.',
    createdAt: new Date(Date.now() - 1000 * 60 * 3),
    updatedAt: new Date(Date.now() - 1000 * 60 * 3),
    isUpdated: false,
    isDeleted: false,
    reactions: { distinct: {} },
  },
] as unknown as Message[];

const meta: Meta<typeof ChatMessageList> = {
  title: 'Molecules/ChatMessageList',
  component: ChatMessageList,
  decorators: [
    (Story) => (
      <AvatarProvider>
        <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="h-[600px] max-w-xl w-full border rounded-md overflow-hidden bg-white dark:bg-gray-900 flex flex-col">
            <Story />
          </div>
        </div>
      </AvatarProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: {
    messages,
    currentClientId: 'user1',
    onEdit: action('edit'),
    onDelete: action('delete'),
    onReactionAdd: action('reaction-add'),
    onReactionRemove: action('reaction-remove'),
    hasMoreHistory: false,
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
