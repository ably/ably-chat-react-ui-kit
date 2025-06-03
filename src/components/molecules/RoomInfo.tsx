import React, { useState } from 'react';
import Avatar from '../atoms/Avatar';
import AvatarEditor from './AvatarEditor';
import PresenceCount from './PresenceCount';
import { PresenceList } from './PresenceList';
import ParticipantList from './ParticipantList';
import { usePresenceListener, useChatClient, useTyping } from '@ably/chat/react';

interface RoomInfoProps {
  roomAvatar?: string;
  roomName: string;
  isOpen: boolean;
  onToggle: () => void;
  onAvatarChange?: (newAvatarUrl: string | undefined) => void;
  position?: { top: number; left: number };
}

const RoomInfo: React.FC<RoomInfoProps> = ({
  roomAvatar,
  roomName,
  isOpen,
  onToggle,
  onAvatarChange,
  position = { top: 0, left: 0 },
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<'above' | 'below'>('above');
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);

  const { presenceData } = usePresenceListener();
  const { currentlyTyping } = useTyping();
  const chatClient = useChatClient();
  const currentUserId = chatClient.clientId;

  // Generate avatar URL based on clientId if not provided
  // TODO: Remove this for now, we can use a static avatar from public assets
  const generateAvatarUrl = (clientId: string) => {
    // Using a simple avatar service that generates avatars based on the clientId
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(clientId)}`;
  };

  // Get user color based on whether it's the current user or not
  const getUserColor = (clientId: string) => {
    return clientId === currentUserId ? 'bg-blue-500' : 'bg-gray-500';
  };

  // Generate consistent color for room
  const getRoomColor = () => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-green-500',
      'bg-orange-500',
      'bg-red-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-teal-500',
      'bg-cyan-500',
      'bg-emerald-500',
      'bg-violet-500',
    ];
    let hash = 0;
    for (let i = 0; i < roomName.length; i++) {
      hash = ((hash << 5) - hash + roomName.charCodeAt(i)) & 0xffffffff;
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getRoomInitials = () => {
    const words = roomName.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return roomName.substring(0, 2).toUpperCase();
  };

  const handleMouseEnter = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const tooltipHeight = 60; // Approximate tooltip height
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;

    // Position above if there's enough space, otherwise below
    if (spaceAbove >= tooltipHeight + 10) {
      setTooltipPosition('above');
    } else if (spaceBelow >= tooltipHeight + 10) {
      setTooltipPosition('below');
    } else {
      // If neither has enough space, use the side with more space
      setTooltipPosition(spaceAbove > spaceBelow ? 'above' : 'below');
    }

    setShowTooltip(true);
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the participant dropdown
    if (onAvatarChange) {
      setShowAvatarEditor(true);
    }
  };

  const handleAvatarSave = (newAvatarUrl: string | undefined) => {
    if (onAvatarChange) {
      onAvatarChange(newAvatarUrl);
    }
  };

  return (
    <div className="relative">
      {/* Room Avatar with Hover Tooltip */}
      <div
        className="relative cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={onToggle}
      >
        <div className="relative">
          <Avatar
            alt={roomName}
            src={roomAvatar}
            color={getRoomColor()}
            size="lg"
            initials={getRoomInitials()}
          />

          {/* Edit overlay */}
          {onAvatarChange && (
            <div
              className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer group"
              onClick={handleAvatarClick}
              title="Edit avatar"
            >
              {/* Semi-transparent overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full transition-all" />

              {/* Edit icon in center - smaller clickable area */}
              <div className="relative z-10 bg-black bg-opacity-60 rounded-full p-2 transform scale-0 group-hover:scale-100 transition-transform">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Present Count Badge */}
        <PresenceCount presenceData={presenceData} />
      </div>

      {/* Hover Tooltip */}
      <PresenceList
        presenceData={presenceData}
        tooltipPosition={tooltipPosition}
        showTooltip={showTooltip}
        isOpen={isOpen}
      />

      {/* Participants Dropdown */}
      <ParticipantList
        presenceData={presenceData}
        currentUserId={currentUserId}
        currentlyTyping={currentlyTyping}
        isOpen={isOpen}
        onToggle={onToggle}
        position={position}
        generateAvatarUrl={generateAvatarUrl}
        getUserColor={getUserColor}
      />

      {/* Avatar Editor Modal */}
      <AvatarEditor
        isOpen={showAvatarEditor}
        onClose={() => setShowAvatarEditor(false)}
        onSave={handleAvatarSave}
        currentAvatar={roomAvatar}
        currentColor={getRoomColor()}
        displayName={roomName}
      />
    </div>
  );
};

export default RoomInfo;
