import { usePresenceListener } from '@ably/chat/react';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { PresenceIndicators } from '../../../components/molecules/presence-indicators.tsx';

// Mock the usePresenceListener hook
vi.mock('@ably/chat/react', () => ({
  usePresenceListener: vi.fn(),
}));


describe('PresenceIndicators', () => {
  it('shows "0 people present" when no one is present', () => {
    (usePresenceListener as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      presenceData: [],
    });

    render(<PresenceIndicators />);
    
    const indicator = screen.getByRole('status');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveTextContent('0 people present');
    expect(indicator).toHaveClass('text-gray-500');
  });

  it('shows "1 person present" with singular text', () => {
    (usePresenceListener as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      presenceData: [{ clientId: 'user1' }],
    });

    render(<PresenceIndicators />);
    
    const indicator = screen.getByRole('status');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveTextContent('1 person present');
    expect(indicator).toHaveClass('text-green-500');
  });

  it('shows plural text for multiple people', () => {
    (usePresenceListener as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      presenceData: [
        { clientId: 'user1' },
        { clientId: 'user2' },
        { clientId: 'user3' },
      ],
    });

    render(<PresenceIndicators />);
    
    const indicator = screen.getByRole('status');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveTextContent('3 people present');
    expect(indicator).toHaveClass('text-green-500');
  });

  it('deduplicates participants by clientId', () => {
    (usePresenceListener as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      presenceData: [
        { clientId: 'user1' },
        { clientId: 'user1' }, // Duplicate
        { clientId: 'user2' },
      ],
    });

    render(<PresenceIndicators />);
    
    const indicator = screen.getByRole('status');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveTextContent('2 people present');
  });

  it('applies custom className when provided', () => {
    (usePresenceListener as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      presenceData: [{ clientId: 'user1' }],
    });

    render(<PresenceIndicators className="custom-class" />);
    
    const indicator = screen.getByRole('status');
    expect(indicator).toHaveClass('custom-class');
  });

  it('has correct accessibility attributes', () => {
    (usePresenceListener as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      presenceData: [],
    });

    render(<PresenceIndicators />);
    
    const indicator = screen.getByRole('status');
    expect(indicator).toHaveAttribute('aria-live', 'polite');
  });
});
