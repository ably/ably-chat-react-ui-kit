import { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import { Button } from '../components/atoms/button.tsx';
import { Icon } from '../components/atoms/icon.tsx';
import { Tooltip } from '../components/atoms/tooltip.tsx';

/**
 * The Tooltip component wraps trigger elements to show informative content on hover or focus.
 * This is a simplified, opinionated tooltip designed for internal UI kit use with sensible defaults.
 */
const meta: Meta<typeof Tooltip> = {
  title: 'Atoms/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Tooltip Component (Simplified)

A simplified tooltip component for internal UI kit use with opinionated defaults.

## Key Features
- **Simple API**: Only essential props for basic tooltip functionality
- **Smart Positioning**: Auto-positioning with above/below fallback
- **Hover/Focus Triggers**: Only supports hover and focus interactions
- **Fixed Styling**: Medium size, reasonable max-width, 200ms delay
- **Accessibility**: Full ARIA support and keyboard navigation

## Basic Usage
\`\`\`tsx
<Tooltip title="Delete this item">
  <Button>Delete</Button>
</Tooltip>
\`\`\`

## Positioning
\`\`\`tsx
<Tooltip title="This appears below" position="below">
  <Button>Below</Button>
</Tooltip>
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'The content to display in the tooltip',
    },
    position: {
      control: 'select',
      options: ['above', 'below', 'auto'],
      description: 'Position of tooltip relative to trigger element',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the tooltip is disabled',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the tooltip',
    },
  },
  args: {
    title: 'This is a helpful tooltip',
    position: 'auto',
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    title: 'This tooltip appears on hover',
  },
  render: (args) => (
    <Tooltip {...args}>
      <Button>Hover me</Button>
    </Tooltip>
  ),
};

export const WithIcon: Story = {
  args: {
    title: 'More information about this feature',
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <span>Feature Name</span>
      <Tooltip {...args}>
        <Icon name="info" size="sm" className="text-gray-500 cursor-help" />
      </Tooltip>
    </div>
  ),
};

export const LongContent: Story = {
  args: {
    title:
      'This is a longer tooltip message that demonstrates text wrapping and maximum width constraints. It provides more detailed information about the feature or action.',
  },
  render: (args) => (
    <Tooltip {...args}>
      <Button>Hover for details</Button>
    </Tooltip>
  ),
};

// Position Examples
export const Positions: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-8 p-8">
      <Tooltip title="Tooltip above" position="above">
        <Button>Above</Button>
      </Tooltip>

      <Tooltip title="Tooltip below" position="below">
        <Button>Below</Button>
      </Tooltip>

      <Tooltip title="Auto-positioned tooltip" position="auto">
        <Button>Auto</Button>
      </Tooltip>
    </div>
  ),
};

export const AutoPosition: Story = {
  args: {
    title: 'This tooltip will automatically position itself based on available space',
    position: 'auto',
  },
  render: (args) => (
    <div className="flex justify-center items-center h-32">
      <Tooltip {...args}>
        <Button>Auto Position</Button>
      </Tooltip>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    title: 'This tooltip is disabled',
    disabled: true,
  },
  render: (args) => (
    <Tooltip {...args}>
      <Button>Disabled Tooltip</Button>
    </Tooltip>
  ),
};

// Complex Content
export const ComplexContent: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tooltip
        title={
          <div>
            <div className="font-semibold">Complex Tooltip</div>
            <div className="text-sm opacity-90">With multiple elements</div>
          </div>
        }
      >
        <Button>Rich Content</Button>
      </Tooltip>

      <Tooltip
        title={
          <div className="space-y-1">
            <div>• Feature A</div>
            <div>• Feature B</div>
            <div>• Feature C</div>
          </div>
        }
      >
        <Button>List Content</Button>
      </Tooltip>
    </div>
  ),
};

// Real-world Examples
export const RealWorldExamples: Story = {
  render: () => (
    <div className="space-y-6">
      {/* User Avatar with Info */}
      <div className="flex items-center gap-3">
        <Tooltip title="John Doe (john.doe@example.com)">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer">
            JD
          </div>
        </Tooltip>
        <span>John Doe</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Tooltip title="Save your changes">
          <Button variant="primary">
            <Icon name="upload" size="sm" />
          </Button>
        </Tooltip>

        <Tooltip title="Discard all changes">
          <Button variant="secondary">
            <Icon name="close" size="sm" />
          </Button>
        </Tooltip>

        <Tooltip title="Delete permanently">
          <Button variant="danger">
            <Icon name="delete" size="sm" />
          </Button>
        </Tooltip>
      </div>

      {/* Form Field Help */}
      <div className="max-w-sm space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Password</label>
          <Tooltip title="Must be at least 8 characters with uppercase, lowercase, and numbers">
            <Icon name="info" size="sm" className="text-gray-400 cursor-help" />
          </Tooltip>
        </div>
        <input
          type="password"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Enter password"
        />
      </div>
    </div>
  ),
};

// Custom Styling
export const CustomStyling: Story = {
  args: {
    title: 'Custom styled tooltip',
    className: 'custom-tooltip-class',
  },
  render: (args) => (
    <Tooltip {...args}>
      <Button>Custom Styled</Button>
    </Tooltip>
  ),
};

// Edge Cases
export const EdgeCases: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <Tooltip title="">
          <Button>Empty Title</Button>
        </Tooltip>
      </div>

      <div>
        <Tooltip title={null as any}>
          <Button>Null Title</Button>
        </Tooltip>
      </div>

      <div className="flex gap-2">
        <span>Multiple children (tooltip shows fallback behavior):</span>
        <div>
          <Button>Child 1</Button>
          <Button>Child 2</Button>
          <span className="text-sm text-gray-500 ml-2">(No tooltip shown - single child required)</span>
        </div>
      </div>
    </div>
  ),
};
