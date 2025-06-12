import { useChatClient, usePresenceListener, useRoom, useTyping } from '@ably/chat/react';
import clsx from 'clsx';
import React, { useState } from 'react';

import { useRoomAvatar } from '../../hooks/use-room-avatar.tsx';
import { Avatar, AvatarData } from '../atoms/avatar.tsx';
import { AvatarEditor } from './avatar-editor.tsx';
import { ParticipantList } from './participant-list.tsx';
import { PresenceCount } from './presence-count.tsx';
import { PresenceIndicators } from './presence-indicators.tsx';
import { PresenceList } from './presence-list.tsx';
import { TypingIndicators } from './typing-indicators.tsx';

/**
 * Props for the RoomInfo component
 */
export interface RoomInfoProps {
  /**
   * Optional avatar data for the room to override context-managed avatar.
   * When provided, bypasses the AvatarContext and uses this data directly.
   * Useful for scenarios with external avatar management or testing.
   * If not provided, automatically fetches or creates avatar via useRoomAvatar hook.
   *
   * @example
   * // Using context-managed avatar (recommended)
   * <RoomInfo roomName="general-chat" />
   *
   * @example
   * // Providing custom avatar data
   * <RoomInfo
   *   roomName="special-room"
   *   roomAvatar={{
   *     displayName: "VIP Lounge",
   *     color: "#FFD700",
   *     initials: "VL",
   *     src: "https://example.com/vip-avatar.jpg"
   *   }}
   * />
   */
  roomAvatar?: AvatarData;

  /**
   * Position coordinates for rendering the participant list dropdown.
   * Defines where the participant list appears relative to the viewport.
   * Adjust based on component placement to prevent edge overflow.
   *
   * @default { top: 0, left: 150 }
   *
   * @example
   * // Position for sidebar placement
   * <RoomInfo
   *   position={{ top: 60, left: 250 }}
   * />
   *
   */
  position?: { top: number; left: number };

  /**
   * Additional CSS class names to apply to the root container element.
   * Use for spacing, sizing, positioning, and theme customizations.
   *
   * @example
   * // Custom spacing and background
   * <RoomInfo
   *   className="p-4 bg-blue-50 rounded-lg shadow-sm"
   * />
   *
   * @example
   * // Compact mobile layout
   * <RoomInfo
   *   className="px-2 py-1 gap-2"
   * />
   *
   * @example
   * // Fixed positioning for overlays
   * <RoomInfo
   *   className="fixed top-4 left-4 bg-white shadow-lg rounded-full px-4 py-2"
   * />
   *
   * @example
   * // Responsive design patterns
   * <RoomInfo
   *   className="flex-col md:flex-row gap-2 md:gap-3"
   * />
   */
  className?: string;
}

/**
 * RoomInfo component displays comprehensive information about a chat room with interactive features.
 * It must be used within the context of a ChatRoomProvider and AvatarProvider to function correctly.
 *
 * Features:
 * - Room avatar display
 * - Live presence count badge showing active participants
 * - Interactive hover tooltip with participant preview
 * - Expandable participant list with detailed user information
 * - In-place avatar editing with color and image customization
 * - Presence and typing indicators built-in
 * - Accessibility support with ARIA roles and keyboard navigation
 * - Customizable positioning
 *
 * Presence:
 * - Live participant count with visual badge
 * - Hover tooltip showing recent participants
 * - Detailed participant list with status indicators
 * - Current user highlighting and status
 *
 * Typing Indicators:
 * - Typing activity display
 * - Smart user exclusion (doesn't show own typing)
 * - Configurable display limits
 *
 * @example
 * // Sidebar room list item
 * const SidebarRoomItem = ({ roomName, isActive }) => {
 *   return (
 *     <div className={`room-item ${isActive ? 'active' : ''}`}>
 *       <RoomInfo
 *         className="px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer"
 *         position={{ top: 0, left: 220 }}
 *       />
 *     </div>
 *   );
 * };
 *
 *
 * @example
 * // Custom avatar with external management
 * const ExternalAvatarRoom = ({ roomName, externalAvatar }) => {
 *   return (
 *     <RoomInfo
 *       roomAvatar={{
 *         displayName: room.customName,
 *         src: externalAvatar.imageUrl,
 *         color: room.themeColor,
 *         initials: room.customName.substring(0, 2).toUpperCase()
 *       }}
 *       className="p-4 bg-gradient-to-r from-blue-50 to-purple-50"
 *     />
 *   );
 * };
 *
 */
