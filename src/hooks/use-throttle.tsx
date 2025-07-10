import { useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook for throttling function calls with trailing execution
 *
 * @param fn - The function to throttle
 * @param delay - The throttle delay in milliseconds
 * @returns A throttled version of the function
 *
 * Features:
 * - Throttles function calls to at most once per delay period
 * - Ensures trailing execution: if calls happen during throttle window,
 *   the last call executes at the end of the window
 * - Proper cleanup on component unmount
 * - Handles rapid successive calls by using the latest arguments
 *
 * @example
 * ```tsx
 * const sendReaction = useCallback(async (emoji: string) => {
 *   await send({ type: emoji });
 * }, [send]);
 *
 * const throttledSend = useThrottle(sendReaction, 200);
 *
 * // Usage
 * throttledSend('👍'); // Will execute at end of 200ms window
 * throttledSend('❤️'); // Will override previous call
 * throttledSend('😂'); // Will execute with '😂' after 200ms
 * ```
 */
export function useThrottle<Args extends unknown[], R>(
  fn: (...args: Args) => R,
  delay: number
): (...args: Args) => R {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastArgsRef = useRef<Args | undefined>(undefined);
  const isThrottledRef = useRef(false);

  // Cleanup function to clear pending timeouts
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    lastArgsRef.current = undefined;
    isThrottledRef.current = false;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return useCallback(
    (...args: Args) => {
      lastArgsRef.current = args;

      if (!isThrottledRef.current) {
        isThrottledRef.current = true;

        timeoutRef.current = setTimeout(() => {
          if (lastArgsRef.current) {
            fn(...lastArgsRef.current);
            lastArgsRef.current = undefined;
          }
          isThrottledRef.current = false;
          timeoutRef.current = undefined;
        }, delay);
      }

      // If we're already in a throttle period, the timeout will use the updated lastArgsRef
      // This ensures the latest call's arguments are used when the throttle period ends
      return undefined as unknown as R;
    },
    [fn, delay]
  );
}
