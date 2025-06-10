import { TooltipSurface } from './TooltipSurface';
import { TooltipArrow } from './TooltipArrow';
import { Button } from './Button';
import { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

/**
 * The TooltipSurface component renders positioned tooltips with customizable styling and positioning.
 */
const meta: Meta<typeof TooltipSurface> = {
  title: 'Atoms/TooltipSurface',
  component: TooltipSurface,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The TooltipSurface component provides a styled container for tooltip content with automatic positioning and theme variants.

## Features
- Automatic positioning above or below trigger elements
- Dark and light theme variants
- Responsive sizing with max-width constraints
- Smooth transitions and shadows
- ARIA support for accessibility
- Customizable z-index for layering

## Usage
TooltipSurfaces are typically used to provide additional context, help text, or supplementary information about UI elements. They should be concise and helpful without being intrusive.

## Positioning
The component supports 'above' and 'below' positioning relative to trigger elements, with automatic centering and appropriate margins.
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
    maxWidth: {
      control: 'select',
      options: ['max-w-xs', 'max-w-sm', 'max-w-md', 'max-w-lg', 'max-w-xl'],
      description: 'Maximum width constraint',
    },
    zIndex: {
      control: 'select',
      options: ['z-10', 'z-20', 'z-30', 'z-40', 'z-50'],
      description: 'Z-index for layering',
    },
    children: {
      control: 'text',
      description: 'Tooltip content',
    },
  },
  args: {
    position: 'above',
    children: 'This is a tooltip',
  },
  decorators: [
    (Story) => {
      const [show, setShow] = React.useState(false);
      return (
        <div className="relative inline-block p-16">
          <div
            className="bg-blue-500 text-white px-4 py-2 rounded cursor-default"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
          >
            Hover Target
          </div>
          {show && <Story />}
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

// Content Variations
export const ShortText: Story = {
  args: {
    position: 'above',
    children: 'Save',
  },
};

export const LongText: Story = {
  args: {
    position: 'above',
    children: 'This is a longer tooltip message that provides more detailed information',
    maxWidth: 'max-w-sm',
  },
};

export const MultilineContent: Story = {
  args: {
    position: 'above',
    children: (
      <div>
        <div className="font-semibold">Pro Tip</div>
        <div className="text-sm">Use keyboard shortcuts to work faster</div>
      </div>
    ),
    maxWidth: 'max-w-xs',
  },
};

// Size Variations
export const ExtraSmall: Story = {
  args: {
    position: 'above',
    maxWidth: 'max-w-xs',
    children: 'Extra small tooltip with limited width',
  },
};

export const Small: Story = {
  args: {
    position: 'above',
    maxWidth: 'max-w-sm',
    children: 'Small tooltip with a bit more room for content',
  },
};

export const Medium: Story = {
  args: {
    position: 'above',
    maxWidth: 'max-w-md',
    children: 'Medium sized tooltip that can accommodate more detailed explanations and help text',
  },
};

export const Large: Story = {
  args: {
    position: 'above',
    maxWidth: 'max-w-lg',
    children:
      'Large tooltip with plenty of space for comprehensive information, detailed instructions, or multiple pieces of related content',
  },
};

// Z-Index Examples
export const HighZIndex: Story = {
  args: {
    position: 'above',
    zIndex: 'z-50',
    children: 'High priority tooltip (z-50)',
  },
};

export const LowZIndex: Story = {
  args: {
    position: 'above',
    zIndex: 'z-10',
    children: 'Lower priority tooltip (z-10)',
  },
};

// Complete Tooltip with Arrow
export const WithArrow: Story = {
  render: (args) => (
    <>
      <TooltipSurface {...args} />
      <TooltipArrow position={args.position} variant={args.variant} />
    </>
  ),
  args: {
    position: 'above',
    children: 'Tooltip with arrow pointer',
  },
};

export const LightWithArrow: Story = {
  render: (args) => (
    <>
      <TooltipSurface {...args} />
      <TooltipArrow position={args.position} variant={args.variant} />
    </>
  ),
  args: {
    position: 'below',
    variant: 'light',
    children: 'Light tooltip with arrow',
  },
};

// Usage Examples
export const HelpTooltip: Story = {
  render: () => (
    <div className="relative inline-block">
      <Button size="sm" variant="outline">
        Help
        <span className="ml-1 text-xs">?</span>
      </Button>
      <TooltipSurface position="above" maxWidth="max-w-sm">
        <div className="space-y-1">
          <div className="font-medium">Need Help?</div>
          <div className="text-xs">
            Click here to access our comprehensive help documentation and tutorials.
          </div>
        </div>
      </TooltipSurface>
      <TooltipArrow position="above" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of a help tooltip with structured content and arrow.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-16">
        <Story />
      </div>
    ),
  ],
};

export const StatusTooltip: Story = {
  render: () => (
    <div className="relative inline-block">
      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
      <TooltipSurface position="below" variant="light">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm">Online - Last seen 2 minutes ago</span>
        </div>
      </TooltipSurface>
      <TooltipArrow position="below" variant="light" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Status indicator with informative tooltip.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-16">
        <Story />
      </div>
    ),
  ],
};

// Theme Showcase
export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-8">
      <div className="relative inline-block">
        <div className="bg-gray-200 px-3 py-2 rounded text-sm">Dark Tooltip</div>
        <TooltipSurface position="above" variant="dark">
          Dark themed tooltip
        </TooltipSurface>
        <TooltipArrow position="above" variant="dark" />
      </div>
      <div className="relative inline-block">
        <div className="bg-gray-200 px-3 py-2 rounded text-sm">Light Tooltip</div>
        <TooltipSurface position="above" variant="light">
          Light themed tooltip
        </TooltipSurface>
        <TooltipArrow position="above" variant="light" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of dark and light tooltip variants.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-16">
        <Story />
      </div>
    ),
  ],
};

// Position Showcase
export const AllPositions: Story = {
  render: () => (
    <div className="flex flex-col gap-12">
      <div className="relative inline-block">
        <div className="bg-blue-500 text-white px-4 py-2 rounded">Above Position</div>
        <TooltipSurface position="above">Tooltip positioned above</TooltipSurface>
        <TooltipArrow position="above" />
      </div>
      <div className="relative inline-block">
        <div className="bg-blue-500 text-white px-4 py-2 rounded">Below Position</div>
        <TooltipSurface position="below">Tooltip positioned below</TooltipSurface>
        <TooltipArrow position="below" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of all available positioning options.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-16 flex justify-center">
        <Story />
      </div>
    ),
  ],
};
