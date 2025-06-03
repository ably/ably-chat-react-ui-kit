import React, { useState } from 'react';
import Avatar, { AvatarData } from '../atoms/Avatar';
import AvatarEditor from './AvatarEditor';
import PresenceCount from './PresenceCount';
import { PresenceList } from './PresenceList';
import ParticipantList from './ParticipantList';
import { usePresenceListener, useChatClient, useTyping } from '@ably/chat/react';
import { useAvatar } from '../../context/AvatarContext';

interface RoomInfoProps {
  roomAvatar?: AvatarData;
  roomName: string;
  roomId: string;
  isOpen: boolean;
  onToggle: () => void;
  position?: { top: number; left: number };
}

/**
 * RoomInfo component displays information about a chat room
 * Includes room avatar, presence count, and participant list
 */
const RoomInfo: React.FC<RoomInfoProps> = ({
  roomAvatar: propRoomAvatar,
  roomName,
  roomId,
  isOpen,
  onToggle,
  position = { top: 0, left: 0 },
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<'above' | 'below'>('above');
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);

  const { presenceData } = usePresenceListener();
  const { currentlyTyping } = useTyping();
  const chatClient = useChatClient();
  const currentUserId = chatClient.clientId;

  // Use the AvatarProvider to get and set room avatars
  const { getAvatarForRoom, setRoomAvatar } = useAvatar();

  // Use the avatar from props if provided, otherwise get it from the AvatarProvider
  const roomAvatar = propRoomAvatar || getAvatarForRoom(roomId, roomName);

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
    setShowAvatarEditor(true);
  };

  /**
   * Handle avatar changes from the AvatarEditor
   * @param avatarData - Partial avatar data to update
   */
  const handleAvatarSave = (avatarData: Partial<AvatarData>) => {
    // Update the room avatar in the AvatarProvider
    setRoomAvatar(roomId, avatarData);
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
            alt={roomAvatar.displayName}
            src={roomAvatar.src}
            color={roomAvatar.color}
            size="lg"
            initials={roomAvatar.initials}
          />

          {/* Edit overlay */}
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
      />

      {/* Avatar Editor Modal */}
      <AvatarEditor
        isOpen={showAvatarEditor}
        onClose={() => setShowAvatarEditor(false)}
        onSave={handleAvatarSave}
        currentAvatar={roomAvatar.src}
        currentColor={roomAvatar.color}
        displayName={roomAvatar.displayName}
      />
    </div>
  );
};

export default RoomInfo;
