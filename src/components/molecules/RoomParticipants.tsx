import React, { useState } from 'react';
import Avatar from '../atoms/Avatar';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import AvatarEditor from './AvatarEditor';
import { usePresenceListener, useChatClient, useTyping } from '@ably/chat/react';

interface RoomParticipantsProps {
  roomAvatar?: string;
  roomName: string;
  isOpen: boolean;
  onToggle: () => void;
  onAvatarChange?: (newAvatarUrl: string | undefined) => void;
  position?: { top: number; left: number };
}

const RoomParticipants: React.FC<RoomParticipantsProps> = ({
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

  // Calculate present count from unique clientIds in presence data
  const presentCount = presenceData?.length || 0;

  // Generate avatar URL based on clientId if not provided
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

  const getTooltipText = () => {
    if (!presenceData || presenceData.length === 0) {
      return 'No one is currently present';
    }

    const names = presenceData.slice(0, 3).map((member) => member.clientId);
    const remaining = presenceData.length - 3;

    // Check if anyone is typing
    const typingUsers = presenceData.filter((member) => currentlyTyping.has(member.clientId));

    let baseText = '';
    if (remaining > 0) {
      baseText = `${names.join(', ')} and ${remaining} more participant${remaining > 1 ? 's' : ''} are present`;
    } else {
      baseText = `${names.join(', ')} ${names.length > 1 ? 'are' : 'is'} present`;
    }

    if (typingUsers.length > 0) {
      const typingNames = typingUsers.slice(0, 2).map((user) => user.clientId);
      const typingText =
        typingUsers.length === 1
          ? `${typingNames[0]} is typing...`
          : typingUsers.length === 2
            ? `${typingNames.join(' and ')} are typing...`
            : `${typingNames.join(', ')} and ${typingUsers.length - 2} others are typing...`;

      return `${baseText}\n${typingText}`;
    }

    return baseText;
  };

  // Sort participants: current user first, then by clientId
  const sortedParticipants = presenceData
    ? [...presenceData].sort((a, b) => {
        if (a.clientId === currentUserId && b.clientId !== currentUserId) return -1;
        if (a.clientId !== currentUserId && b.clientId === currentUserId) return 1;
        return a.clientId.localeCompare(b.clientId);
      })
    : [];

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
        {presentCount > 0 && (
          <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
            {presentCount > 99 ? '99+' : presentCount}
          </div>
        )}
      </div>

      {/* Hover Tooltip */}
      {showTooltip && !isOpen && (
        <div
          className={`absolute ${
            tooltipPosition === 'above'
              ? 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
              : 'top-full left-1/2 transform -translate-x-1/2 mt-2'
          } px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-50 max-w-xs`}
        >
          <div className="text-center">{getTooltipText()}</div>
          {/* Arrow */}
          <div
            className={`absolute ${
              tooltipPosition === 'above'
                ? 'top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700'
                : 'bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900 dark:border-b-gray-700'
            }`}
          ></div>
        </div>
      )}

      {/* Participants Dropdown */}
      {isOpen && (
        <div
          className="absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg min-w-80 max-h-96 overflow-hidden z-50"
          style={{
            top: position.top,
            left: position.left,
            transform: 'translateX(-50%)',
          }}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Participants ({presentCount})
              </h3>
              <Button variant="ghost" size="sm" onClick={onToggle}>
                <Icon name="close" size="sm" />
              </Button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{presentCount} present</p>
          </div>

          {/* Participants List */}
          <div className="max-h-64 overflow-y-auto">
            {sortedParticipants.map((member) => (
              <div
                key={member.clientId}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="relative">
                  <Avatar
                    alt={member.clientId}
                    src={generateAvatarUrl(member.clientId)}
                    color={getUserColor(member.clientId)}
                    size="sm"
                  />
                  {/* Online Status Indicator */}
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                      member.clientId === currentUserId ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {member.clientId}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 mt-0.5">
                    {/* Check if this participant is currently typing */}
                    {currentlyTyping.has(member.clientId) && member.clientId !== currentUserId ? (
                      <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <div className="flex gap-1">
                          <div
                            className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: '0ms' }}
                          ></div>
                          <div
                            className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: '150ms' }}
                          ></div>
                          <div
                            className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: '300ms' }}
                          ></div>
                        </div>
                        typing...
                      </span>
                    ) : (
                      <span className="text-sm text-green-600 dark:text-green-400">Online</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

export default RoomParticipants;
