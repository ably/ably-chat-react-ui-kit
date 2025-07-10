import { Meta, StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';

import { Icon } from '../components/atoms/icon.tsx';

/**
 * The Icon component renders SVG icons from a predefined icon library with consistent styling.
 */
const meta: Meta<typeof Icon> = {
  title: 'Atoms/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Icon component provides access to a curated library of SVG icons designed for consistent visual communication across the application.

## Features
- Predefined icon library with common UI icons
- Multiple size options (sm, md, lg, xl)
- Accessibility support with proper ARIA attributes
- Interactive support with click handlers and keyboard navigation
- Consistent stroke-based design
- Color variants and theming support

## Usage
Use icons to enhance visual communication, indicate actions, provide status feedback, or supplement text content. Icons should be meaningful and recognizable to users.

## Available Icons
send, moon, sun, phone, video, info, more, attachment, emoji, thumbsup, edit, delete, close, chevronleft, chevronright, upload
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: [
        'send',
        'moon',
        'sun',
        'phone',
        'video',
        'info',
        'more',
        'attachment',
        'emoji',
        'thumbsup',
        'edit',
        'delete',
        'close',
        'chevronleft',
        'chevronright',
        'upload',
      ],
      description: 'Name of the icon to display',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Size of the icon',
    },
    color: {
      control: 'select',
      options: ['current', 'primary', 'secondary', 'success', 'warning', 'error'],
      description: 'Color variant for the icon',
    },
    'aria-label': {
      control: 'text',
      description: 'Accessible label for the icon',
    },
    'aria-hidden': {
      control: 'boolean',
      description: 'Whether the icon is decorative only',
    },
    onClick: { action: 'clicked' },
  },
  args: {
    onClick: action('clicked'),
    name: 'send',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    name: 'send',
  },
};

export const WithAriaLabel: Story = {
  args: {
    name: 'send',
    'aria-label': 'Send message',
  },
};

export const Decorative: Story = {
  args: {
    name: 'emoji',
    'aria-hidden': true,
  },
};

// Size Variations
export const Small: Story = {
  args: {
    name: 'info',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    name: 'info',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    name: 'info',
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    name: 'info',
    size: 'xl',
  },
};

// Color Variants
export const Primary: Story = {
  args: {
    name: 'thumbsup',
    color: 'primary',
    size: 'lg',
  },
};

export const Secondary: Story = {
  args: {
    name: 'info',
    color: 'secondary',
    size: 'lg',
  },
};

export const Success: Story = {
  args: {
    name: 'thumbsup',
    color: 'success',
    size: 'lg',
  },
};

export const Warning: Story = {
  args: {
    name: 'info',
    color: 'warning',
    size: 'lg',
  },
};

export const Error: Story = {
  args: {
    name: 'delete',
    color: 'error',
    size: 'lg',
  },
};

// Interactive Examples
export const Clickable: Story = {
  args: {
    name: 'close',
    onClick: action('clicked'),
    'aria-label': 'Close dialog',
    className: 'cursor-pointer hover:text-red-500 transition-colors',
  },
};

export const ThemeToggle: Story = {
  args: {
    name: 'sun',
    onClick: action('clicked'),
    'aria-label': 'Switch to dark mode',
    className: 'cursor-pointer hover:text-yellow-500 transition-colors',
    size: 'lg',
  },
};

// All Icons Showcase
export const AllIcons: Story = {
  render: () => {
    const iconNames = [
      'send',
      'moon',
      'sun',
      'phone',
      'video',
      'info',
      'more',
      'attachment',
      'emoji',
      'thumbsup',
      'edit',
      'delete',
      'close',
      'chevronleft',
      'chevronright',
      'upload',
    ] as const;

    return (
      <div className="grid grid-cols-4 gap-8 p-4">
        {iconNames.map((iconName) => (
          <div key={iconName} className="flex flex-col items-center gap-2">
            <Icon name={iconName} size="lg" />
            <span className="text-sm text-gray-600 dark:text-gray-400">{iconName}</span>
          </div>
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete overview of all available icons in the library.',
      },
    },
  },
};

// All Sizes Showcase
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <Icon name="send" size="sm" />
        <span className="text-xs text-gray-600 dark:text-gray-400">Small</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="send" size="md" />
        <span className="text-xs text-gray-600 dark:text-gray-400">Medium</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="send" size="lg" />
        <span className="text-xs text-gray-600 dark:text-gray-400">Large</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="send" size="xl" />
        <span className="text-xs text-gray-600 dark:text-gray-400">Extra Large</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of all available icon sizes.',
      },
    },
  },
};

// All Colors Showcase
export const AllColors: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <Icon name="thumbsup" color="current" size="lg" />
        <span className="text-xs text-gray-600 dark:text-gray-400">Current</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="thumbsup" color="primary" size="lg" />
        <span className="text-xs text-gray-600 dark:text-gray-400">Primary</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="thumbsup" color="secondary" size="lg" />
        <span className="text-xs text-gray-600 dark:text-gray-400">Secondary</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="thumbsup" color="success" size="lg" />
        <span className="text-xs text-gray-600 dark:text-gray-400">Success</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="thumbsup" color="warning" size="lg" />
        <span className="text-xs text-gray-600 dark:text-gray-400">Warning</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="thumbsup" color="error" size="lg" />
        <span className="text-xs text-gray-600 dark:text-gray-400">Error</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of all available icon color variants.',
      },
    },
  },
};

// Usage Examples
export const NavigationIcons: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
        <Icon name="chevronleft" aria-label="Go back" />
      </button>
      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
        <Icon name="chevronright" aria-label="Go forward" />
      </button>
      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
        <Icon name="close" aria-label="Close" />
      </button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Common navigation icon usage patterns.',
      },
    },
  },
};

export const ActionIcons: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <button className="p-2 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900 dark:hover:text-blue-400 rounded transition-colors">
        <Icon name="edit" aria-label="Edit" />
      </button>
      <button className="p-2 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-400 rounded transition-colors">
        <Icon name="delete" aria-label="Delete" />
      </button>
      <button className="p-2 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900 dark:hover:text-green-400 rounded transition-colors">
        <Icon name="thumbsup" aria-label="Like" />
      </button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Common action icon usage patterns with hover states.',
      },
    },
  },
};

// Error Handling
export const InvalidIcon: Story = {
  args: {
    // @ts-expect-error - Testing invalid icon name
    name: 'nonexistent',
    'aria-label': 'Invalid icon example',
  },
  parameters: {
    docs: {
      description: {
        story: 'Example of how the component handles invalid icon names by showing a fallback.',
      },
    },
  },
};
