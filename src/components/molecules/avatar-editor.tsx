import React, { useState } from 'react';

import { Avatar, AvatarData } from '../atoms/avatar.tsx';
import { Button } from '../atoms/button.tsx';
import { Icon } from '../atoms/icon.tsx';

/**
 * Preset avatar options for users to choose from
 */
const PRESET_AVATARS = [
  { src: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Felix', label: 'Style 1' },
  { src: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Dusty', label: 'Style 2' },
  { src: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Mittens', label: 'Style 3' },
  { src: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Misty', label: 'Style 4' },
  { src: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Bailey', label: 'Style 5' },
  { src: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Milo', label: 'Style 6' },
];

/**
 * Predefined color options for avatars
 */
const COLOR_OPTIONS = [
  { value: 'bg-blue-500', label: 'Blue' },
  { value: 'bg-purple-500', label: 'Purple' },
  { value: 'bg-green-500', label: 'Green' },
  { value: 'bg-orange-500', label: 'Orange' },
  { value: 'bg-red-500', label: 'Red' },
  { value: 'bg-pink-500', label: 'Pink' },
  { value: 'bg-indigo-500', label: 'Indigo' },
  { value: 'bg-yellow-500', label: 'Yellow' },
  { value: 'bg-teal-500', label: 'Teal' },
  { value: 'bg-cyan-500', label: 'Cyan' },
];

export interface AvatarEditorProps {
  /**
   * Current avatar URL
   */
  currentAvatar?: string;

  /**
   * Current avatar background color
   */
  currentColor?: string;

  /**
   * Display name for the avatar
   */
  displayName: string;

  /**
   * Callback when the editor is closed
   */
  onClose: () => void;

  /**
   * Callback when the avatar is saved
   * @param avatar - The updated avatar data
   */
  onSave: (avatar: Partial<AvatarData>) => void;
}

/**
 * AvatarEditor component allows users to customize their avatar
 *
 * Features:
 * - Upload custom images
 * - Enter image URL
 * - Choose from preset avatars
 * - Select background colors
 * - Remove avatar
 *
 * TODO: Break up into smaller subcomponents:
 * - AvatarUploadTab
 * - AvatarPresetsTab
 * - AvatarCustomizeTab
 * - AvatarPreview
 */
export const AvatarEditor = ({
  currentAvatar,
  currentColor,
  displayName,
  onClose,
  onSave,
}: AvatarEditorProps) => {
  const [avatarUrl, setAvatarUrl] = useState(currentAvatar || '');
  const [selectedColor, setSelectedColor] = useState(currentColor || '');
  const [customInitials, setCustomInitials] = useState('');
  const [activeTab, setActiveTab] = useState<'presets' | 'color'>('presets');
  const [error, setError] = useState('');

  /**
   * Handles changes to the custom initials input
   * Limits input to 2 characters and converts to uppercase
   *
   * @param event - The input change event
   */
  const handleInitialsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Limit to 2 characters
    setCustomInitials(event.target.value.slice(0, 2).toUpperCase());
  };

  /**
   * Handles selection of a preset avatar
   *
   * @param presetUrl - The URL of the selected preset avatar
   */
  const handlePresetSelect = (presetUrl: string) => {
    setAvatarUrl(presetUrl);
    setError('');
  };

  /**
   * Handles selection of a background color
   *
   * @param color - The selected color value (CSS class)
   */
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  /**
   * Handles saving the avatar changes
   * Collects all avatar data and passes it to the onSave callback
   */
  const handleSave = () => {
    const avatarData: Partial<AvatarData> = {
      displayName,
    };

    if (avatarUrl) {
      avatarData.src = avatarUrl;
    }

    if (selectedColor) {
      avatarData.color = selectedColor;
    }

    if (customInitials) {
      avatarData.initials = customInitials;
    }

    onSave(avatarData);
    onClose();
  };

  /**
   * Handles removing the avatar
   * Clears the avatar URL and passes updated data to the onSave callback
   */
  const handleRemove = () => {
    setAvatarUrl('');
    onSave({ displayName, src: undefined });
    onClose();
  };

  /**
   * Generates initials from the display name or returns custom initials if set
   *
   * @returns The initials to display in the avatar (max 2 characters)
   */
  const getInitials = () => {
    if (customInitials) return customInitials;

    return displayName
      .split(' ')
      .filter((name) => name.length > 0)
      .map((name) => name[0]?.toUpperCase() || '')
      .join('')
      .padEnd(2, '•')
      .slice(0, 2);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Edit Avatar</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="close" size="sm" />
          </Button>
        </div>

        {/* Avatar Preview */}
        <div className="flex justify-center mb-6">
          <Avatar
            alt={displayName}
            src={avatarUrl}
            color={selectedColor || currentColor || 'bg-gray-500'}
            size="xl"
            initials={getInitials()}
          />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4" role="tablist">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'presets'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => {
              setActiveTab('presets');
            }}
            role="tab"
            aria-selected={activeTab === 'presets'}
            aria-controls="presets-tab"
            id="presets-tab-button"
          >
            Presets
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'color'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => {
              setActiveTab('color');
            }}
            role="tab"
            aria-selected={activeTab === 'color'}
            aria-controls="color-tab"
            id="color-tab-button"
          >
            Customize
          </button>
        </div>

        {/* Presets Tab Content */}
        {activeTab === 'presets' && (
          <div role="tabpanel" id="presets-tab" aria-labelledby="presets-tab-button">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Choose a Preset Avatar
            </label>
            <div className="grid grid-cols-3 gap-3">
              {PRESET_AVATARS.map((preset, index) => (
                <div
                  key={index}
                  className={`cursor-pointer p-2 rounded-lg ${
                    avatarUrl === preset.src
                      ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => {
                    handlePresetSelect(preset.src);
                  }}
                >
                  <div className="flex flex-col items-center">
                    <Avatar alt={preset.label} src={preset.src} size="md" />
                    <span className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      {preset.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Color Tab Content */}
        {activeTab === 'color' && (
          <div
            className="space-y-4"
            role="tabpanel"
            id="color-tab"
            aria-labelledby="color-tab-button"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Background Color
              </label>
              <div className="grid grid-cols-5 gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <div
                    key={color.value}
                    className={`w-8 h-8 rounded-full ${color.value} cursor-pointer ${
                      selectedColor === color.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                    }`}
                    onClick={() => {
                      handleColorSelect(color.value);
                    }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom Initials (max 2 characters)
              </label>
              <input
                type="text"
                value={customInitials}
                onChange={handleInitialsChange}
                maxLength={2}
                placeholder="AB"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && <div className="text-red-600 dark:text-red-400 text-sm mt-2">{error}</div>}

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          {(currentAvatar || avatarUrl) && (
            <Button variant="secondary" onClick={handleRemove}>
              Remove
            </Button>
          )}
          <Button onClick={handleSave} className="flex-1">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};
