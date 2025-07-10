import React, { useEffect } from 'react';

import { Button } from '../atoms/button.tsx';
import { Icon } from '../atoms/icon.tsx';

/**
 * Props for the ConfirmDialog component
 */
export interface ConfirmDialogProps {
  /**
   * Whether the dialog is currently open and visible to the user.
   * Controls the dialog's visibility state.
   */
  isOpen: boolean;

  /**
   * Callback function triggered when the dialog should be closed.
   * Called on backdrop click, escape key press, or cancel button click.
   */
  onClose: () => void;

  /**
   * Callback function triggered when the user confirms the action.
   * The dialog will automatically close after this callback is executed.
   */
  onConfirm: () => void;

  /**
   * Title displayed in the dialog header.
   * Should be concise and clearly indicate the action being confirmed.
   */
  title: string;

  /**
   * Main message content explaining the action and its consequences.
   * Can include warnings or additional context for the user.
   */
  message: string;

  /**
   * Custom text for the confirm button.
   * Should be action-oriented (e.g., "Delete", "Save", "Continue").
   * @default "Confirm"
   */
  confirmText?: string;

  /**
   * Custom text for the cancel button.
   * Should indicate the safe/default action.
   * @default "Cancel"
   */
  cancelText?: string;

  /**
   * Visual variant of the confirm button indicating action severity.
   * - `primary`: Standard confirmation (blue)
   * - `secondary`: Neutral action (gray)
   * - `danger`: Destructive action (red)
   * @default "danger"
   */
  confirmVariant?: 'primary' | 'secondary' | 'danger';

  /**
   * Optional icon to display in the dialog header.
   * Typically used for warning, error, or information icons.
   * Icon will be colored red for visual emphasis.
   */
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
 * - Basic accessibility attributes
 * - Focus management
 *
 * @example
 * // Basic deletion confirmation
 * <ConfirmDialog
 *   isOpen={showDeleteDialog}
 *   onClose={() => setShowDeleteDialog(false)}
 *   onConfirm={handleDeleteMessage}
 *   title="Delete Message"
 *   message="Are you sure you want to delete this message? This action cannot be undone."
 * />
 *
 * @example
 * // Custom styling with icon
 * <ConfirmDialog
 *   isOpen={showLogoutDialog}
 *   onClose={() => setShowLogoutDialog(false)}
 *   onConfirm={handleLogout}
 *   title="Sign Out"
 *   message="Are you sure you want to sign out of your account?"
 *   confirmText="Sign Out"
 *   cancelText="Stay Signed In"
 *   confirmVariant="primary"
 *   icon={<Icon name="logout" />}
 * />
 *
 * @example
 * // Warning dialog
 * <ConfirmDialog
 *   isOpen={showWarning}
 *   onClose={() => setShowWarning(false)}
 *   onConfirm={handleProceed}
 *   title="Unsaved Changes"
 *   message="You have unsaved changes. Are you sure you want to leave this page?"
 *   confirmText="Leave Page"
 *   cancelText="Stay Here"
 *   confirmVariant="danger"
 *   icon={<Icon name="warning" />}
 * />
 * @see {@link Button} - For button styling variants
 * @see {@link Icon} - For available icon options
 */
export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  icon,
}: ConfirmDialogProps) => {
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

  if (!isOpen) return;

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
          onClick={(e) => {
            e.stopPropagation();
          }}
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
