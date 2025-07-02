import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DropdownMenu } from '../../../components/molecules/dropdown-menu.tsx';

describe('DropdownMenu', () => {
  const mockItems = [
    { id: 'edit', label: 'Edit', onClick: vi.fn() },
    { id: 'delete', label: 'Delete', onClick: vi.fn() },
    { id: 'share', label: 'Share', icon: '🔗', onClick: vi.fn() },
  ];

  beforeEach(() => {
    for (const item of mockItems) {
      item.onClick.mockReset();
    }
  });

  it('renders the trigger element', () => {
    render(
      <DropdownMenu
        trigger={<button data-testid="trigger-button">Options</button>}
        items={mockItems}
      />
    );

    expect(screen.getByTestId('trigger-button')).toBeInTheDocument();
    expect(screen.getByText('Options')).toBeInTheDocument();
  });

  it('does not show dropdown menu initially', () => {
    render(<DropdownMenu trigger={<button>Options</button>} items={mockItems} />);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('shows dropdown menu when trigger is clicked', () => {
    render(
      <DropdownMenu
        trigger={<button data-testid="trigger-button">Options</button>}
        items={mockItems}
      />
    );

    // Click the trigger button
    fireEvent.click(screen.getByTestId('trigger-button'));

    // The dropdown menu should now be visible
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('renders all menu items correctly', () => {
    render(
      <DropdownMenu
        trigger={<button data-testid="trigger-button">Options</button>}
        items={mockItems}
      />
    );

    // Click the trigger button to show the dropdown
    fireEvent.click(screen.getByTestId('trigger-button'));

    // Check that all menu items are rendered
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  it('renders item icons when provided', () => {
    render(
      <DropdownMenu
        trigger={<button data-testid="trigger-button">Options</button>}
        items={mockItems}
      />
    );

    // Click the trigger button to show the dropdown
    fireEvent.click(screen.getByTestId('trigger-button'));

    // Check that the icon is rendered
    expect(screen.getByText('🔗')).toBeInTheDocument();
  });

  it('calls item onClick when menu item is clicked', () => {
    render(
      <DropdownMenu
        trigger={<button data-testid="trigger-button">Options</button>}
        items={mockItems}
      />
    );

    // Click the trigger button to show the dropdown
    fireEvent.click(screen.getByTestId('trigger-button'));

    // Click the Edit menu item
    fireEvent.click(screen.getByText('Edit'));

    // Check that the onClick handler was called
    expect(mockItems[0]?.onClick).toHaveBeenCalledTimes(1);
  });

  it('closes dropdown after menu item is clicked', () => {
    render(
      <DropdownMenu
        trigger={<button data-testid="trigger-button">Options</button>}
        items={mockItems}
      />
    );

    // Click the trigger button to show the dropdown
    fireEvent.click(screen.getByTestId('trigger-button'));

    // Click the Edit menu item
    fireEvent.click(screen.getByText('Edit'));

    // The dropdown menu should now be hidden
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', () => {
    render(
      <DropdownMenu
        trigger={<button data-testid="trigger-button">Options</button>}
        items={mockItems}
      />
    );

    // Click the trigger button to show the dropdown
    fireEvent.click(screen.getByTestId('trigger-button'));

    // Click outside the dropdown (the document body)
    fireEvent.mouseDown(document.body);

    // The dropdown menu should now be hidden
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes dropdown when escape key is pressed', () => {
    render(
      <DropdownMenu
        trigger={<button data-testid="trigger-button">Options</button>}
        items={mockItems}
      />
    );

    // Click the trigger button to show the dropdown
    fireEvent.click(screen.getByTestId('trigger-button'));

    // Press the Escape key
    fireEvent.keyDown(document, { key: 'Escape' });

    // The dropdown menu should now be hidden
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('toggles dropdown when trigger is clicked multiple times', () => {
    render(
      <DropdownMenu
        trigger={<button data-testid="trigger-button">Options</button>}
        items={mockItems}
      />
    );

    // Click the trigger button to show the dropdown
    fireEvent.click(screen.getByTestId('trigger-button'));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    // Click the trigger button again to hide the dropdown
    fireEvent.click(screen.getByTestId('trigger-button'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    // Click the trigger button a third time to show the dropdown again
    fireEvent.click(screen.getByTestId('trigger-button'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('supports keyboard navigation with Enter key', () => {
    render(
      <DropdownMenu
        trigger={<button data-testid="trigger-button">Options</button>}
        items={mockItems}
      />
    );

    // Focus the trigger button
    const triggerButton = screen.getByTestId('trigger-button');
    triggerButton.focus();

    // Press Enter key to open the dropdown
    fireEvent.keyDown(triggerButton, { key: 'Enter' });
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('supports keyboard navigation with Space key', () => {
    render(
      <DropdownMenu
        trigger={<button data-testid="trigger-button">Options</button>}
        items={mockItems}
      />
    );

    // Focus the trigger button
    const triggerButton = screen.getByTestId('trigger-button');
    triggerButton.focus();

    // Press Space key to open the dropdown
    fireEvent.keyDown(triggerButton, { key: ' ' });
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('aligns dropdown to the right by default', () => {
    render(
      <DropdownMenu
        trigger={<button data-testid="trigger-button">Options</button>}
        items={mockItems}
      />
    );

    // Click the trigger button to show the dropdown
    fireEvent.click(screen.getByTestId('trigger-button'));

    // Check that the dropdown has the right alignment class
    const dropdown = screen.getByRole('menu');
    expect(dropdown).toHaveClass('right-0');
    expect(dropdown).not.toHaveClass('left-0');
  });

  it('aligns dropdown to the left when specified', () => {
    render(
      <DropdownMenu
        trigger={<button data-testid="trigger-button">Options</button>}
        items={mockItems}
        align="left"
      />
    );

    // Click the trigger button to show the dropdown
    fireEvent.click(screen.getByTestId('trigger-button'));

    // Check that the dropdown has the left alignment class
    const dropdown = screen.getByRole('menu');
    expect(dropdown).toHaveClass('left-0');
    expect(dropdown).not.toHaveClass('right-0');
  });

  it('has correct accessibility attributes', () => {
    render(
      <DropdownMenu
        trigger={<button data-testid="trigger-button">Options</button>}
        items={mockItems}
      />
    );

    // Check trigger accessibility attributes
    const trigger = screen.getByTestId('trigger-button').parentElement;
    expect(trigger).toHaveAttribute('role', 'button');
    expect(trigger).toHaveAttribute('aria-haspopup', 'true');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('tabIndex', '0');

    // Click the trigger button to show the dropdown
    fireEvent.click(screen.getByTestId('trigger-button'));
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    const dropdown = screen.getByRole('menu');
    expect(dropdown).toHaveAttribute('aria-orientation', 'vertical');

    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems).toHaveLength(3);
    for (const item of menuItems) {
      expect(item).toHaveAttribute('tabIndex', '-1');
    }
  });
});
