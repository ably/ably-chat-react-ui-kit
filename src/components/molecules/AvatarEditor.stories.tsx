import { Meta, StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';

import { AvatarEditor } from './AvatarEditor';

/**
 * Storybook metadata for the AvatarEditor component
 */
const meta: Meta<typeof AvatarEditor> = {
  title: 'Molecules/AvatarEditor',
  component: AvatarEditor,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Whether the editor modal is open',
    },
    displayName: {
      control: 'text',
      description: 'Display name used to generate initials',
    },
    currentAvatar: {
      control: 'text',
      description: 'Current avatar URL (optional)',
    },
    currentColor: {
      control: 'text',
      description: 'Tailwind background color class for avatar',
    },
  },
  args: {
    isOpen: true,
    displayName: 'John Doe',
    onClose: action('close'),
    onSave: action('save'),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Default open state of the AvatarEditor
 */
export const Default: Story = {
  decorators: [
    (Story) => (
      <div style={{ minHeight: '100vh' }}>
        <Story />
      </div>
    ),
  ],
};
