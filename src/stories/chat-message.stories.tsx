import { Message } from '@ably/chat';
import { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { action } from 'storybook/actions';

import { ChatMessage } from '../components/molecules/chat-message.tsx';
import { AvatarProvider } from '../providers/avatar-provider';

// Sample message data to use in the story
const sampleMessage: Message = {
  id: 'msg-1',
  clientId: 'user2',
  text: 'Hello there! This is a sample chat message.',
  createdAt: new Date(),
  updatedAt: new Date(),
  isUpdated: false,
  isDeleted: false,
  reactions: {
    distinct: {
      '👍': { total: 1, clientIds: ['user1'] },
    },
  },
} as unknown as Message;

const meta: Meta<typeof ChatMessage> = {
  title: 'Molecules/ChatMessage',
  component: ChatMessage,
  decorators: [
    (Story) => (
      <AvatarProvider>
        <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="h-[400px] max-w-2xl w-full border rounded-md flex flex-col bg-white dark:bg-gray-900">
            <div className="flex-1 overflow-y-auto pt-10 px-6 pb-6 space-y-6 bg-gray-50 dark:bg-gray-950">
              <Story />
            </div>
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
    message: sampleMessage,
    currentClientId: 'user1',
    onEdit: action('edit'),
    onDelete: action('delete'),
    onReactionAdd: action('reaction-add'),
    onReactionRemove: action('reaction-remove'),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
