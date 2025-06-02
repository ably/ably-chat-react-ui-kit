import React from 'react';
import { usePresenceListener } from '@ably/chat/react';

interface PresenceIndicatorsProps {
  className?: string;
}

const PresenceIndicators: React.FC<PresenceIndicatorsProps> = ({ className = '' }) => {
  const { presenceData } = usePresenceListener();
  const getPresenceText = () => {
    const presentCount = new Set(presenceData.map((p) => p.clientId)).size;
    if (presentCount === 1) return '1 person present';
    return `${presentCount} people present`;
  };

  return (
    <p
      className={`text-sm ${
        (presenceData?.length || 0) > 0
          ? 'text-green-500'
          : 'text-gray-500 dark:text-gray-400'
      } ${className}`}
    >
      {getPresenceText()}
    </p>
  );
};

export default PresenceIndicators;