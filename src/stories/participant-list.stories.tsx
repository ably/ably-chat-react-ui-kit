import { PresenceMember } from '@ably/chat';
import { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { action } from 'storybook/actions';

import { AvatarProvider } from '../context';
import { ParticipantList } from '../components/molecules/participant-list.tsx';

// Mock presence data
const mockPresenceData: PresenceMember[] = [
  { clientId: 'alice', data: { name: 'Alice' } },
  { clientId: 'bob', data: { name: 'Bob' } },
  { clientId: 'charlie', data: { name: 'Charlie' } },
  { clientId: 'diana', data: { name: 'Diana' } },
  { clientId: 'edward', data: { name: 'Edward' } },
] as unknown as PresenceMember[];

const manyParticipants: PresenceMember[] = [
  { clientId: 'alice', data: { name: 'Alice' } },
  { clientId: 'bob', data: { name: 'Bob' } },
  { clientId: 'charlie', data: { name: 'Charlie' } },
  { clientId: 'diana', data: { name: 'Diana' } },
  { clientId: 'edward', data: { name: 'Edward' } },
  { clientId: 'frank', data: { name: 'Frank' } },
  { clientId: 'grace', data: { name: 'Grace' } },
  { clientId: 'henry', data: { name: 'Henry' } },
  { clientId: 'iris', data: { name: 'Iris' } },
  { clientId: 'jack', data: { name: 'Jack' } },
  { clientId: 'kate', data: { name: 'Kate' } },
  { clientId: 'liam', data: { name: 'Liam' } },
] as unknown as PresenceMember[];

const meta: Meta<typeof ParticipantList> = {
  title: 'Molecules/ParticipantList',
  component: ParticipantList,
  decorators: [
    (Story) => (
      <AvatarProvider>
        <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-8">
          <div className="relative">
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
    presenceData: mockPresenceData,
    currentClientId: 'alice',
    currentlyTyping: new Set(['bob', 'charlie']),
    onToggle: action('toggle'),
    position: { top: -100, left: 0 },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTriggerButton: Story = {
  args: {
    presenceData: [{ clientId: 'alice', data: { name: 'Alice' } }] as unknown as PresenceMember[],
    currentClientId: 'alice',
    currentlyTyping: new Set(['bob']),
    position: { top: 60, left: 0 },
  },
  decorators: [
    (Story, context) => {
      const [isOpen, setIsOpen] = React.useState(false);

      const handleToggle = () => {
        setIsOpen(!isOpen);
        // Still call the action for logging
        action('toggle')();
      };

      return (
        <AvatarProvider>
          <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-8">
            <div className="relative">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                onClick={handleToggle}
              >
                👥 Click me to toggle participants
              </button>
              {isOpen && (
                <Story args={{ ...context.args, onToggle: handleToggle }} />
              )}
            </div>
          </div>
        </AvatarProvider>
      );
    },
  ],
};


export const NoTyping: Story = {
  args: {
    currentlyTyping: new Set(),
  },
};

export const AllTyping: Story = {
  args: {
    currentlyTyping: new Set(['alice', 'bob', 'charlie', 'diana', 'edward']),
  },
};