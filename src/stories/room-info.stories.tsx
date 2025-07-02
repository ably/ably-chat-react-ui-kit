import { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import { AvatarProvider } from '../context';
import { RoomInfo } from '../components/molecules/room-info.tsx';
import { ChatRoomProvider, createMockScenario } from '../../.storybook/mocks/mock-ably-chat';

// Extend the component props for Storybook to include mockOverrides
type StoryProps = React.ComponentProps<typeof RoomInfo> & {
  mockOverrides?: any;
};

const meta: Meta<StoryProps> = {
  title: 'Molecules/RoomInfo',
  component: RoomInfo,
  decorators: [
    (Story, context) => (
      <ChatRoomProvider name="storybook-room" mockOverrides={context.args.mockOverrides}>
        <AvatarProvider>
          <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-8">
            <div className="bg-white dark:bg-gray-900 border rounded-lg p-6 shadow-lg max-w-md">
              <Story />
            </div>
          </div>
        </AvatarProvider>
      </ChatRoomProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: {
    position: { top: 100, left: 200 },
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

export const WithImageAvatar: Story = {
  args: {
    roomAvatar: {
      displayName: 'Marketing Team',
      initials: 'MT',
      src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop&crop=faces',
    },
  },
};

export const NoParticipants: Story = {
  args: {
    mockOverrides: createMockScenario.noParticipants(),
  },
};

export const ManyParticipants: Story = {
  args: {
    mockOverrides: createMockScenario.manyParticipants(15),
  },
};
