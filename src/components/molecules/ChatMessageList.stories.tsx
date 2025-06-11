import { Meta, StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import React from 'react';

import { ChatMessageList } from './ChatMessageList';
import { AvatarProvider } from '../../context';
import { Message } from '@ably/chat';

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
        <div className="h-full max-w-xl mx-auto border rounded-md overflow-hidden">
          <Story />
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
    // History-related callbacks are left undefined in the default story.
    hasMoreHistory: false,
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
