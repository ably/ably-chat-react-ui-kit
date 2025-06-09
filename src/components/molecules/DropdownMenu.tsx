import React, { useState, useRef, useEffect } from 'react';

/**
 * Interface for dropdown menu items
 */
export interface DropdownMenuItem {
  /** Unique identifier for the menu item */
  id: string;
  /** Display text for the menu item */
  label: string;
  /** Optional icon to display before the label */
  icon?: string;
  /** Callback function when the item is clicked */
  onClick: () => void;
}

/**
 * Props for the DropdownMenu component
 */
export interface DropdownMenuProps {
  /** React node that will trigger the dropdown when clicked */
  trigger: React.ReactNode;
  /** Array of menu items to display in the dropdown */
  items: DropdownMenuItem[];
  /** Horizontal alignment of the dropdown relative to the trigger */
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
 */
export const DropdownMenu: React.FC<DropdownMenuProps> = ({ trigger, items, align = 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (item: DropdownMenuItem) => {
    item.onClick();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
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
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} aria-hidden="true" />

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
                  onClick={() => handleItemClick(item)}
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
