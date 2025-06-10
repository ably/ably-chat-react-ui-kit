import React, { useState } from 'react';
import { ChatRoomProvider } from '@ably/chat/react';
import { RoomOptions } from '@ably/chat';
import { ChatWindow } from './ChatWindow';
import { RoomInfo, RoomReaction } from '../molecules';

/**
 * Props for the ChatArea component
 */
export interface ChatAreaProps {
  /**
   * Name of the currently active chat room
   * When undefined, displays an empty state
   */
  activeRoomName?: string;

  /**
   * Default room options to apply to the chat room
   * These options configure room behavior, occupancy tracking, etc.
   * @default { occupancy: { enableEvents: true } }
   */
  defaultRoomOptions?: RoomOptions;

  /**
   * Whether the room should attach/detach automatically on mount/unmount
   * If true, the ChatRoomProvider will automatically attach to the room when the component mounts
   * and detach when it unmounts.
   *
   * @remarks Currently, ChatRoomProviders have no method to check if they hold the only reference to the room.
   * As such, if you are using the same room in multiple ChatRoomProviders, you should set this to false and manage the attach/release manually.
   *
   * @default true
   */
  attach?: boolean;

  /**
   * Whether the room should release when the component unmounts
   * If false, you must manage room release manually
   *
   * @remarks Currently, ChatRoomProviders have no method to check if they hold the only reference to the room.
   * As such, if you are using the same room in multiple ChatRoomProviders, you should set this to false and manage the attach/release manually.
   *
   * @default true
   */
  release?: boolean;
}

/**
 * ChatArea component serves as the main chat interface container
 *
 * Features:
 * - Displays empty state when no room is selected
 * - Provides ChatRoomProvider context for child components
 *
 * @example
 * // Basic usage with room selection
 * <ChatArea activeRoomName="general" />
 *
 * @example
 * // With custom room options
 * <ChatArea
 *   activeRoomName="support"
 *   defaultRoomOptions={{
 *     occupancy: { enableEvents: true },
 *     typing: { timeoutMs: 5000 }
 *   }}
 * />
 *
 * @example
 * // Empty state (no room selected)
 * <ChatArea />
 */
export const ChatArea: React.FC<ChatAreaProps> = ({
  activeRoomName,
  defaultRoomOptions,
  attach,
  release,
}) => {
  // Memoize room options to prevent unnecessary re-renders
  const [roomOptions] = useState<RoomOptions>(
    defaultRoomOptions || { occupancy: { enableEvents: true } }
  );

  // Render empty state when no room is selected
  if (!activeRoomName) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        role="complementary"
        aria-label="Chat area - no room selected"
      >
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-4">
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
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Select a room to start chatting
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Choose a room or create a new one to begin your conversation
          </p>
        </div>
      </div>
    );
  }

  // Render active chat room
  return (
    <ChatRoomProvider
      key={activeRoomName}
      name={activeRoomName}
      attach={attach}
      release={release}
      options={roomOptions}
    >
      <ChatWindow
        key={activeRoomName}
        roomName={activeRoomName}
        customHeaderContent={<RoomInfo roomName={activeRoomName} />}
        customFooterContent={<RoomReaction />}
      />
    </ChatRoomProvider>
  );
};

// Set display name for better debugging experience
ChatArea.displayName = 'ChatArea';
