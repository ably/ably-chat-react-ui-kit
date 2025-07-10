import { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { action } from 'storybook/actions';

import { Icon } from '../components/atoms';
import { ConfirmDialog } from '../components/molecules/confirm-dialog.tsx';

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Molecules/ConfirmDialog',
  component: ConfirmDialog,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    confirmVariant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger'],
    },
  },
  args: {
    isOpen: true,
    title: 'Delete Message',
    message: 'Are you sure you want to delete this message? This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    confirmVariant: 'danger',
    onClose: action('close'),
    onConfirm: action('confirm'),
    icon: <Icon name="delete" />,
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
