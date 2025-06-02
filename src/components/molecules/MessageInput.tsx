import React, { useState, useRef, useCallback } from 'react';
import { useTyping } from '@ably/chat/react';
import Icon from '../atoms/Icon';
import TextInput from '../atoms/TextInput';
import Button from '../atoms/Button';
import EmojiPicker from './EmojiPicker';
import EmojiBurst from './EmojiBurst';

interface MessageInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  placeholder = 'Type a message...',
}) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showEmojiBurst, setShowEmojiBurst] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState({ top: 0, left: 0 });
  const [emojiBurstPosition, setEmojiBurstPosition] = useState({ x: 0, y: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const thumbsUpButtonRef = useRef<HTMLButtonElement>(null);

  // Use typing hook with keystroke and stop methods
  const { keystroke, stop } = useTyping();

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
      // Stop typing indicator when message is sent
      stop();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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

  const handleThumbsUpClick = useCallback(() => {
    const button = thumbsUpButtonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      setEmojiBurstPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
      setShowEmojiBurst(true);
    }
  }, []);

  const handleEmojiBurstComplete = useCallback(() => {
    setShowEmojiBurst(false);
  }, []);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3">
        {/* Attachment Button */}
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Icon name="attachment" size="md" />
        </Button>

        {/* Text Input */}
        <TextInput
          ref={inputRef}
          variant="message"
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1"
        />

        {/* Emoji Button */}
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={handleEmojiButtonClick}
          data-emoji-button
        >
          <Icon name="emoji" size="md" />
        </Button>

        {/* Thumbs Up Button */}
        <button
          ref={thumbsUpButtonRef}
          className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded-md text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          onClick={handleThumbsUpClick}
        >
          <Icon name="thumbsup" size="md" />
        </button>
      </div>

      {/* Emoji Picker */}
      <EmojiPicker
        isOpen={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onEmojiSelect={handleEmojiSelect}
        position={emojiPickerPosition}
      />

      {/* Emoji Burst */}
      <EmojiBurst
        isActive={showEmojiBurst}
        position={emojiBurstPosition}
        onComplete={handleEmojiBurstComplete}
      />
    </div>
  );
};

export default MessageInput;
