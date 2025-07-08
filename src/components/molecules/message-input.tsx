import { Message } from '@ably/chat';
import { useMessages, useTyping } from '@ably/chat/react';
import React, { ChangeEvent, KeyboardEvent, useCallback, useRef, useState } from 'react';

import { Button } from '../atoms/button.tsx';
import { Icon } from '../atoms/icon.tsx';
import { TextInput } from '../atoms/text-input.tsx';
import { EmojiPicker } from './emoji-picker.tsx';

/**
 * Props for the MessageInput component
 */
export interface MessageInputProps {
  /**
   * Callback function triggered when a message is sent.
   * Receives the built message as a parameter. This is useful for providing
   * an optimistic UI update or for handling the message in a parent component.
   *
   * The input field is automatically cleared after sending.
   * Typing indicators are stopped when a message is sent.
   *
   * @param message - The newly sent message object.
   *
   * @example
   * ```tsx
   * const handleSentMessage = async (message: Message) => {
   *  // alert('Message sent: ' + message.text);
   * };
   *
   * <MessageInput onSent={handleSent} />
   * ```
   */
  onSent?: (message: Message) => void;

  /**
   * Placeholder text displayed in the input field when empty.
   * Provides context about the input's purpose to users.
   *
   * @default "Type a message..."
   *
   * @example
   * ```tsx
   * <MessageInput
   *   placeholder="Send a message to the team..."
   *   onSend={handleSend}
   * />
   * ```
   */
  placeholder?: string;
}

/**
 * MessageInput component provides a comprehensive text input interface for composing and sending chat messages
 *
 * Core Features:
 * - Multi-line text input with automatic height adjustment (max 150px)
 * - Enter key to send (Shift+Enter for new line)
 * - Integrated emoji picker with cursor position insertion
 * - Typing indicators to alert others when composing messages
 * - Automatic input cleanup and focus management
 * - Accessible form controls with proper ARIA attributes
 * - Theme-aware styling (light/dark mode support)
 *
 * Typing Indicators:
 * - Triggered on each keystroke when content is present
 * - Automatically stopped when input is cleared or message is sent
 *
 * Emoji Integration:
 * - Picker positioned above the emoji button
 * - Smart cursor position handling for emoji insertion
 * - Maintains focus and cursor position after emoji selection
 * - Fallback behavior for browsers without selection API support
 *
 * @example
 * // Basic usage in chat interface
 * const [messages, setMessages] = useState<Message[]>([]);
 *
 * const handleSentMessage = (message) => {
 *   setMessages(prev => [...prev, message]);
 * };
 *
 * return (
 *   <div className="chat-container">
 *     <MessageList messages={messages} />
 *     <MessageInput
 *       onSent={handleSentMessage}
 *       placeholder="Type your message here..."
 *     />
 *   </div>
 * );
 *
 */

export const MessageInput = ({ onSent, placeholder = 'Type a message...' }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const messageRef = useRef('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState({ top: 0, left: 0 });
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { keystroke, stop } = useTyping();
  const { send } = useMessages();

  /**
   * Handles sending the message, clearing the input, and stopping typing indicators
   */
  const handleSend = useCallback(() => {
    const trimmedMessage = messageRef.current.trim();
    if (trimmedMessage) {
      send({ text: trimmedMessage }).then((sentMessage) => {
        onSent?.(sentMessage);
        setMessage('');
        messageRef.current = '';
        stop().catch((error: unknown) => {
          console.warn('Stop typing failed:', error);
        });
      }).catch((error: unknown) => {
        console.error('Failed to send message:', error);
      });
    }
  }, [send, stop, onSent]);

  /**
   * Handles changes to the input field
   * Updates the message state and manages typing indicators
   *
   * @param e - The input change event
   */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);
    messageRef.current = newValue;

    // Call keystroke on each keypress when there's content
    if (newValue.trim()) {
      keystroke().catch((error: unknown) => {
        console.warn('Keystroke failed:', error);
      });
    } else {
      // Stop typing indicator when all text is deleted
      stop().catch((error: unknown) => {
        console.warn('Stop typing failed:', error);
      });
    }
  };

  /**
   * Handles keyboard events in the input field
   * Sends the message when Enter is pressed (without Shift)
   *
   * @param e - The keyboard event
   */
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * Opens the emoji picker and positions it relative to the emoji button
   */
  const handleEmojiButtonClick = () => {
    // Position emoji picker above the emoji button
    const button = document.querySelector('[data-emoji-button]');
    if (button) {
      const rect = button.getBoundingClientRect();
      const pickerWidth = 200;
      const pickerHeight = 200;

      // Position above the button
      const left = Math.max(10, rect.left - pickerWidth / 2 + rect.width / 2);
      const top = rect.top - pickerHeight - 10;

      setEmojiPickerPosition({ top, left });
      setShowEmojiPicker(true);
    }
  };

  /**
   * Handles emoji selection from the emoji picker
   * Inserts the emoji at the current cursor position
   *
   * @param emoji - The selected emoji character
   */
  const handleEmojiSelect = (emoji: string) => {
    // Insert emoji at current cursor position or at the end
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const newMessage = message.slice(0, start) + emoji + message.slice(end);
      setMessage(newMessage);
      messageRef.current = newMessage; // Keep ref in sync

      // Trigger keystroke for emoji insertion
      keystroke().catch((error: unknown) => {
        console.warn('Keystroke failed:', error);
      });

      // Focus back on input and set cursor position after emoji
      setTimeout(() => {
        input.focus();
        const newCursorPosition = start + emoji.length;
        input.setSelectionRange(newCursorPosition, newCursorPosition);
      }, 0);
    } else {
      // Fallback: append to end
      const newMessage = message + emoji;
      setMessage(newMessage);
      messageRef.current = newMessage; // Keep ref in sync
      keystroke().catch((error: unknown) => {
        console.warn('Keystroke failed:', error);
      });
    }

    setShowEmojiPicker(false);
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900" role="form" aria-label="Message input">
      <div className="border border-gray-300 dark:border-gray-600 rounded-2xl p-2">
        <div className="flex items-end gap-3">
          {/* Text Input */}
          <TextInput
            ref={inputRef as React.Ref<HTMLTextAreaElement>}
            variant="message"
            multiline={true}
            maxHeight="150px"
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            className="flex-1"
            aria-label="Message text"
          />

          {/* Emoji Button */}
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 self-end mb-1"
            onClick={handleEmojiButtonClick}
            data-emoji-button
            aria-label="Open emoji picker"
            aria-haspopup="dialog"
            aria-expanded={showEmojiPicker}
          >
            <Icon name="emoji" size="md" aria-hidden={true} />
          </Button>
        </div>
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <EmojiPicker
          onClose={() => {
            setShowEmojiPicker(false);
          }}
          onEmojiSelect={handleEmojiSelect}
          position={emojiPickerPosition}
        />
      )}
    </div>
  );
};
