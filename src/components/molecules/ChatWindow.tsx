import React from 'react';
import { ChatRoomProvider } from '@ably/chat/react';
import { RoomOptions } from '@ably/chat';
import { EmptyState } from './EmptyState.tsx';
import { ActiveChatWindow } from './ActiveChatWindow.tsx';

/**
 * Props for the ChatWindow component
 */
export interface ChatWindowProps {
  /**
   * Name of the currently active chat room.
   * When undefined or empty, displays an empty state prompting user to select a room.
   * When provided, establishes a ChatRoomProvider context and renders the full chat interface.
   */
  activeRoomName?: string;

  /**
   * Default room options to apply to the chat room.
   * These options configure room behavior including occupancy tracking, typing indicators,
   * message history settings, and other room-level features.
   *
   * If you have used the same room in multiple ChatRoomProviders, you must provide the same options
   * to each provider.
   *
   * If you do not provide options, the room will use the default {@link RoomOptions} from the Ably Chat SDK.
   *
   * @default undefined
   *
   * @example
   * // Basic room options
   * defaultRoomOptions={{
   *   occupancy: { enableEvents: true },
   *   typing: { timeoutMs: 5000 }
   * }}
   */
  defaultRoomOptions?: RoomOptions;

  /**
   * Whether the room should attach/detach automatically on mount/unmount.
   * If true, the ChatRoomProvider will automatically attach to the room when the component mounts
   * and detach when it unmounts. Set to false for manual room lifecycle management.
   *
   * @remarks Currently, ChatRoomProviders have no method to check if they hold the only reference to the room.
   * As such, if you are using the same room in multiple ChatRoomProviders, you should set this to false
   * and manage the attach/detach lifecycle manually to avoid conflicts. This will be fixed in an upcoming release.
   *
   * @default true
   */
  attach?: boolean;

  /**
   * Whether the room should release when the component unmounts.
   * If false, you must manage room release manually to prevent memory leaks.
   * Set to false when sharing rooms across multiple components.
   *
   * @remarks Currently, ChatRoomProviders have no method to check if they hold the only reference to the room.
   * As such, if you are using the same room in multiple ChatRoomProviders, you should set this to false
   * and manage the release lifecycle manually.
   *
   * @default true
   */
  release?: boolean;

  /**
   * Optional custom content for the chat header area.
   * Typically used for room information, participant counts, or action buttons.
   * Content will be rendered within the ChatWindowHeader component.
   *
   * @example
   * customHeaderContent={<RoomInfo roomName={activeRoomName} />}
   */
  customHeaderContent?: React.ReactNode;

  /**
   * Optional custom content for the chat footer area.
   * Typically used for reaction pickers, file upload buttons, or additional controls.
   * Content will be rendered alongside the MessageInput in the ChatWindowFooter.
   *
   * @example
   * customFooterContent={<ReactionPicker />}
   */
  customFooterContent?: React.ReactNode;

  /**
   * Initial number of messages to load when entering a room.
   * Set to 0 to disable automatic history loading.
   * Higher values load more context but may impact initial load performance.
   *
   * @default 20
   */
  initialHistoryLimit?: number;

  /**
   * Additional CSS class names to apply to the root container.
   * Useful for custom styling, layout adjustments, or theme variations.
   */
  className?: string;

  /**
   * Configuration for the empty state displayed when no room is selected.
   * Allows customization of the icon, title, and message shown to users.
   */
  emptyStateConfig?: {
    /** Custom icon to display in the empty state */
    icon?: React.ReactNode;
    /** Custom title text for the empty state */
    title?: string;
    /** Custom message text for the empty state */
    message?: string;
    /** Optional action button for the empty state */
    action?: React.ReactNode;
  };
}

/**
 * ChatWindow component acts as a wrapper around the {@link ActiveChatWindow}, to provide loading and empty state management.
 * It must be used within an {@link ChatRoomProvider}, {@link AvatarProvider} and {@link ChatSettingsProvider} to function correctly.
 *
 * Features:
 * - Automatically switches between empty state and active chat
 * - Manages ChatRoomProvider lifecycle and context
 * - Configurable initial message loading with pagination support
 * - Flexible header and footer content slots
 * - ARIA support with proper semantic structure
 *
 *
 * @example
 * // Basic usage with room selection
 * <ChatWindow activeRoomName="general" />
 *
 * @example
 * // With custom room options and content
 * <ChatWindow
 *   activeRoomName="support"
 *   defaultRoomOptions={{
 *     occupancy: { enableEvents: true },
 *     typing: { timeoutMs: 5000 }
 *   }}
 *   customHeaderContent={<RoomInfo />}
 *   customFooterContent={<ReactionPicker />}
 *   initialHistoryLimit={50}
 * />
 *
 * @example
 * // Empty state with custom configuration
 * <ChatWindow
 *   emptyStateConfig={{
 *     title: "Welcome to Team Chat",
 *     message: "Select a channel from the sidebar to start collaborating",
 *     action: <Button onClick={handleCreateRoom}>Create Channel</Button>
 *   }}
 * />
 *
 * @example
 * // Manual room lifecycle management
 * <ChatWindow
 *   activeRoomName="private-room"
 *   attach={false}
 *   release={false}
 *   className="custom-chat-theme"
 * />
 */
export const ChatWindow: React.FC<ChatWindowProps> = ({
  activeRoomName,
  defaultRoomOptions,
  attach = true,
  release = true,
  customHeaderContent,
  customFooterContent,
  initialHistoryLimit = 20,
  className,
  emptyStateConfig,
}) => {
  // Render empty state when no room is selected
  if (!activeRoomName) {
    return (
      <div className={`flex flex-col h-full ${className || ''}`}>
        <EmptyState
          icon={
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          }
          title={emptyStateConfig?.title || 'Select a room to start chatting'}
          message={
            emptyStateConfig?.message ||
            'Choose a room or create a new one to begin your conversation'
          }
          action={emptyStateConfig?.action}
          ariaLabel="No chat room selected"
        />
      </div>
    );
  }

  // Render active chat room with provider context
  return (
    <ChatRoomProvider
      key={activeRoomName}
      name={activeRoomName}
      attach={attach}
      release={release}
      options={defaultRoomOptions}
    >
      <ActiveChatWindow
        roomName={activeRoomName}
        customHeaderContent={customHeaderContent}
        customFooterContent={customFooterContent}
        initialHistoryLimit={initialHistoryLimit}
        className={className}
      />
    </ChatRoomProvider>
  );
};

// Set display name for better debugging experience
ChatWindow.displayName = 'ChatWindow';
