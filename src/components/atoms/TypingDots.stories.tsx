import { TypingDots } from './TypingDots';
import { Meta, StoryObj } from '@storybook/react-vite';

/**
 * The TypingDots component displays an animated three-dot indicator commonly used to show typing activity.
 */
const meta: Meta<typeof TypingDots> = {
  title: 'Atoms/TypingDots',
  component: TypingDots,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The TypingDots component provides an animated typing indicator with three bouncing dots.

## Features
- Three dots with staggered bounce animation
- Customizable size, color, and animation timing
- Respects reduced motion preferences
- Basic ARIA support (role, aria-label, aria-live)
- Inherits text color by default using CSS currentColor

## Usage
Use TypingDots to indicate when someone is typing in a chat interface, loading states, or any context where you need to show ongoing activity.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    dotSizeClassName: {
      control: 'text',
      description: 'Tailwind size utility classes for each dot',
      defaultValue: 'w-1.5 h-1.5',
    },
    className: {
      control: 'text',
      description: 'Custom classes for the container div that wraps all dots',
    },
    dotClassName: {
      control: 'text',
      description: 'Custom classes applied to each individual dot',
    },
    animationDuration: {
      control: 'text',
      description: 'Animation duration for the bounce effect',
      defaultValue: '1s',
    },
    dotColor: {
      control: 'text',
      description: 'Color of the dots - uses CSS currentColor by default',
      defaultValue: 'bg-current',
    },
    'aria-label': {
      control: 'text',
      description: 'Accessible label for screen readers',
      defaultValue: 'Typing indicator',
    },
  },
  args: {
    'aria-label': 'Typing indicator',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {},
};

export const WithCustomLabel: Story = {
  args: {
    'aria-label': 'User is typing a message',
  },
};

// Size Variations
export const Small: Story = {
  args: {
    dotSizeClassName: 'w-1 h-1',
  },
  parameters: {
    docs: {
      description: {
        story: 'Small typing dots using w-1 h-1 classes.',
      },
    },
  },
};

export const Medium: Story = {
  args: {
    dotSizeClassName: 'w-1.5 h-1.5',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default medium-sized typing dots.',
      },
    },
  },
};

export const Large: Story = {
  args: {
    dotSizeClassName: 'w-2 h-2',
  },
  parameters: {
    docs: {
      description: {
        story: 'Large typing dots using w-2 h-2 classes.',
      },
    },
  },
};

export const ExtraLarge: Story = {
  args: {
    dotSizeClassName: 'w-3 h-3',
  },
  parameters: {
    docs: {
      description: {
        story: 'Extra large typing dots using w-3 h-3 classes.',
      },
    },
  },
};

// Color Variations
export const Blue: Story = {
  args: {
    dotColor: 'bg-blue-500',
  },
  parameters: {
    docs: {
      description: {
        story: 'Blue colored typing dots.',
      },
    },
  },
};

export const Green: Story = {
  args: {
    dotColor: 'bg-green-500',
  },
  parameters: {
    docs: {
      description: {
        story: 'Green colored typing dots.',
      },
    },
  },
};

export const Red: Story = {
  args: {
    dotColor: 'bg-red-500',
  },
  parameters: {
    docs: {
      description: {
        story: 'Red colored typing dots.',
      },
    },
  },
};

export const Purple: Story = {
  args: {
    dotColor: 'bg-purple-500',
  },
  parameters: {
    docs: {
      description: {
        story: 'Purple colored typing dots.',
      },
    },
  },
};

export const Gray: Story = {
  args: {
    dotColor: 'bg-gray-500',
  },
  parameters: {
    docs: {
      description: {
        story: 'Gray colored typing dots.',
      },
    },
  },
};

// Animation Speed Variations
export const SlowAnimation: Story = {
  args: {
    animationDuration: '2s',
  },
  parameters: {
    docs: {
      description: {
        story: 'Slow animation with 2 second duration.',
      },
    },
  },
};

export const FastAnimation: Story = {
  args: {
    animationDuration: '0.5s',
  },
  parameters: {
    docs: {
      description: {
        story: 'Fast animation with 0.5 second duration.',
      },
    },
  },
};

// Spacing Variations
export const TightSpacing: Story = {
  args: {
    className: 'flex gap-0',
  },
  parameters: {
    docs: {
      description: {
        story: 'Tight spacing between dots with no gap.',
      },
    },
  },
};

