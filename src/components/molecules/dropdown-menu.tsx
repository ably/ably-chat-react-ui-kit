import React, { useEffect, useRef, useState } from 'react';

/**
 * Interface for dropdown menu items
 */
export interface DropdownMenuItem {
  /**
   * Unique identifier for the menu item.
   * Used as the React key and for accessibility purposes.
   */
  id: string;

  /**
   * Display text for the menu item.
   * Should be descriptive and action-oriented (e.g., "Edit Message", "Delete").
   */
  label: string;

  /**
   * Optional icon to display before the label.
   * Can be an emoji, Unicode character, or React component.
   * Will be rendered with gray color styling.
   */
  icon?: string;

  /**
   * Callback function triggered when the menu item is clicked.
   * The dropdown will automatically close after this function is called.
   *
   * @remarks
   * This function should handle the specific action for the menu item.
   * Any async operations should be handled within this callback.
   */
  onClick: () => void;
}

/**
 * Props for the DropdownMenu component
 */
export interface DropdownMenuProps {
  /**
   * React node that will trigger the dropdown when clicked.
   * Can be any clickable element like buttons, icons, text, or custom components.
   * Will automatically receive click and keyboard event handlers.
   *
   * @example
   * ```tsx
   * // Button trigger
   * trigger={<Button>Options</Button>}
   *
   * // Icon trigger
   * trigger={<Icon name="more-vertical" />}
   *
   * // Custom trigger
   * trigger={<div className="cursor-pointer">⋮</div>}
   * ```
   */
  trigger: React.ReactNode;

  /**
   * Array of menu items to display in the dropdown.
   * Items will be rendered in the order provided.
   * Each item must have a unique ID within the dropdown.
   */
  items: DropdownMenuItem[];

  /**
   * Horizontal alignment of the dropdown relative to the trigger element.
   * - `left`: Dropdown aligns to the left edge of the trigger
   * - `right`: Dropdown aligns to the right edge of the trigger
   *
   * @default "right"
   */
  align?: 'left' | 'right';
}

/**
 * DropdownMenu component displays a toggleable menu with customizable items
 *
 * Features:
 * - Custom trigger element (button, icon, etc.)
 * - Configurable alignment (left or right)
 * - Support for icons in menu items
 * - Automatically closes when clicking outside
 * - Accessible keyboard navigation
 * - Escape key support
 * - Focus management
 *
 * Behavior:
 * - Clicking outside the dropdown closes it automatically
 * - Clicking any menu item closes the dropdown after executing the onClick handler
 * - Dropdown is positioned absolutely relative to the trigger
 * - Uses z-index of 50 for the dropdown and 40 for the backdrop
 * - Supports both light and dark themes
 *
 *
 * @example
 * // Basic dropdown with button trigger
 * <DropdownMenu
 *   trigger={<Button variant="secondary">Options</Button>}
 *   items={[
 *     { id: 'edit', label: 'Edit', onClick: () => handleEdit() },
 *     { id: 'delete', label: 'Delete', onClick: () => handleDelete() },
 *   ]}
 * />
 *
 * @example
 * // Dropdown with icon trigger and icons in items
 * <DropdownMenu
 *   trigger={<Icon name="more" />}
 *   align="left"
 *   items={[
 *     {
 *       id: 'share',
 *       label: 'Share',
 *       icon: '🔗',
 *       onClick: () => handleShare()
 *     },
 *     {
 *       id: 'copy',
 *       label: 'Copy Link',
 *       icon: '📋',
 *       onClick: () => handleCopy()
 *     },
 *     {
 *       id: 'report',
 *       label: 'Report',
 *       icon: '⚠️',
 *       onClick: () => handleReport()
 *     },
 *   ]}
 * />
 *
 * @example
 * // User profile dropdown
 * <DropdownMenu
 *   trigger={
 *     <div className="flex items-center gap-2 cursor-pointer">
 *       <Avatar src={user.avatar} />
 *       <span>{user.name}</span>
 *     </div>
 *   }
 *   align="right"
 *   items={[
 *     { id: 'profile', label: 'Profile', onClick: () => navigate('/profile') },
 *     { id: 'settings', label: 'Settings', onClick: () => navigate('/settings') },
 *     { id: 'logout', label: 'Sign Out', onClick: () => handleLogout() },
 *   ]}
 * />
 */
export const DropdownMenu = ({ trigger, items, align = 'right' }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  const handleItemClick = (item: DropdownMenuItem) => {
    item.onClick();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        role="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls="dropdown-menu"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        {trigger}
      </div>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false);
            }}
            aria-hidden="true"
          />

          {/* Dropdown Menu */}
          <div
            id="dropdown-menu"
            role="menu"
            aria-orientation="vertical"
            className={`absolute top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
          >
            <div className="py-1">
              {items.map((item) => (
                <button
                  key={item.id}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                  onClick={() => {
                    handleItemClick(item);
                  }}
                  role="menuitem"
                  tabIndex={-1}
                >
                  {item.icon && (
                    <span className="text-gray-500 dark:text-gray-400" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
