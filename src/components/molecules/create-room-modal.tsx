import React, { useCallback, useEffect, useState } from 'react';

import { Button } from '../atoms/button.tsx';
import { Icon } from '../atoms/icon.tsx';
import { TextInput } from '../atoms/text-input.tsx';

/**
 * Props for the CreateRoomModal component
 */
export interface CreateRoomModalProps {
  /**
   * Whether the modal is currently open and visible.
   * Controls the modal's visibility state and enables keyboard event handling.
   */
  isOpen: boolean;

  /**
   * Callback function triggered when the modal should be closed.
   * Called on backdrop click, escape key press, cancel button click, or successful room creation.
   * Should update the parent component's state to hide the modal.
   */
  onClose: () => void;

  /**
   * Callback function triggered when a new room should be created.
   * Receives the room name as a parameter.
   * The modal will automatically close after this callback is executed.
   *
   * @param roomName - The name of the room to be created.
   *
   * @example
   * ```tsx
   * const handleCreateRoom = async (roomName: string) => {
   *   try {
   *     await chatService.createRoom(roomName);
   *     // Room created successfully, modal will close automatically
   *   } catch (error) {
   *     // Handle error - modal stays open for retry
   *     console.error('Failed to create room:', error);
   *   }
   * };
   * ```
   */
  onCreateRoom: (roomName: string) => void;
}

/**
 * Modal component for creating a new chat room
 *
 * Features:
 * - Form validation with real-time feedback
 * - Escape key handling to close modal
 * - Backdrop click to close
 * - Auto-focus on room name input
 * - Disabled submit when input is empty/whitespace
 * - Automatic input cleanup on close
 * - Accessible ARIA attributes for screen readers
 * - Support for light/dark theming
 *
 * @example
 * // Basic usage
 * <CreateRoomModal
 *   isOpen={showCreateModal}
 *   onClose={() => setShowCreateModal(false)}
 *   onCreateRoom={handleCreateRoom}
 * />
 *
 * @example
 * // With state management
 * const [isCreating, setIsCreating] = useState(false);
 * const [showModal, setShowModal] = useState(false);
 *
 * const handleCreateRoom = async (roomName: string) => {
 *   setIsCreating(true);
 *   try {
 *     await chatService.createRoom(roomName);
 *     setShowModal(false);
 *     // Navigate to new room or refresh room list
 *   } catch (error) {
 *     console.error('Failed to create room:', error);
 *   } finally {
 *     setIsCreating(false);
 *   }
 * };
 *
 * <CreateRoomModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   onCreateRoom={handleCreateRoom}
 * />
 */
export const CreateRoomModal = ({ isOpen, onClose, onCreateRoom }: CreateRoomModalProps) => {
  const [roomName, setRoomName] = useState('');

  /**
   * Handles closing the modal and resetting form state.
   *
   * Clears the room name input field and triggers the onClose callback
   * to notify the parent component that the modal should be hidden.
   *
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

  if (!isOpen) return;

  /**
   * Handles form submission when creating a new room
   * Validates the room name, calls the onCreateRoom callback, and closes the modal
   *
   * @param e - The form submission event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    onCreateRoom(roomName.trim());
    setRoomName('');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="ably-create-room-modal__backdrop" onClick={handleClose}>
        {/* Modal */}
        <div
          className="ably-create-room-modal"
          onClick={(e) => {
            e.stopPropagation();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="ably-create-room-modal__header">
            <h2 id="modal-title" className="ably-create-room-modal__title">
              Create New Room
            </h2>
            <button
              onClick={handleClose}
              className="ably-create-room-modal__close"
              aria-label="Close modal"
            >
              <Icon name="close" size="md" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="ably-create-room-modal__content">
            <div className="ably-create-room-modal__field">
              <label className="ably-create-room-modal__label">Room Name</label>
              <TextInput
                value={roomName}
                onChange={(e) => {
                  setRoomName(e.target.value);
                }}
                placeholder="Enter room name..."
                className="w-full"
                autoFocus
                aria-label="Room name"
                aria-required="true"
              />
            </div>

            {/* Actions */}
            <div className="ably-create-room-modal__actions">
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
