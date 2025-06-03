import React from 'react';
import { PresenceMember } from '@ably/chat';

interface PresenceCountProps {
  presenceData: PresenceMember[];
}

const PresenceCount: React.FC<PresenceCountProps> = ({ presenceData }) => {
  const presentCount = presenceData?.length || 0;

  if (presentCount === 0) {
    return null;
  }

  return (
    <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
      {presentCount > 99 ? '99+' : presentCount}
    </div>
  );
};

export default PresenceCount;
