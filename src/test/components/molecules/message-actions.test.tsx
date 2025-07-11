import { type UseRoomResponse } from '@ably/chat/react';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ButtonProps } from '../../../components/atoms/button.tsx';
import { IconProps } from '../../../components/atoms/icon.tsx';
import { MessageActions } from '../../../components/molecules/message-actions.tsx';
import { ChatSettings, ChatSettingsContextType } from '../../../context/chat-settings-context.tsx';
import { useChatSettings } from '../../../hooks/use-chat-settings.tsx';

// Mock the useRoom hook
vi.mock('@ably/chat/react', () => ({
  useRoom: vi.fn().mockReturnValue({
    roomName: 'test-room',
  } as Partial<UseRoomResponse>),
}));

// Mock the useChatSettings hook
vi.mock('../../../hooks/use-chat-settings.tsx');

// Mocks the Button component
vi.mock('../../../components/atoms/button', () => ({
  Button: ({
    children,
    onClick,
    variant,
    size,
    className,
    'aria-label': ariaLabel,
  }: ButtonProps) => (
    <button
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  ),
}));

// Mocks the Icon component
vi.mock('../../../components/atoms/icon', () => ({
  Icon: ({ name, size, 'aria-hidden': ariaHidden }: IconProps) => (
    <div data-testid={`icon-${name}`} data-size={size} aria-hidden={ariaHidden}>
      {name} icon
    </div>
  ),
}));

const createMockUseSettings = (
  settings: Partial<ReturnType<typeof useChatSettings>>
): ChatSettingsContextType => {
  return {
    getEffectiveSettings: vi.fn().mockReturnValue({
      allowMessageUpdatesOwn: true,
      allowMessageUpdatesAny: false,
      allowMessageDeletesOwn: true,
      allowMessageDeletesAny: false,
      allowMessageReactions: true,
    }),
    ...settings,
  } as ChatSettingsContextType;
};

