import { fireEvent,render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ButtonProps } from '../../../components/atoms/button.tsx';
import { ConfirmDialog } from '../../../components/molecules/confirm-dialog.tsx';

// Mocks the Icon component
vi.mock('../../../components/atoms/icon', () => ({
  Icon: ({ name, size }: { name: string; size?: string }) => (
    <div data-testid={`icon-${name}`} data-size={size}>
      {name} icon
    </div>
  ),
}));

// Mocks the Button component
vi.mock('../../../components/atoms/button', () => ({
  Button: ({ children, variant, ...props }:ButtonProps) => (
    <button data-testid="button" data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));


describe('ConfirmDialog', () => {
  it('renders nothing when isOpen is false', () => {
    render(
      <ConfirmDialog
        isOpen={false}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Test Dialog"
        message="This is a test message"
      />
    );

    // The dialog should not be in the document
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders correctly when isOpen is true', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Test Dialog"
        message="This is a test message"
      />
    );

    // The dialog should be in the document
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    expect(screen.getByText('This is a test message')).toBeInTheDocument();

    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', () => {
    const handleClose = vi.fn();
    
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={handleClose}
        onConfirm={() => {}}
        title="Test Dialog"
        message="This is a test message"
      />
    );

    // Click the backdrop (the first div with fixed positioning)
    const backdrop = screen.getByRole('dialog').parentElement;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    fireEvent.click(backdrop!);
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={handleClose}
        onConfirm={() => {}}
        title="Test Dialog"
        message="This is a test message"
      />
    );

    // Click the close button
    const closeButton = screen.getByLabelText('Close dialog');
    fireEvent.click(closeButton);
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', () => {
    const handleClose = vi.fn();
    
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={handleClose}
        onConfirm={() => {}}
        title="Test Dialog"
        message="This is a test message"
      />
    );

    // Click the cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm and onClose when confirm button is clicked', () => {
    const handleClose = vi.fn();
    const handleConfirm = vi.fn();
    
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="Test Dialog"
        message="This is a test message"
      />
    );

    // Click the confirm button
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    
    expect(handleConfirm).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('uses custom button text when provided', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Test Dialog"
        message="This is a test message"
        confirmText="Yes, Delete"
        cancelText="No, Keep"
      />
    );
    
    expect(screen.getByText('Yes, Delete')).toBeInTheDocument();
    expect(screen.getByText('No, Keep')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Test Dialog"
        message="This is a test message"
        icon={<div data-testid="custom-icon">Warning</div>}
      />
    );
    
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('uses the specified confirm button variant', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Test Dialog"
        message="This is a test message"
        confirmVariant="primary"
      />
    );

    // Find the confirm button and check its variant
    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton).toBeInTheDocument();
    expect(confirmButton).toHaveAttribute('data-variant', 'primary');
  });

  it('handles escape key press', () => {
    const handleClose = vi.fn();
    
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={handleClose}
        onConfirm={() => {}}
        title="Test Dialog"
        message="This is a test message"
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('prevents event propagation when clicking the dialog', () => {
    const handleClose = vi.fn();
    
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={handleClose}
        onConfirm={() => {}}
        title="Test Dialog"
        message="This is a test message"
      />
    );

    // Click the dialog itself (not the backdrop)
    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    
    // onClose should not be called when clicking the dialog itself
    expect(handleClose).not.toHaveBeenCalled();
  });
});
