import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect,it } from 'vitest';

import { ChatWindowHeader } from '../../../components/molecules/chat-window-header.tsx';

describe('ChatWindowHeader', () => {
  it('renders children correctly', () => {
    render(
      <ChatWindowHeader>
        <div data-testid="test-child">Test Content</div>
      </ChatWindowHeader>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders without children', () => {
    render(<ChatWindowHeader />);
    
    // The component should render even without children
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <ChatWindowHeader className="custom-class">
        <div>Content</div>
      </ChatWindowHeader>
    );

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('custom-class');
    
    // Should also have the default classes
    expect(header).toHaveClass('px-6');
    expect(header).toHaveClass('py-4');
    expect(header).toHaveClass('border-b');
    expect(header).toHaveClass('border-gray-200');
    expect(header).toHaveClass('dark:border-gray-700');
    expect(header).toHaveClass('bg-white');
    expect(header).toHaveClass('dark:bg-gray-900');
  });

  it('uses default aria-label when not provided', () => {
    render(<ChatWindowHeader />);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveAttribute('aria-label', 'Chat window header');
  });

  it('uses custom aria-label when provided', () => {
    render(<ChatWindowHeader aria-label="Custom header label" />);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveAttribute('aria-label', 'Custom header label');
  });

  it('has correct role attribute', () => {
    render(<ChatWindowHeader />);
    
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  it('renders complex children correctly', () => {
    render(
      <ChatWindowHeader>
        <h2 data-testid="header-title">Room Title</h2>
        <div data-testid="header-info">
          <span>5 participants</span>
          <button>Settings</button>
        </div>
      </ChatWindowHeader>
    );

    expect(screen.getByTestId('header-title')).toBeInTheDocument();
    expect(screen.getByTestId('header-info')).toBeInTheDocument();
    expect(screen.getByText('Room Title')).toBeInTheDocument();
    expect(screen.getByText('5 participants')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('handles empty className gracefully', () => {
    render(<ChatWindowHeader className="" />);
    
    const header = screen.getByRole('banner');
    // Should still have the default classes
    expect(header).toHaveClass('px-6');
    expect(header).toHaveClass('py-4');
  });
});