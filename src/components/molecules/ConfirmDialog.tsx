import React, { useEffect } from 'react';
import { Button } from '../atoms';
import { Icon } from '../atoms';

/**
 * Props for the ConfirmDialog component
 */
export interface ConfirmDialogProps {
  /** Whether the dialog is currently open */
  isOpen: boolean;
  /** Callback function when the dialog is closed */
  onClose: () => void;
  /** Callback function when the user confirms the action */
  onConfirm: () => void;
  /** Title of the dialog */
  title: string;
  /** Message content of the dialog */
  message: string;
  /** Text for the confirm button (default: "Confirm") */
  confirmText?: string;
  /** Text for the cancel button (default: "Cancel") */
  cancelText?: string;
  /** Variant of the confirm button (default: "danger") */
  confirmVariant?: 'primary' | 'secondary' | 'danger';
  /** Icon to display in the dialog header (optional) */
  icon?: React.ReactNode;
}

/**
 * ConfirmDialog component displays a modal confirmation dialog
 *
 * Features:
 * - Consistent modal styling with other components
 * - Support for light/dark theming
 * - Customizable buttons and text
 * - Escape key handling to close
 * - Backdrop click to close
 * - Proper accessibility attributes
 * - Focus management
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  icon,
}) => {
  // Handle escape key press to close the dialog
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Handle confirm action
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Dialog */}
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-message"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="flex-shrink-0 text-red-500 dark:text-red-400" aria-hidden="true">
                  {icon}
                </div>
              )}
              <h2
                id="confirm-dialog-title"
                className="text-xl font-semibold text-gray-900 dark:text-gray-100"
              >
                {title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Close dialog"
            >
              <Icon name="close" size="md" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p id="confirm-dialog-message" className="text-gray-700 dark:text-gray-300 mb-6">
              {message}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <Button variant="secondary" onClick={onClose}>
                {cancelText}
              </Button>
              <Button variant={confirmVariant} onClick={handleConfirm} autoFocus>
                {confirmText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
