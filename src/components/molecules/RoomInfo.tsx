import React, { useState } from 'react';
import Avatar, { AvatarData } from '../atoms/Avatar';
import AvatarEditor from './AvatarEditor';
import PresenceCount from './PresenceCount';
import { PresenceList } from './PresenceList';
import ParticipantList from './ParticipantList';
import { usePresenceListener, useChatClient, useTyping } from '@ably/chat/react';
import { useAvatar } from '../../context/AvatarContext';

/**
 * Props for the RoomInfo component
 */
interface RoomInfoProps {
  /** Avatar data for the room (optional, will use AvatarContext if not provided) */
  roomAvatar?: AvatarData;
  /** Display name of the room */
  roomName: string;
  /** Unique identifier for the room */
  roomId: string;
  /** Whether the participant list is currently open */
  isOpen: boolean;
  /** Callback function to toggle the participant list open/closed */
  onToggle: () => void;
  /** Position coordinates for rendering the participant list */
  position?: { top: number; left: number };
}

/**
 * RoomInfo component displays information about a chat room
 * 
 * Features:
 * - Shows room avatar with presence count badge
 * - Displays tooltip with participant information on hover
 * - Opens participant list when clicked
 * - Allows editing the room avatar
 * - Integrates with presence and typing indicators
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

  /**
   * Handles mouse enter event on the room avatar
   * Calculates optimal tooltip position based on available space
   * 
   * @param event - The mouse enter event
   */
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

  /**
   * Handles click on the avatar edit overlay
   * Prevents event propagation and opens the avatar editor
   * 
   * @param e - The click event
   */
  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the participant dropdown
    setShowAvatarEditor(true);
  };

  /**
   * Handles avatar changes from the AvatarEditor
   * Updates the room avatar in the AvatarContext
   * 
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
        role="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`${roomName} (${presenceData?.length || 0} participants)`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
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
            role="button"
            aria-label="Edit room avatar"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleAvatarClick(e as unknown as React.MouseEvent);
              }
            }}
          >
            {/* Semi-transparent overlay */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full transition-all" 
              aria-hidden="true"
            />

            {/* Edit icon in center - smaller clickable area */}
            <div 
              className="relative z-10 bg-black bg-opacity-60 rounded-full p-2 transform scale-0 group-hover:scale-100 transition-transform"
              aria-hidden="true"
            >
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
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
