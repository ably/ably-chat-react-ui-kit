import React from 'react';

import { AppLayout } from '../layouts/app-layout.tsx';

/**
 * Loading component displayed when connecting to Ably Chat.
 * Shows a spinner and a message.
 */
export const AppLoading = () => {
  return (
    <AppLayout width="50vw" height="50vh">
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to chat...</p>
        </div>
      </div>
    </AppLayout>
  );
};
