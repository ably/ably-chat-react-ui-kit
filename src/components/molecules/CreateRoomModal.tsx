import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '../atoms';
import { TextInput } from '../atoms';
import { Icon } from '../atoms';

/**
 * Props for the CreateRoomModal component
 */
export interface CreateRoomModalProps {
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Callback function when the modal is closed */
  onClose: () => void;
  /** Callback function when a new room is created, receives the room name */
  onCreateRoom: (roomName: string) => void;
}

/**
 * Modal component for creating a new chat room
 *
 * Displays a form with a text input for the room name and buttons to create or cancel
 */
export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onCreateRoom,
}) => {
  const [roomName, setRoomName] = useState('');

  /**
   * Handles closing the modal
   * Resets the room name input and calls the onClose callback
   */
  const handleClose = useCallback(() => {
    setRoomName('');
    onClose();
  }, [onClose]);

  // Handle escape key press to close the modal
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [handleClose, isOpen]);

  if (!isOpen) return null;

  /**
   * Handles form submission when creating a new room
   * Validates the room name, calls the onCreateRoom callback, and closes the modal
   *
   * @param e - The form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    onCreateRoom(roomName.trim());
    setRoomName('');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* Modal */}
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Create New Room
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Close modal"
            >
              <Icon name="close" size="md" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Room Name
              </label>
              <TextInput
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name..."
                className="w-full"
                autoFocus
                aria-label="Room name"
                aria-required="true"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={!roomName.trim()}>
                Create Room
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
