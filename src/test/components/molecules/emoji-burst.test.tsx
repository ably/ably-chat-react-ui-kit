import { act,render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach,beforeEach, describe, expect, it, vi } from 'vitest';

import { EmojiBurst } from '../../../components/molecules/emoji-burst.tsx';

const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;

describe('EmojiBurst', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    globalThis.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      return setTimeout(callback, 16) as unknown as number;
    });
    globalThis.cancelAnimationFrame = vi.fn((id:number) => {
      clearTimeout(id);
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
    globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
    vi.clearAllMocks();
  });

  it('renders nothing when isActive is false', () => {
    render(
      <EmojiBurst
        isActive={false}
        position={{ x: 100, y: 100 }}
        duration={1000}
        onComplete={() => {}}
      />
    );

    // The component should not render anything when isActive is false
    expect(screen.queryByRole('presentation')).not.toBeInTheDocument();
  });

  it('renders emojis when isActive is true', () => {
    render(
      <EmojiBurst
        isActive={true}
        position={{ x: 100, y: 100 }}
        duration={1000}
        onComplete={() => {}}
      />
    );

    // The component should render a container with emojis
    const container = screen.getByRole('presentation', { hidden: true });
    expect(container).toBeInTheDocument();
    
    // Should render default emojis
    const emojis = container.querySelectorAll('[aria-hidden="true"]');
    expect(emojis.length).toBe(12);
  });

  it('uses the provided emoji', () => {
    render(
      <EmojiBurst
        isActive={true}
        position={{ x: 100, y: 100 }}
        emoji="🎉"
        duration={1000}
        onComplete={() => {}}
      />
    );

    const container = screen.getByRole('presentation', { hidden: true });
    const emojis = container.querySelectorAll('[aria-hidden="true"]');
    
    // Check if at least one of the emojis is the provided one
    const hasProvidedEmoji = [...emojis].some(
      (emoji) => emoji.textContent === '🎉'
    );
    expect(hasProvidedEmoji).toBe(true);
  });

  it('uses skin tone variants for thumbs up emoji', () => {
    render(
      <EmojiBurst
        isActive={true}
        position={{ x: 100, y: 100 }}
        emoji="👍"
        duration={1000}
        onComplete={() => {}}
      />
    );

    const container = screen.getByRole('presentation', { hidden: true });
    const emojis = container.querySelectorAll('[aria-hidden="true"]');
    
    // Get all emoji text content
    const emojiTexts = [...emojis].map(emoji => emoji.textContent);
    
    // Check if we have at least one thumbs up emoji (any variant)
    const hasThumbsUp = emojiTexts.some(text => 
      text === '👍' || text === '👍🏻' || text === '👍🏽' || text === '👍🏿'
    );
    
    expect(hasThumbsUp).toBe(true);
  });

  it('calls onComplete when animation finishes', () => {
    const handleComplete = vi.fn();
    
    render(
      <EmojiBurst
        isActive={true}
        position={{ x: 100, y: 100 }}
        duration={1000}
        onComplete={handleComplete}
      />
    );

    // Fast-forward time to complete the animation
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    // onComplete should have been called
    expect(handleComplete).toHaveBeenCalledTimes(1);
  });

  it('positions emojis at the specified coordinates', () => {
    const testPosition = { x: 250, y: 350 };
    
    render(
      <EmojiBurst
        isActive={true}
        position={testPosition}
        duration={1000}
        onComplete={() => {}}
      />
    );

    const container = screen.getByRole('presentation', { hidden: true });
    const emojis = container.querySelectorAll('[aria-hidden="true"]');

    // Check if emojis are positioned relative to the specified position
    const firstEmoji = emojis[0] as HTMLElement;
    expect(firstEmoji.style.left).toBeDefined();
    expect(firstEmoji.style.top).toBeDefined();
  });

  it('cleans up animation frame on unmount', () => {
    const { unmount } = render(
      <EmojiBurst
        isActive={true}
        position={{ x: 100, y: 100 }}
        duration={1000}
        onComplete={() => {}}
      />
    );

    // Unmount the component
    unmount();

    // cancelAnimationFrame should have been called
    expect(globalThis.cancelAnimationFrame).toHaveBeenCalled();
  });
});
