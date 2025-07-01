import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect,it } from 'vitest';

import { ChatWindowFooter } from '../../../components/molecules/chat-window-footer.tsx';

describe('ChatWindowFooter', () => {
  it('renders children correctly', () => {
    render(
      <ChatWindowFooter>
        <div data-testid="test-child">Test Content</div>
      </ChatWindowFooter>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders without children', () => {
    render(<ChatWindowFooter />);
    
    // The component should render even without children
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <ChatWindowFooter className="custom-class">
        <div>Content</div>
      </ChatWindowFooter>
    );

    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('custom-class');
    
    // Should also have the default classes
    expect(footer).toHaveClass('flex');
    expect(footer).toHaveClass('items-center');
    expect(footer).toHaveClass('bg-white');
    expect(footer).toHaveClass('dark:bg-gray-900');
    expect(footer).toHaveClass('border-t');
    expect(footer).toHaveClass('border-gray-200');
    expect(footer).toHaveClass('dark:border-gray-700');
  });

  it('uses default aria-label when not provided', () => {
    render(<ChatWindowFooter />);
    
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveAttribute('aria-label', 'Chat window footer');
  });

  it('uses custom aria-label when provided', () => {
    render(<ChatWindowFooter aria-label="Custom footer label" />);
    
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveAttribute('aria-label', 'Custom footer label');
  });

  it('has correct role attribute', () => {
    render(<ChatWindowFooter />);
    
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('renders complex children correctly', () => {
    render(
      <ChatWindowFooter>
        <button data-testid="test-button">Click Me</button>
        <input data-testid="test-input" placeholder="Type here" />
        <div data-testid="test-div">
          <span>Nested Content</span>
        </div>
      </ChatWindowFooter>
    );

    expect(screen.getByTestId('test-button')).toBeInTheDocument();
    expect(screen.getByTestId('test-input')).toBeInTheDocument();
    expect(screen.getByTestId('test-div')).toBeInTheDocument();
    expect(screen.getByText('Click Me')).toBeInTheDocument();
    expect(screen.getByText('Nested Content')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument();
  });
});