describe('MessageActions', () => {
  const defaultSettings: ChatSettings = {
    allowMessageUpdatesOwn: true,
    allowMessageUpdatesAny: false,
    allowMessageDeletesOwn: true,
    allowMessageDeletesAny: false,
    allowMessageReactions: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useChatSettings).mockReturnValue(
      createMockUseSettings({
        globalSettings: defaultSettings,
        roomSettings: {},
        getEffectiveSettings: () => defaultSettings,
      })
    );
  });

  it('renders nothing when no actions are provided', () => {
    const { container } = render(<MessageActions isOwn={false} />);

    // The component should not render anything when no actions are provided
    expect(container.firstChild).toBeNull();
  });

  it('renders only reaction button for non-own messages with default settings', () => {
    const handleReaction = vi.fn();

    render(<MessageActions isOwn={false} onReactionButtonClicked={handleReaction} />);

    // Should render the toolbar
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar).toBeInTheDocument();
    expect(toolbar).toHaveAttribute('aria-label', 'Message actions');

    // Should render only the reaction button
    const reactionButton = screen.getByLabelText('Add reaction');
    expect(reactionButton).toBeInTheDocument();

    // Should not render edit or delete buttons
    expect(screen.queryByLabelText('Edit message')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Delete message')).not.toBeInTheDocument();
  });

  it('renders all buttons for own messages with default settings', () => {
    const handleReaction = vi.fn();
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();

    render(
      <MessageActions
        isOwn={true}
        onReactionButtonClicked={handleReaction}
        onEditButtonClicked={handleEdit}
        onDeleteButtonClicked={handleDelete}
      />
    );

    // Should render all three buttons
    expect(screen.getByLabelText('Add reaction')).toBeInTheDocument();
    expect(screen.getByLabelText('Edit message')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete message')).toBeInTheDocument();
  });

  it('does not render edit and delete buttons for non-own messages with default settings', () => {
    const handleReaction = vi.fn();
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();

    render(
      <MessageActions
        isOwn={false}
        onReactionButtonClicked={handleReaction}
        onEditButtonClicked={handleEdit}
        onDeleteButtonClicked={handleDelete}
      />
    );

    // Should render only the reaction button
    expect(screen.getByLabelText('Add reaction')).toBeInTheDocument();

    // Should not render edit or delete buttons
    expect(screen.queryByLabelText('Edit message')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Delete message')).not.toBeInTheDocument();
  });

  it('renders edit and delete buttons for non-own messages when allowAny settings are enabled', () => {
    const handleReaction = vi.fn();
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();

    const adminSettings: ChatSettings = {
      ...defaultSettings,
      allowMessageUpdatesAny: true,
      allowMessageDeletesAny: true,
    };

    vi.mocked(useChatSettings).mockReturnValue({
      globalSettings: adminSettings,
      roomSettings: {},
      getEffectiveSettings: () => adminSettings,
    });

    render(
      <MessageActions
        isOwn={false}
        onReactionButtonClicked={handleReaction}
        onEditButtonClicked={handleEdit}
        onDeleteButtonClicked={handleDelete}
      />
    );

    // Should render all three buttons when allowAny settings are enabled
    expect(screen.getByLabelText('Add reaction')).toBeInTheDocument();
    expect(screen.getByLabelText('Edit message')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete message')).toBeInTheDocument();
  });

  it('does not render edit and delete buttons when corresponding settings are disabled', () => {
    const handleReaction = vi.fn();
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();

    const disabledSettings: ChatSettings = {
      allowMessageUpdatesOwn: false,
      allowMessageUpdatesAny: false,
      allowMessageDeletesOwn: false,
      allowMessageDeletesAny: false,
      allowMessageReactions: true,
    };

    vi.mocked(useChatSettings).mockReturnValue({
      globalSettings: disabledSettings,
      roomSettings: {},
      getEffectiveSettings: () => disabledSettings,
    });

    render(
      <MessageActions
        isOwn={true}
        onReactionButtonClicked={handleReaction}
        onEditButtonClicked={handleEdit}
        onDeleteButtonClicked={handleDelete}
      />
    );

    // Should render only the reaction button
    expect(screen.getByLabelText('Add reaction')).toBeInTheDocument();

    // Should not render edit or delete buttons even for own messages
    expect(screen.queryByLabelText('Edit message')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Delete message')).not.toBeInTheDocument();
  });

  it('calls onReactionButtonClicked when reaction button is clicked', () => {
    const handleReaction = vi.fn();

    render(<MessageActions isOwn={false} onReactionButtonClicked={handleReaction} />);

    // Find and click on the reaction button
    const reactionButton = screen.getByLabelText('Add reaction');
    fireEvent.click(reactionButton);

    // Check if the handler was called
    expect(handleReaction).toHaveBeenCalledTimes(1);
  });

  it('calls onEditButtonClicked when edit button is clicked', () => {
    const handleEdit = vi.fn();

    render(<MessageActions isOwn={true} onEditButtonClicked={handleEdit} />);

    // Find and click on the edit button
    const editButton = screen.getByLabelText('Edit message');
    fireEvent.click(editButton);

    // Check if the handler was called
    expect(handleEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onDeleteButtonClicked when delete button is clicked', () => {
    const handleDelete = vi.fn();

    render(<MessageActions isOwn={true} onDeleteButtonClicked={handleDelete} />);

    // Find and click on the delete button
    const deleteButton = screen.getByLabelText('Delete message');
    fireEvent.click(deleteButton);

    // Check if the handler was called
    expect(handleDelete).toHaveBeenCalledTimes(1);
  });

  it('renders correct icons for each button', () => {
    render(
      <MessageActions
        isOwn={true}
        onReactionButtonClicked={() => {}}
        onEditButtonClicked={() => {}}
        onDeleteButtonClicked={() => {}}
      />
    );

    // Check if the correct icons are rendered
    expect(screen.getByTestId('icon-emoji')).toBeInTheDocument();
    expect(screen.getByTestId('icon-edit')).toBeInTheDocument();
    expect(screen.getByTestId('icon-delete')).toBeInTheDocument();
  });

  it('applies correct styling classes to the toolbar', () => {
    render(<MessageActions isOwn={true} onReactionButtonClicked={() => {}} />);

    // Check if the toolbar has the correct styling classes
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar).toHaveClass('absolute');
    expect(toolbar).toHaveClass('-top-9');
    expect(toolbar).toHaveClass('right-0');
    expect(toolbar).toHaveClass('z-10');
    expect(toolbar).toHaveClass('flex');
    expect(toolbar).toHaveClass('items-center');
    expect(toolbar).toHaveClass('gap-1');
    expect(toolbar).toHaveClass('bg-white');
    expect(toolbar).toHaveClass('dark:bg-gray-800');
    expect(toolbar).toHaveClass('border');
    expect(toolbar).toHaveClass('border-gray-200');
    expect(toolbar).toHaveClass('dark:border-gray-600');
    expect(toolbar).toHaveClass('rounded-lg');
    expect(toolbar).toHaveClass('shadow-md');
    expect(toolbar).toHaveClass('p-1');
  });
});
