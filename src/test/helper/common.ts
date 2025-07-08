import { expect, vi } from 'vitest';

export const waitForArrayLength = async (array: unknown[], expectedCount: number, timeoutMs = 3000): Promise<void> => {
  await vi.waitFor(
    () => {
      expect(array.length).toBe(expectedCount);
    },
    { timeout: timeoutMs, interval: 100 },
  );
};
