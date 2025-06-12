import { Message } from '@ably/chat';
import { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { action } from 'storybook/actions';

import { AvatarProvider } from '../context';
import { ChatMessage } from '../components/molecules/chat-message.tsx';

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
        <div
          style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem',
            backgroundColor: '#f9fafb',
          }}
        >
          <div
            className="flex-1 overflow-y-auto pt-10 px-6 pb-6 space-y-6 bg-gray-50 dark:bg-gray-950"
            style={{
              width: '100%',
              maxWidth: '600px',
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '2rem',
              minHeight: '200px',
            }}
          >
            <Story />
          </div>
        </div>
      </AvatarProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
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
