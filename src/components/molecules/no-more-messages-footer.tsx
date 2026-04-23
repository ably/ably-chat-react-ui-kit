import React from 'react';

/**
 * Props for {@link NoMoreMessagesFooter}.
 */
export interface NoMoreMessagesFooterProps {
  /**
   * Optional label displayed in the footer.
   *
   * @default "No more messages"
   */
  label?: string;
}

/**
 * Footer rendered at the top of a `ChatMessageList` once the full history
 * has been loaded.
 *
 * This component exists as a distinct building block so it can be replaced
 * or suppressed via {@link ComponentsProvider} overrides
 * (for example `overrides={{ NoMoreMessagesFooter: null }}`).
 */
export const NoMoreMessagesFooter = ({ label = 'No more messages' }: NoMoreMessagesFooterProps) => (
  <div className="flex justify-center py-4" role="status">
    <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
  </div>
);
