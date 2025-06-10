import { TooltipArrow } from './TooltipArrow';
import { TooltipSurface } from './TooltipSurface';
import { Meta, StoryObj } from '@storybook/react-vite';

/**
 * The TooltipArrow component renders triangular arrows that visually connect tooltips to their trigger elements.
 */
const meta: Meta<typeof TooltipArrow> = {
  title: 'Atoms/TooltipArrow',
  component: TooltipArrow,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The TooltipArrow component creates visual connection between tooltips and their trigger elements using CSS border-based triangular arrows.

## Features
- CSS border-based triangle rendering
- Automatic positioning for above/below tooltips
- Color variants to match tooltip surfaces
- Multiple arrow sizes (sm, md, lg)
- ARIA hidden by default for accessibility
- Designed to complement TooltipSurface component

## Usage
TooltipArrows are typically used in conjunction with TooltipSurface components to create complete tooltip experiences. The arrow provides visual continuity between the tooltip content and its trigger element.

## Positioning
The component supports 'above' and 'below' positioning, with arrows automatically pointing in the correct direction to connect to the tooltip surface.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    position: {
      control: 'select',
      options: ['above', 'below'],
      description: 'Arrow direction - above points down, below points up',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the arrow',
    },
    variant: {
      control: 'select',
      options: ['dark', 'light'],
      description: 'Color variant to match tooltip surface',
    },
  },
  args: {
    position: 'above',
    size: 'md',
    variant: 'dark',
  },
  decorators: [
    (Story) => (
      <div className="relative inline-block p-16">
        <div className="bg-blue-500 text-white px-4 py-2 rounded">Arrow Demo</div>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    position: 'above',
    size: 'md',
    variant: 'dark',
  },
};

export const Below: Story = {
  args: {
    position: 'below',
    size: 'md',
    variant: 'dark',
  },
};

export const LightVariant: Story = {
  args: {
    position: 'above',
    size: 'md',
    variant: 'light',
  },
};

// Size Variations
export const Small: Story = {
  args: {
    position: 'above',
    size: 'sm',
    variant: 'dark',
  },
};

export const Medium: Story = {
  args: {
    position: 'above',
    size: 'md',
    variant: 'dark',
  },
};

export const Large: Story = {
  args: {
    position: 'above',
    size: 'lg',
    variant: 'dark',
  },
};

// Variant Combinations
export const DarkAbove: Story = {
  args: {
    position: 'above',
    variant: 'dark',
    size: 'md',
  },
};

export const DarkBelow: Story = {
  args: {
    position: 'below',
    variant: 'dark',
    size: 'md',
  },
};

export const LightAbove: Story = {
  args: {
    position: 'above',
    variant: 'light',
    size: 'md',
  },
};

export const LightBelow: Story = {
  args: {
    position: 'below',
    variant: 'light',
    size: 'md',
  },
};

// Complete Tooltip Examples
export const WithDarkTooltip: Story = {
  render: (args) => (
    <>
      <TooltipSurface position={args.position} variant={args.variant}>
        Tooltip with matching arrow
      </TooltipSurface>
      <TooltipArrow {...args} />
    </>
  ),
  args: {
    position: 'above',
    variant: 'dark',
    size: 'md',
  },
};

export const WithLightTooltip: Story = {
  render: (args) => (
    <>
      <TooltipSurface position={args.position} variant={args.variant}>
        Light tooltip with arrow
      </TooltipSurface>
      <TooltipArrow {...args} />
    </>
  ),
  args: {
    position: 'below',
    variant: 'light',
    size: 'md',
  },
};

// Size Showcase
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-end gap-8">
      <div className="relative inline-block">
        <div className="bg-gray-200 px-2 py-1 rounded text-xs">Small</div>
        <TooltipArrow position="above" size="sm" variant="dark" />
      </div>
      <div className="relative inline-block">
        <div className="bg-gray-200 px-3 py-2 rounded text-sm">Medium</div>
        <TooltipArrow position="above" size="md" variant="dark" />
      </div>
      <div className="relative inline-block">
        <div className="bg-gray-200 px-4 py-3 rounded">Large</div>
        <TooltipArrow position="above" size="lg" variant="dark" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of all available arrow sizes.',
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

// Variant Showcase
export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-12">
      <div className="flex flex-col gap-8">
        <h3 className="text-sm font-semibold">Dark Arrows</h3>
        <div className="relative inline-block">
          <div className="bg-gray-200 px-3 py-2 rounded text-sm">Above</div>
          <TooltipArrow position="above" variant="dark" size="md" />
        </div>
        <div className="relative inline-block">
          <div className="bg-gray-200 px-3 py-2 rounded text-sm">Below</div>
          <TooltipArrow position="below" variant="dark" size="md" />
        </div>
      </div>
      <div className="flex flex-col gap-8">
        <h3 className="text-sm font-semibold">Light Arrows</h3>
        <div className="relative inline-block">
          <div className="bg-gray-800 text-white px-3 py-2 rounded text-sm">Above</div>
          <TooltipArrow position="above" variant="light" size="md" />
        </div>
        <div className="relative inline-block">
          <div className="bg-gray-800 text-white px-3 py-2 rounded text-sm">Below</div>
          <TooltipArrow position="below" variant="light" size="md" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of dark and light arrow variants in different positions.',
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
        <div className="bg-blue-500 text-white px-4 py-2 rounded">Above Arrow (points down)</div>
        <TooltipArrow position="above" variant="dark" size="md" />
      </div>
      <div className="relative inline-block">
        <div className="bg-blue-500 text-white px-4 py-2 rounded">Below Arrow (points up)</div>
        <TooltipArrow position="below" variant="dark" size="md" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of arrow pointing directions for different positions.',
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

// Real-world Usage Examples
export const ActionTooltip: Story = {
  render: () => (
    <div className="relative inline-block">
      <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded transition-colors">
        Delete
      </button>
      <TooltipSurface position="above" variant="dark" maxWidth="max-w-xs">
        <div className="text-center">
          <div className="font-medium">Permanent Action</div>
          <div className="text-xs mt-1">This action cannot be undone</div>
        </div>
      </TooltipSurface>
      <TooltipArrow position="above" variant="dark" size="sm" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Warning tooltip with arrow for destructive actions.',
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

export const InfoTooltip: Story = {
  render: () => (
    <div className="relative inline-block">
      <div className="flex items-center gap-2">
        <span>Settings</span>
        <div className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
          i
        </div>
      </div>
      <TooltipSurface position="below" variant="light" maxWidth="max-w-sm">
        <div>
          <div className="font-medium text-blue-900">Configuration Options</div>
          <div className="text-sm text-gray-600 mt-1">
            Customize your experience with these advanced settings. Changes are saved automatically.
          </div>
        </div>
      </TooltipSurface>
      <TooltipArrow position="below" variant="light" size="md" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Informational tooltip with light theme and arrow.',
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

// Custom Styling Example
export const CustomStyled: Story = {
  args: {
    position: 'above',
    variant: 'dark',
    size: 'lg',
    className: 'ml-4',
  },
  parameters: {
    docs: {
      description: {
        story: 'Arrow with custom positioning using className prop.',
      },
    },
  },
};
