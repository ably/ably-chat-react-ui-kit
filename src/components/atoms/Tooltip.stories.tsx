import { Tooltip } from './Tooltip';
import { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

/**
 * The Tooltip component renders complete tooltips with surface and optional arrow.
 */
const meta: Meta<typeof Tooltip> = {
  title: 'Atoms/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Tooltip component to display pop up messages, such as user names or information.

## Features
- Automatic positioning above or below trigger elements
- Dark and light theme variants with matching arrows
- Multiple sizes with coordinated surface and arrow sizing
- Optional arrow with perfect color matching
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    position: {
      control: 'select',
      options: ['above', 'below'],
      description: 'Position of tooltip relative to trigger element',
    },
    variant: {
      control: 'select',
      options: ['dark', 'light'],
      description: 'Color theme variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of tooltip and arrow',
    },
    showArrow: {
      control: 'boolean',
      description: 'Whether to show the pointing arrow',
    },
    maxWidth: {
      control: 'select',
      options: ['max-w-xs', 'max-w-sm', 'max-w-md', 'max-w-lg'],
      description: 'Maximum width constraint',
    },
    wrap: {
      control: 'select',
      options: ['wrap', 'nowrap', 'truncate'],
      description: 'Text wrapping behavior',
    },
  },
  args: {
    position: 'above',
    children: 'This is a tooltip',
    showArrow: true,
  },
  decorators: [
    (Story, { args }) => {
      const [show, setShow] = React.useState(false);
      return (
        <div className="p-16">
          {' '}
          {/* Outer padding for Storybook spacing */}
          <div className="relative inline-block">
            {' '}
            {/* Positioning context for tooltip */}
            <div
              className="bg-blue-500 text-white px-4 py-2 rounded cursor-default"
              onMouseEnter={() => setShow(true)}
              onMouseLeave={() => setShow(false)}
            >
              Hover Target
            </div>
            {show && <Story args={args} />}
          </div>
        </div>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    position: 'above',
    children: 'This is a tooltip',
  },
};

export const WithNoWrap: Story = {
  args: {
    position: 'above',
    wrap: 'nowrap',
    children: 'This tooltip has no wrapping and will truncate',
  },
};

export const Below: Story = {
  args: {
    position: 'below',
    children: 'Tooltip positioned below',
  },
};

export const LightVariant: Story = {
  args: {
    position: 'above',
    variant: 'light',
    children: 'Light themed tooltip',
  },
};

// Size Variations
export const Small: Story = {
  args: {
    position: 'above',
    size: 'sm',
    children: 'Small tooltip',
  },
};

export const Large: Story = {
  args: {
    position: 'above',
    size: 'lg',
    children: 'Large tooltip with more space',
  },
};

// Without Arrow
export const NoArrow: Story = {
  args: {
    position: 'above',
    showArrow: false,
    children: 'Tooltip without arrow',
  },
};

// All Variants Showcase
export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-8">
      <div className="relative inline-block">
        <div className="bg-gray-200 px-3 py-2 rounded text-sm">Dark</div>
        <Tooltip position="above" variant="dark">
          Dark tooltip
        </Tooltip>
      </div>
      <div className="relative inline-block">
        <div className="bg-gray-800 px-3 py-2 rounded text-sm text-white">Light</div>
        <Tooltip position="above" variant="light">
          Light tooltip
        </Tooltip>
      </div>
    </div>
  ),
  decorators: [
    (Story) => (
      <div className="p-16">
        <Story />
      </div>
    ),
  ],
};