export const WideSpacing: Story = {
  args: {
    className: 'flex gap-2',
  },
  parameters: {
    docs: {
      description: {
        story: 'Wide spacing between dots.',
      },
    },
  },
};

// Custom Styling
export const CustomStyling: Story = {
  args: {
    dotSizeClassName: 'w-2 h-2',
    dotColor: 'bg-gradient-to-r from-blue-500 to-purple-500',
    dotClassName: 'shadow-lg',
    className: 'flex gap-1',
    animationDuration: '1.5s',
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom styling with gradient colors, shadows, and custom spacing.',
      },
    },
  },
};

export const GlowEffect: Story = {
  args: {
    dotSizeClassName: 'w-2 h-2',
    dotColor: 'bg-blue-400',
    dotClassName: 'shadow-lg shadow-blue-400/50',
    className: 'flex gap-1',
  },
  parameters: {
    docs: {
      description: {
        story: 'Glowing effect using shadow utilities.',
      },
    },
  },
};

// All Sizes Showcase
export const AllSizes: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Small (w-1 h-1)</p>
        <TypingDots dotSizeClassName="w-1 h-1" />
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Medium (w-1.5 h-1.5)</p>
        <TypingDots dotSizeClassName="w-1.5 h-1.5" />
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Large (w-2 h-2)</p>
        <TypingDots dotSizeClassName="w-2 h-2" />
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Extra Large (w-3 h-3)</p>
        <TypingDots dotSizeClassName="w-3 h-3" />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Comparison of all available dot sizes.',
      },
    },
  },
};

// All Colors Showcase
export const AllColors: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-6">
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Default (current color)</p>
        <TypingDots />
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Blue</p>
        <TypingDots dotColor="bg-blue-500" />
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Green</p>
        <TypingDots dotColor="bg-green-500" />
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Red</p>
        <TypingDots dotColor="bg-red-500" />
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Purple</p>
        <TypingDots dotColor="bg-purple-500" />
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Gray</p>
        <TypingDots dotColor="bg-gray-500" />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Comparison of different color options.',
      },
    },
  },
};

// Animation Speed Showcase
export const AnimationSpeeds: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Fast (0.5s)</p>
        <TypingDots animationDuration="0.5s" dotColor="bg-green-500" />
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Normal (1s)</p>
        <TypingDots animationDuration="1s" dotColor="bg-blue-500" />
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Slow (2s)</p>
        <TypingDots animationDuration="2s" dotColor="bg-purple-500" />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Comparison of different animation speeds.',
      },
    },
  },
};

// Usage Examples
export const ChatTypingIndicator: Story = {
  render: () => (
    <div className="max-w-sm">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-2">
        <p className="text-sm">Hey, how are you doing?</p>
      </div>
      <div className="bg-blue-500 text-white rounded-lg p-3 mb-2 ml-8">
        <p className="text-sm">I'm doing great! How about you?</p>
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 flex items-center">
        <TypingDots dotColor="bg-gray-500" className="mr-2" />
        <span className="text-sm text-gray-500">Alex is typing...</span>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Example of TypingDots used in a chat interface to show typing activity.',
      },
    },
  },
};

export const LoadingState: Story = {
  render: () => (
    <div className="text-center p-8">
      <h3 className="text-lg font-semibold mb-4">Loading your messages</h3>
      <TypingDots dotSizeClassName="w-2 h-2" dotColor="bg-blue-500" />
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Example of TypingDots used as a loading indicator.',
      },
    },
  },
};

export const InlineTyping: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600 dark:text-gray-400">Sarah is typing</span>
      <TypingDots dotSizeClassName="w-1 h-1" dotColor="bg-gray-400" />
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Example of TypingDots used inline with text.',
      },
    },
  },
};

export const MultipleUsers: Story = {
  render: () => (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
          A
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">Alex is typing</span>
        <TypingDots dotSizeClassName="w-1 h-1" dotColor="bg-blue-500" />
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
          S
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">Sarah is typing</span>
        <TypingDots dotSizeClassName="w-1 h-1" dotColor="bg-green-500" />
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
          M
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">Mike is typing</span>
        <TypingDots dotSizeClassName="w-1 h-1" dotColor="bg-purple-500" />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Example showing multiple users typing with different colored indicators.',
      },
    },
  },
}; 