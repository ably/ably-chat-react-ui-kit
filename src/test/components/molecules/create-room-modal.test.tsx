import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ButtonProps } from '../../../components/atoms/button.tsx';
import { TextInputProps } from '../../../components/atoms/text-input.tsx';
import { CreateRoomModal } from '../../../components/molecules/create-room-modal.tsx';

// Mock the Icon component
vi.mock('../../../components/atoms/icon', () => ({
  Icon: ({ name, size }: { name: string; size?: string }) => (
    <div data-testid={`icon-${name}`} data-size={size}>
      {name} icon
    </div>
  ),
}));

// Mock the Button component
vi.mock('../../../components/atoms/button', () => ({
  Button: ({ children, onClick, type, variant, disabled, ...props }: ButtonProps) => (
    <button onClick={onClick} type={type} disabled={disabled} data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));

// Mock the TextInput component
vi.mock('../../../components/atoms/text-input', () => ({
  TextInput: ({
    value,
    onChange,
    placeholder,
    className,
    autoFocus,
    'aria-label': ariaLabel,
    'aria-required': ariaRequired,
  }: TextInputProps) => (
    <input
      data-testid="text-input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      autoFocus={autoFocus}
      aria-label={ariaLabel}
      aria-required={ariaRequired}
    />
  ),
}));

describe('CreateRoomModal', () => {
  it('renders nothing when isOpen is false', () => {
    render(<CreateRoomModal isOpen={false} onClose={() => {}} onCreateRoom={() => {}} />);

    // The modal should not be in the document
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders correctly when isOpen is true', () => {
    render(<CreateRoomModal isOpen={true} onClose={() => {}} onCreateRoom={() => {}} />);

    // The modal should be in the document
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Check title and form elements
    expect(screen.getByText('Create New Room')).toBeInTheDocument();
    expect(screen.getByText('Room Name')).toBeInTheDocument();
    expect(screen.getByTestId('text-input')).toBeInTheDocument();

    // Check buttons
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Create Room')).toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', () => {
    const handleClose = vi.fn();

    render(<CreateRoomModal isOpen={true} onClose={handleClose} onCreateRoom={() => {}} />);

    // Click the backdrop (the first div with fixed positioning)
    const backdrop = screen.getByRole('dialog').parentElement;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    fireEvent.click(backdrop!);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();

    render(<CreateRoomModal isOpen={true} onClose={handleClose} onCreateRoom={() => {}} />);

    // Click the close button
    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', () => {
    const handleClose = vi.fn();

    render(<CreateRoomModal isOpen={true} onClose={handleClose} onCreateRoom={() => {}} />);

    // Click the cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('updates room name when input changes', () => {
    render(<CreateRoomModal isOpen={true} onClose={() => {}} onCreateRoom={() => {}} />);

    // Get the input and change its value
    const input = screen.getByTestId('text-input');
    fireEvent.change(input, { target: { value: 'New Room Name' } });

    // Check that the input value has been updated
    expect(input).toHaveValue('New Room Name');
  });

  it('disables submit button when room name is empty', () => {
    render(<CreateRoomModal isOpen={true} onClose={() => {}} onCreateRoom={() => {}} />);

    // The submit button should be disabled initially (empty room name)
    const submitButton = screen.getByText('Create Room');
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when room name is not empty', () => {
    render(<CreateRoomModal isOpen={true} onClose={() => {}} onCreateRoom={() => {}} />);

    // Get the input and change its value
    const input = screen.getByTestId('text-input');
    fireEvent.change(input, { target: { value: 'New Room Name' } });

    // The submit button should be enabled now
    const submitButton = screen.getByText('Create Room');
    expect(submitButton).not.toBeDisabled();
  });

  it('calls onCreateRoom and onClose when form is submitted', () => {
    const handleClose = vi.fn();
    const handleCreateRoom = vi.fn();

    render(<CreateRoomModal isOpen={true} onClose={handleClose} onCreateRoom={handleCreateRoom} />);

    const input = screen.getByTestId('text-input');
    fireEvent.change(input, { target: { value: 'New Room Name' } });

    const form = screen.getByRole('dialog').querySelector('form');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    fireEvent.submit(form!);

    expect(handleCreateRoom).toHaveBeenCalledWith('New Room Name');

    // Check that onClose was called
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onCreateRoom and onClose when create button is clicked', () => {
    const handleClose = vi.fn();
    const handleCreateRoom = vi.fn();

    render(<CreateRoomModal isOpen={true} onClose={handleClose} onCreateRoom={handleCreateRoom} />);

    const input = screen.getByTestId('text-input');
    fireEvent.change(input, { target: { value: 'New Room Name' } });

    // Click the create button
    const createButton = screen.getByText('Create Room');
    fireEvent.click(createButton);

    expect(handleCreateRoom).toHaveBeenCalledWith('New Room Name');

    // Check that onClose was called
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('trims whitespace from room name', () => {
    const handleCreateRoom = vi.fn();

    render(<CreateRoomModal isOpen={true} onClose={() => {}} onCreateRoom={handleCreateRoom} />);

    // Get the input and change its value with whitespace
    const input = screen.getByTestId('text-input');
    fireEvent.change(input, { target: { value: '  New Room Name  ' } });

    const form = screen.getByRole('dialog').querySelector('form');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    fireEvent.submit(form!);

    // Check that onCreateRoom was called with the trimmed room name
    expect(handleCreateRoom).toHaveBeenCalledWith('New Room Name');
  });

  it('handles escape key press', () => {
    const handleClose = vi.fn();

    render(<CreateRoomModal isOpen={true} onClose={handleClose} onCreateRoom={() => {}} />);

    // Press the Escape key
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('prevents event propagation when clicking the modal', () => {
    const handleClose = vi.fn();

    render(<CreateRoomModal isOpen={true} onClose={handleClose} onCreateRoom={() => {}} />);

    // Click the modal itself (not the backdrop)
    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);

    // onClose should not be called when clicking the modal itself
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('can be closed and reopened', () => {
    const handleClose = vi.fn();

    const { rerender } = render(
      <CreateRoomModal isOpen={true} onClose={handleClose} onCreateRoom={() => {}} />
    );

    // Get the input and change its value
    const input = screen.getByTestId('text-input');
    fireEvent.change(input, { target: { value: 'New Room Name' } });

    // The submit button should be enabled after entering text
    const submitButton = screen.getByText('Create Room');
    expect(submitButton).not.toBeDisabled();

    // Close the modal
    rerender(<CreateRoomModal isOpen={false} onClose={handleClose} onCreateRoom={() => {}} />);

    // Modal should not be in the document when closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Reopen the modal
    rerender(<CreateRoomModal isOpen={true} onClose={handleClose} onCreateRoom={() => {}} />);

    // Modal should be in the document when reopened
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
