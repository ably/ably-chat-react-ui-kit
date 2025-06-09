import React, { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { useTyping } from '@ably/chat/react';
import { Icon } from '../atoms/Icon';
import { TextInput } from '../atoms/TextInput';
import { Button } from '../atoms/Button';
import { EmojiPicker } from './EmojiPicker';

/**
 * Props for the MessageInput component
 */
export interface MessageInputProps {
  /** Callback function when a message is sent, receives the message text */
  onSend: (message: string) => void;
  /** Placeholder text for the input field */
  placeholder?: string;
}

/**
 * MessageInput component provides a text input for composing and sending messages
 *
 * Features:
 * - Text input with typing indicator integration
 * - Emoji picker for inserting emojis
 * - Quick thumbs-up button with animation
 * - Attachment button (currently non-functional)
 * - Enter key to send messages
 */
export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  placeholder = 'Type a message...',
}) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState({ top: 0, left: 0 });
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Use typing hook with keystroke and stop methods
  const { keystroke, stop } = useTyping();

  /**
   * Handles sending the message
   * Trims the message, calls the onSend callback, and resets the input
   */
  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
      // Stop typing indicator when message is sent
      stop();
    }
  };

  /**
   * Handles changes to the input field
   * Updates the message state and manages typing indicators
   *
   * @param e - The input change event
   */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);

    // Call keystroke on each keypress when there's content
    if (newValue.trim()) {
      keystroke();
    } else {
      // Stop typing indicator when all text is deleted
      stop();
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
    const button = document.querySelector('[data-emoji-button]') as HTMLElement;
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
      const start = input.selectionStart || message.length;
      const end = input.selectionEnd || message.length;
      const newMessage = message.slice(0, start) + emoji + message.slice(end);
      setMessage(newMessage);

      // Trigger keystroke for emoji insertion
      keystroke();

      // Focus back on input and set cursor position after emoji
      setTimeout(() => {
        input.focus();
        const newCursorPosition = start + emoji.length;
        input.setSelectionRange(newCursorPosition, newCursorPosition);
      }, 0);
    } else {
      // Fallback: append to end
      setMessage((prev) => prev + emoji);
      keystroke();
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
            onKeyPress={handleKeyPress}
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
      <EmojiPicker
        isOpen={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onEmojiSelect={handleEmojiSelect}
        position={emojiPickerPosition}
      />
    </div>
  );
};
