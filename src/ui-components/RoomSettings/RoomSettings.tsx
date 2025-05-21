import { useState } from 'react';
import { useRoom } from '@ably/chat/react';
import React from 'react';
import { MessageReactionType } from '@ably/chat';
import { useReactionType } from '../../hooks';

interface RoomSettingsProps {
  className?: string;
  onClose?: () => void;
}

export function RoomSettings({ className = '', onClose }: RoomSettingsProps) {
  const { roomId } = useRoom();
  const [enableTypingIndicator, setEnableTypingIndicator] = useState(true);
  const [enableReactions, setEnableReactions] = useState(true);
  const { type, setType } = useReactionType();

  // Save settings to local storage
  const handleSaveSettings = () => {
    console.debug('Saving settings:', {
      roomId,
      enableTypingIndicator,
      enableReactions,
      reactionType: type,
    });
    localStorage.setItem(`chat-${roomId}-settings`, JSON.stringify(enableTypingIndicator));
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={`card ${className}`}>
      <div className="header">
        <h2 className="header-title">Room Settings</h2>
        {onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="typing-indicator" className="form-label">
            Enable Typing Indicator
          </label>
          <input
            id="typing-indicator"
            type="checkbox"
            checked={enableTypingIndicator}
            onChange={(e) => setEnableTypingIndicator(e.target.checked)}
            className="form-checkbox"
          />
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="reactions" className="form-label">
            Enable Reactions
          </label>
          <input
            id="reactions"
            type="checkbox"
            checked={enableReactions}
            onChange={(e) => setEnableReactions(e.target.checked)}
            className="form-checkbox"
          />
        </div>

        {enableReactions && (
          <div className="mt-4">
            <p className="form-label mb-2">Message Reaction Type</p>
            <div className="form-radio-group">
              <div className="form-radio-item">
                <input
                  id="reaction-type-unique"
                  type="radio"
                  name="reaction-type"
                  value={MessageReactionType.Unique}
                  checked={type === MessageReactionType.Unique}
                  onChange={(e) => setType(e.target.value as MessageReactionType)}
                  className="form-radio"
                />
                <label htmlFor="reaction-type-unique" className="form-radio-label">
                  Unique
                </label>
              </div>
              <div className="form-radio-item">
                <input
                  id="reaction-type-distinct"
                  type="radio"
                  name="reaction-type"
                  value={MessageReactionType.Distinct}
                  checked={type === MessageReactionType.Distinct}
                  onChange={(e) => setType(e.target.value as MessageReactionType)}
                  className="form-radio"
                />
                <label htmlFor="reaction-type-distinct" className="form-radio-label">
                  Distinct
                </label>
              </div>
              <div className="form-radio-item">
                <input
                  id="reaction-type-multiple"
                  type="radio"
                  name="reaction-type"
                  value={MessageReactionType.Multiple}
                  checked={type === MessageReactionType.Multiple}
                  onChange={(e) => setType(e.target.value as MessageReactionType)}
                  className="form-radio"
                />
                <label htmlFor="reaction-type-multiple" className="form-radio-label">
                  Multiple
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <button onClick={handleSaveSettings} className="btn-save">
          Save Settings
        </button>
      </div>
    </div>
  );
}
