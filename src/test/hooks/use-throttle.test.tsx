import '@testing-library/jest-dom';

import { act,renderHook } from '@testing-library/react';
import { afterEach,beforeEach, describe, expect, it, vi } from 'vitest';

import { useThrottle } from '../../hooks/use-throttle.tsx';

describe('useThrottle Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should throttle function calls', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useThrottle(mockFn, 200));
    const throttledFn = result.current;

    // Call the throttled function multiple times in quick succession
    act(() => {
      throttledFn(1);
      throttledFn(2);
      throttledFn(3);
    });

    // Function should not have been called yet (waiting for throttle window)
    expect(mockFn).not.toHaveBeenCalled();

    // Advance timer to just before the throttle window ends
    act(() => {
      vi.advanceTimersByTime(199);
    });
    expect(mockFn).not.toHaveBeenCalled();

    // Advance timer to the end of the throttle window
    act(() => {
      vi.advanceTimersByTime(1);
    });

    // Function should have been called once with the latest arguments
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith(3);
  });

  it('should execute with the latest arguments after throttle period', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useThrottle(mockFn, 100));
    const throttledFn = result.current;

    // Call with first argument
    act(() => {
      throttledFn('first');
    });

    // Wait 50ms and call with second argument
    act(() => {
      vi.advanceTimersByTime(50);
      throttledFn('second');
    });

    // Wait 30ms more and call with third argument
    act(() => {
      vi.advanceTimersByTime(30);
      throttledFn('third');
    });

    // Function should not have been called yet
    expect(mockFn).not.toHaveBeenCalled();

    // Advance to the end of the throttle period
    act(() => {
      vi.advanceTimersByTime(20);
    });

    // Function should be called with the latest argument
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('third');
  });

  it('should allow new calls after throttle period ends', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useThrottle(mockFn, 100));
    const throttledFn = result.current;

    // First call
    act(() => {
      throttledFn('first call');
    });

    // Advance past throttle period
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // First call should have executed
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('first call');

    // Second call
    act(() => {
      throttledFn('second call');
    });

    // Function should not have been called again yet
    expect(mockFn).toHaveBeenCalledTimes(1);

    // Advance past throttle period again
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Second call should have executed
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenCalledWith('second call');
  });

  it('should clean up on unmount', () => {
    const mockFn = vi.fn();
    const { result, unmount } = renderHook(() => useThrottle(mockFn, 100));
    const throttledFn = result.current;

    // Call the throttled function
    act(() => {
      throttledFn('test');
    });

    // Unmount the component
    unmount();

    // Advance past throttle period
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Function should not have been called due to cleanup
    expect(mockFn).not.toHaveBeenCalled();
  });
});
