import { action } from 'storybook/actions';
import { Avatar } from './Avatar';
import { Meta, StoryObj } from '@storybook/react-vite';

/**
 * The Avatar component displays user or room avatars with fallback to initials.
 */
const meta: Meta<typeof Avatar> = {
  title: 'Atoms/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Avatar component provides a consistent way to display user or room avatars throughout the application.

## Features
- Image display with automatic fallback to initials
- Multiple size options (sm, md, lg, xl)
- Automatic color generation based on name
- Custom color support
- Click interaction support
- Accessibility features with proper ARIA attributes
- Error handling for broken images

## Usage
Use avatars to represent users, rooms, or other entities in the interface. The component automatically handles image loading errors and generates appropriate fallbacks.

## Recommended Image Specifications
- Dimensions: 256x256 pixels
- Formats: JPG, PNG, WebP, SVG
- Maximum file size: 5MB
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    src: {
      control: 'text',
      description: 'URL to the avatar image',
    },
    alt: {
      control: 'text',
      description: 'Alternative text for the avatar image, also used for generating initials',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Size of the avatar',
    },
    color: {
      control: 'text',
      description: 'Background color for the avatar when no image is provided (Tailwind CSS class)',
    },
    initials: {
      control: 'text',
      description: 'Custom initials to display when no image is available',
    },
    onClick: { action: 'clicked' },
  },
  args: {
    onClick: action('clicked'),
    alt: 'John Doe',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    alt: 'John Doe',
  },
};

export const WithImage: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=crop&crop=face',
    alt: 'John Doe',
  },
};

export const WithCustomInitials: Story = {
  args: {
    alt: 'John Doe',
    initials: 'KJ',
  },
};

export const WithCustomColor: Story = {
  args: {
    alt: 'Jane Smith',
    color: 'bg-purple-500',
  },
};

// Interactive Examples
export const Clickable: Story = {
  args: {
    alt: 'Clickable Avatar',
    onClick: () => alert('Profile clicked!'),
    src: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=256&h=256&fit=crop&crop=face',
  },
};

// Error Handling
export const BrokenImage: Story = {
  args: {
    src: 'https://broken-image-url.com/avatar.jpg',
    alt: 'Broken Image Example',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example showing how the component handles broken image URLs by falling back to initials.',
      },
    },
  },
};

export const EmptyAlt: Story = {
  args: {
    alt: '',
  },
  parameters: {
    docs: {
      description: {
        story: 'Example showing fallback behavior when no alt text is provided.',
      },
    },
  },
};

// All Sizes Showcase
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <Avatar alt="Small User" size="sm" />
        <span className="text-xs text-gray-600 dark:text-gray-400">Small</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar alt="Medium User" size="md" />
        <span className="text-xs text-gray-600 dark:text-gray-400">Medium</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar alt="Large User" size="lg" />
        <span className="text-xs text-gray-600 dark:text-gray-400">Large</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar alt="Extra Large User" size="xl" />
        <span className="text-xs text-gray-600 dark:text-gray-400">Extra Large</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of all available avatar sizes.',
      },
    },
  },
};

// Color Variations
export const ColorVariations: Story = {
  render: () => {
    const users = [
      { name: 'Alice Johnson', color: 'bg-blue-500' },
      { name: 'Bob Smith', color: 'bg-green-500' },
      { name: 'Carol Davis', color: 'bg-purple-500' },
      { name: 'David Wilson', color: 'bg-orange-500' },
      { name: 'Eva Brown', color: 'bg-pink-500' },
      { name: 'Frank Miller', color: 'bg-indigo-500' },
    ];

    return (
      <div className="flex flex-wrap gap-4">
        {users.map((user) => (
          <div key={user.name} className="flex flex-col items-center gap-2">
            <Avatar alt={user.name} color={user.color} size="lg" />
            <span className="text-xs text-gray-600 dark:text-gray-400 text-center">
              {user.name}
            </span>
          </div>
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Examples of avatars with different custom colors.',
      },
    },
  },
};

// Auto-Generated Colors
export const AutoGeneratedColors: Story = {
  render: () => {
    const users = [
      'Alice Johnson',
      'Bob Smith',
      'Carol Davis',
      'David Wilson',
      'Eva Brown',
      'Frank Miller',
      'Grace Taylor',
      'Henry Anderson',
    ];

    return (
      <div className="flex flex-wrap gap-4">
        {users.map((name) => (
          <div key={name} className="flex flex-col items-center gap-2">
            <Avatar alt={name} size="lg" />
            <span className="text-xs text-gray-600 dark:text-gray-400 text-center">{name}</span>
          </div>
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Examples showing automatically generated colors based on names. Colors are deterministic - the same name will always get the same color.',
      },
    },
  },
};

// Mixed Content (Images and Initials)
export const MixedContent: Story = {
  render: () => {
    const users = [
      {
        name: 'John Doe',
        src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=crop&crop=face',
      },
      {
        name: 'Jane Smith',
        src: undefined,
      },
      {
        name: 'Mike Johnson',
        src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=face',
      },
      {
        name: 'Sarah Wilson',
        src: undefined,
      },
      {
        name: 'Tom Brown',
        src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&fit=crop&crop=face',
      },
    ];

    return (
      <div className="flex flex-wrap gap-4">
        {users.map((user) => (
          <div key={user.name} className="flex flex-col items-center gap-2">
            <Avatar alt={user.name} src={user.src} size="lg" />
            <span className="text-xs text-gray-600 dark:text-gray-400 text-center">
              {user.name}
            </span>
          </div>
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Real-world example showing a mix of avatars with images and initials fallbacks.',
      },
    },
  },
};

// Usage Patterns
export const UserProfile: Story = {
  render: () => (
    <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <Avatar
        src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=256&h=256&fit=crop&crop=face"
        alt="Sarah Johnson"
        size="lg"
        onClick={() => alert('Profile clicked!')}
      />
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Sarah Johnson</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Product Designer</p>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Example of avatar usage in a user profile context.',
      },
    },
  },
};

export const ChatMessage: Story = {
  render: () => (
    <div className="flex gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow max-w-md">
      <Avatar alt="Mike Chen" size="sm" />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-gray-900 dark:text-gray-100">Mike Chen</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">2:30 PM</span>
        </div>
        <p className="text-gray-700 dark:text-gray-300">
          Hey everyone! Just wanted to share the latest design updates with the team.
        </p>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Example of avatar usage in a chat message context.',
      },
    },
  },
};

export const AvatarGroup: Story = {
  render: () => (
    <div className="flex -space-x-2">
      <Avatar
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=crop&crop=face"
        alt="John Doe"
        size="md"
      />
      <Avatar alt="Jane Smith" size="md" />
      <Avatar
        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=face"
        alt="Mike Johnson"
        size="md"
      />
      <Avatar alt="Sarah Wilson" size="md" />
      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400">
        +3
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of overlapping avatars to show multiple users (avatar group pattern).',
      },
    },
  },
};
