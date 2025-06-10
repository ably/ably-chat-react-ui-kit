import { action } from 'storybook/actions';
import { TextInput } from './TextInput';
import { Icon } from './Icon';
import { Button } from './Button';
import { Meta, StoryObj } from '@storybook/react-vite';

/**
 * The TextInput component provides a customizable input field with multiple variants and states.
 */
const meta: Meta<typeof TextInput> = {
  title: 'Atoms/TextInput',
  component: TextInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The TextInput component provides a flexible and accessible input field for various use cases throughout the application.

## Features
- Multiple visual variants (default form input, message input)
- Size variations (sm, md, lg)
- Error and success states with appropriate styling
- Dark mode support
- Accessibility with proper ARIA attributes
- Prefix/suffix support for icons and buttons
- Multi-line support with auto-expansion
- Auto-scrolling for better UX

## Usage
Use TextInput for form fields, search inputs, message composition, and any text input needs. Choose the appropriate variant based on the context and visual requirements.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'message'],
      description: 'Visual variant of the input field',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the input field',
    },
    error: {
      control: 'boolean',
      description: 'Error state styling',
    },
    success: {
      control: 'boolean',
      description: 'Success state styling',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    multiline: {
      control: 'boolean',
      description: 'Whether to use a multi-line textarea',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    value: {
      control: 'text',
      description: 'Input value',
    },
    maxHeight: {
      control: 'text',
      description: 'Maximum height for textarea when multiline is true',
    },
    onChange: { action: 'changed' },
    onFocus: { action: 'focused' },
    onBlur: { action: 'blurred' },
  },
  args: {
    onChange: action('changed'),
    onFocus: action('focused'),
    onBlur: action('blurred'),
    placeholder: 'Enter text...',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    placeholder: 'Enter your name',
  },
};

export const Message: Story = {
  args: {
    variant: 'message',
    placeholder: 'Type a message...',
  },
};

export const WithValue: Story = {
  args: {
    value: 'Hello, World!',
    placeholder: 'Enter text...',
  },
};

// Size Variations
export const Small: Story = {
  args: {
    size: 'sm',
    placeholder: 'Small input',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    placeholder: 'Medium input',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    placeholder: 'Large input',
  },
};

// States
export const Error: Story = {
  args: {
    error: true,
    placeholder: 'This field has an error',
    value: 'Invalid input',
  },
};

export const Success: Story = {
  args: {
    success: true,
    placeholder: 'This field is valid',
    value: 'Valid input',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'This field is disabled',
    value: 'Disabled input',
  },
};

// Multiline Examples
export const Multiline: Story = {
  args: {
    multiline: true,
    placeholder: 'Type a longer message...',
    rows: 3,
  },
};

export const MultilineWithMaxHeight: Story = {
  args: {
    multiline: true,
    maxHeight: '100px',
    placeholder: 'This textarea has a maximum height of 100px',
    value:
      'This is a longer text that will demonstrate the auto-resize functionality. Keep typing to see how it expands and then becomes scrollable after reaching the maximum height.',
  },
};

export const MessageMultiline: Story = {
  args: {
    variant: 'message',
    multiline: true,
    placeholder: 'Type a message...',
    size: 'lg',
  },
};

// With Icons and Buttons
export const WithPrefixIcon: Story = {
  args: {
    prefix: <Icon name="info" size="sm" />,
    placeholder: 'Search...',
  },
};

export const WithSuffixIcon: Story = {
  args: {
    suffix: <Icon name="send" size="sm" />,
    placeholder: 'Type a message...',
    variant: 'message',
  },
};

export const WithPrefixAndSuffix: Story = {
  args: {
    prefix: <Icon name="info" size="sm" />,
    suffix: (
      <Button size="sm" variant="ghost">
        <Icon name="send" />
      </Button>
    ),
    placeholder: 'Type and send...',
  },
};

export const SearchInput: Story = {
  args: {
    prefix: <Icon name="info" size="sm" />,
    placeholder: 'Search messages...',
    size: 'md',
  },
};

// All Sizes Showcase
export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Small
        </label>
        <TextInput size="sm" placeholder="Small input" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Medium
        </label>
        <TextInput size="md" placeholder="Medium input" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Large
        </label>
        <TextInput size="lg" placeholder="Large input" />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Comparison of all available input sizes.',
      },
    },
  },
};

// All Variants Showcase
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Default Variant
        </label>
        <TextInput variant="default" placeholder="Default form input" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Message Variant
        </label>
        <TextInput variant="message" placeholder="Message input" />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Comparison of all available input variants.',
      },
    },
  },
};

// All States Showcase
export const AllStates: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Normal
        </label>
        <TextInput placeholder="Normal state" value="Normal input" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Error
        </label>
        <TextInput error placeholder="Error state" value="Invalid input" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Success
        </label>
        <TextInput success placeholder="Success state" value="Valid input" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Disabled
        </label>
        <TextInput disabled placeholder="Disabled state" value="Disabled input" />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Comparison of all available input states.',
      },
    },
  },
};

// Usage Examples
export const LoginForm: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email
        </label>
        <TextInput
          type="email"
          placeholder="Enter your email"
          prefix={<Icon name="info" size="sm" />}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Password
        </label>
        <TextInput type="password" placeholder="Enter your password" />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Example of TextInput usage in a login form context.',
      },
    },
  },
};

export const ChatInterface: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Chat messages would appear here...
        </p>
      </div>
      <div className="flex gap-2">
        <TextInput
          variant="message"
          multiline
          maxHeight="120px"
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button variant="primary" size="lg">
          <Icon name="send" />
        </Button>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Example of TextInput usage in a chat interface with message variant.',
      },
    },
  },
};

export const SearchBar: Story = {
  render: () => (
    <div className="w-96">
      <TextInput
        prefix={<Icon name="info" size="sm" />}
        suffix={
          <Button variant="ghost" size="sm">
            <Icon name="close" size="sm" />
          </Button>
        }
        placeholder="Search conversations..."
        value="design meeting"
      />
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Example of TextInput usage as a search bar with prefix and suffix elements.',
      },
    },
  },
};

export const FormValidation: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Username
        </label>
        <TextInput
          error
          placeholder="Enter username"
          value="ab"
          aria-describedby="username-error"
        />
        <p id="username-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
          Username must be at least 3 characters long
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email
        </label>
        <TextInput
          success
          type="email"
          placeholder="Enter email"
          value="user@example.com"
          aria-describedby="email-success"
        />
        <p id="email-success" className="mt-1 text-sm text-green-600 dark:text-green-400">
          Email format is valid
        </p>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Example showing form validation states with error and success messages.',
      },
    },
  },
};
