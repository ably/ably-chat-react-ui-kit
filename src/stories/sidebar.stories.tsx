import { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { action } from 'storybook/actions';

import { AvatarProvider, ThemeProvider } from '../context';
import { Sidebar } from '../components/molecules/sidebar.tsx';

const meta: Meta<typeof Sidebar> = {
  title: 'Molecules/Sidebar',
  component: Sidebar,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <AvatarProvider>
          <div className="h-screen w-full flex bg-gray-50 dark:bg-gray-950">
            <div className="w-64 md:w-72 lg:w-80 bg-white dark:bg-gray-900">
              <Story />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">Main content area</p>
            </div>
          </div>
        </AvatarProvider>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: {
    roomNames: ['general', 'random', 'announcements', 'team-alpha', 'project-beta'],
    activeRoomName: 'general',
    addRoom: action('add-room'),
    setActiveRoom: action('set-active-room'),
    leaveRoom: action('leave-room'),
    onToggleCollapse: action('toggle-collapse'),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EmptyRooms: Story = {
  args: {
    roomNames: [],
    activeRoomName: undefined,
  },
};

export const ManyRooms: Story = {
  args: {
    roomNames: [
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
      'feature-requests'
    ],
    activeRoomName: 'engineering',
  },
};

export const Collapsed: Story = {
  args: {
    isCollapsed: true,
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <AvatarProvider>
          <div className="h-screen w-full flex bg-gray-50 dark:bg-gray-950">
            <div className="w-16 border-r bg-white dark:bg-gray-900">
              <Story />
            </div>
          </div>
        </AvatarProvider>
      </ThemeProvider>
    ),
  ],
};