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
      <div className="ably-confirm-dialog__backdrop" onClick={onClose}>
        {/* Dialog */}
        <div
          className="ably-confirm-dialog__container"
          onClick={(e) => {
            e.stopPropagation();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-message"
        >
          {/* Header */}
          <div className="ably-confirm-dialog__header">
            <div className="ably-confirm-dialog__header-content">
              {icon && (
                <div className="ably-confirm-dialog__icon" aria-hidden="true">
                  {icon}
                </div>
              )}
              <h2 id="confirm-dialog-title" className="ably-confirm-dialog__title">
                {title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="ably-confirm-dialog__close"
              aria-label="Close dialog"
            >
              <Icon name="close" size="md" />
            </button>
          </div>

          {/* Content */}
          <div className="ably-confirm-dialog__content">
            <p id="confirm-dialog-message" className="ably-confirm-dialog__message">
              {message}
            </p>

            {/* Actions */}
            <div className="ably-confirm-dialog__actions">
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
