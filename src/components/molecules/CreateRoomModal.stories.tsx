import { Meta, StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';

import { CreateRoomModal } from './CreateRoomModal';
import React from 'react';

const meta: Meta<typeof CreateRoomModal> = {
  title: 'Molecules/CreateRoomModal',
  component: CreateRoomModal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: {
    isOpen: true,
    onClose: action('close'),
    onCreateRoom: action('create-room'),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <div style={{ minHeight: '50vh' }}>
        <Story />
      </div>
    ),
  ],
};
