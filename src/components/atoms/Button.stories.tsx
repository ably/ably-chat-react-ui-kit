import { action } from 'storybook/actions';
import { Button } from './Button';
import { Icon } from './Icon';
import { Meta, StoryObj } from '@storybook/react-vite';

/**
 * The Button component provides a highly customizable button with multiple variants and states.
 * It supports different sizes, variants, loading states, and icon placements.
 */
const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Button component is a foundational UI element that provides consistent styling and behavior across the application.

## Features
- Multiple visual variants (primary, secondary, ghost, outline, danger)
- Size variations from extra small to extra large
- Loading states with customizable spinners
- Icon support (left and right positioning)
- Full accessibility support with proper ARIA attributes
- Dark mode compatible
- Focus management and keyboard navigation
- Disabled state handling

## Usage
Use buttons to trigger actions, navigation, or form submissions. Choose the appropriate variant based on the action's importance and context.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'outline', 'danger'],
      description: 'Visual variant of the button',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size of the button',
    },
    loading: {
      control: 'boolean',
      description: 'Shows loading spinner and disables interaction',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether the button should take full width of its container',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button',
    },
    children: {
      control: 'text',
      description: 'Button content',
    },
    onClick: { action: 'clicked' },
  },
  args: {
    onClick: action('clicked'),
    children: 'Button',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    children: 'Default Button',
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Danger Button',
  },
};

// Size Variations
export const ExtraSmall: Story = {
  args: {
    size: 'xs',
    children: 'Extra Small',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    children: 'Medium',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large',
  },
};

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
    children: 'Extra Large',
  },
};

// States
export const Loading: Story = {
  args: {
    loading: true,
    children: 'Loading...',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: 'Full Width Button',
  },
  parameters: {
    layout: 'padded',
  },
};

// With Icons
export const WithLeftIcon: Story = {
  args: {
    leftIcon: <Icon name="send" />,
    children: 'Send Message',
  },
};

export const WithRightIcon: Story = {
  args: {
    rightIcon: <Icon name="chevronright" />,
    children: 'Continue',
  },
};

export const IconOnly: Story = {
  args: {
    children: <Icon name="close" />,
    'aria-label': 'Close',
    size: 'sm',
  },
};

// Complex Examples
export const CallToAction: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    rightIcon: <Icon name="chevronright" />,
    children: 'Get Started Today',
  },
};

export const DestructiveAction: Story = {
  args: {
    variant: 'danger',
    leftIcon: <Icon name="delete" />,
    children: 'Delete Account',
  },
};

export const LoadingState: Story = {
  args: {
    variant: 'primary',
    loading: true,
    children: 'Saving Changes...',
  },
};

// All Variants Showcase
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Overview of all button variants side by side.',
      },
    },
  },
};

// All Sizes Showcase
export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="xs">Extra Small</Button>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Overview of all button sizes side by side.',
      },
    },
  },
};

// Interactive Examples for Testing
export const InteractiveTest: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button variant="primary" onClick={() => alert('Primary clicked!')}>
          Click Me
        </Button>
        <Button variant="secondary" onClick={() => alert('Secondary clicked!')}>
          Or Me
        </Button>
      </div>

      <div className="flex gap-4">
        <Button
          variant="outline"
          leftIcon={<Icon name="thumbsup" />}
          onClick={() => alert('Liked!')}
        >
          Like
        </Button>
        <Button
          variant="ghost"
          rightIcon={<Icon name="chevronright" />}
          onClick={() => alert('Next!')}
        >
          Next
        </Button>
      </div>

      <Button
        variant="danger"
        leftIcon={<Icon name="delete" />}
        onClick={() => confirm('Are you sure you want to delete?')}
        fullWidth
      >
        Delete Everything
      </Button>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Interactive buttons for testing click handlers and user interactions.',
      },
    },
  },
};