export const RoomInfo: React.FC<RoomInfoProps> = ({
  roomAvatar: propRoomAvatar,
  position = { top: 0, left: 150 },
  className,
}) => {
  const { roomName } = useRoom();
  const { presenceData } = usePresenceListener();
  const { currentlyTyping } = useTyping();
  const chatClient = useChatClient();
  const currentClientId = chatClient.clientId;

  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<'above' | 'below'>('above');
  const [tooltipCoords, setTooltipCoords] = useState<{ top: number; left: number } | undefined>();
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { roomAvatar, setRoomAvatar } = useRoomAvatar({ roomName });
  const roomAvatarData = propRoomAvatar || roomAvatar;

  const onToggle = () => {
    setShowTooltip(false); // Hide tooltip when toggling participant list
    setIsOpen(!isOpen);
  };

  /**
   * Handles mouse enter event on the room avatar
   * Calculates optimal tooltip position based on available space
   *
   * @param event - The mouse enter event
   */
  const handleMouseEnter = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const tooltipHeight = 30; // Approximate tooltip height
    const spacing = 5; // Space between avatar and tooltip
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;

    // Position above if there's enough space, otherwise below
    let finalTooltipPosition: 'above' | 'below';
    if (spaceAbove >= tooltipHeight + spacing + 10) {
      finalTooltipPosition = 'above';
    } else if (spaceBelow >= tooltipHeight + spacing + 10) {
      finalTooltipPosition = 'below';
    } else {
      // If neither has enough space, use the side with more space
      finalTooltipPosition = spaceAbove > spaceBelow ? 'above' : 'below';
    }

    setTooltipPosition(finalTooltipPosition);

    // Calculate coordinates for fixed positioning (viewport-relative)
    const horizontalCenter = (rect.left + rect.right) / 2;
    const verticalPos =
      finalTooltipPosition === 'above' ? rect.top - tooltipHeight - spacing : rect.bottom + spacing;

    setTooltipCoords({ top: verticalPos, left: horizontalCenter });

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
    setRoomAvatar(avatarData);
  };

  return (
    <div className={clsx('flex items-center gap-3', className)}>
      <div className="relative">
        {/* Room Avatar with Hover Tooltip */}
        <div
          className="relative cursor-pointer"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => {
            setShowTooltip(false);
          }}
          onClick={onToggle}
          role="button"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-label={`${roomName} (${String(presenceData.length || 0)} participants)`}
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
              alt={roomAvatarData?.displayName}
              src={roomAvatarData?.src}
              color={roomAvatarData?.color}
              size="lg"
              initials={roomAvatarData?.initials}
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
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
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
          coords={tooltipCoords}
        />

        {/* Participants Dropdown */}
        <ParticipantList
          presenceData={presenceData}
          currentClientId={currentClientId}
          currentlyTyping={currentlyTyping}
          isOpen={isOpen}
          onToggle={onToggle}
          position={position}
        />

        {/* Avatar Editor Modal */}
        {roomAvatarData && showAvatarEditor && (
          <AvatarEditor
            onClose={() => {
              setShowAvatarEditor(false);
            }}
            onSave={handleAvatarSave}
            currentAvatar={roomAvatarData.src}
            currentColor={roomAvatarData.color}
            displayName={roomAvatarData.displayName}
          />
        )}
      </div>

      {/* Room Information */}
      <div className="flex-1">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">{roomName}</h2>
        <div className="flex items-center gap-2">
          <PresenceIndicators />
          {/* Typing Indicators */}
          <TypingIndicators className="text-xs" />
        </div>
      </div>
    </div>
  );
};
