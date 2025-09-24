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
    <div className="ably-avatar-editor">
      <div className="ably-avatar-editor__modal">
        <div className="ably-avatar-editor__header">
          <h2 className="ably-avatar-editor__title">Edit Avatar</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="close" size="sm" />
          </Button>
        </div>

        {/* Avatar Preview */}
        <div className="ably-avatar-editor__preview">
          <Avatar
            alt={displayName}
            src={avatarUrl}
            color={selectedColor || currentColor || 'bg-gray-500'}
            size="xl"
            initials={getInitials()}
          />
        </div>

        {/* Tabs */}
        <div className="ably-avatar-editor__tabs" role="tablist">
          <button
            className={`ably-avatar-editor__tab ${
              activeTab === 'presets' ? 'ably-avatar-editor__tab--active' : ''
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
            className={`ably-avatar-editor__tab ${
              activeTab === 'color' ? 'ably-avatar-editor__tab--active' : ''
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
          <div className="ably-avatar-editor__tab-panel" role="tabpanel" id="presets-tab" aria-labelledby="presets-tab-button">
            <label className="ably-avatar-editor__label">
              Choose a Preset Avatar
            </label>
            <div className="ably-avatar-editor__presets">
              {PRESET_AVATARS.map((preset, index) => (
                <div
                  key={index}
                  className={`ably-avatar-editor__preset ${
                    avatarUrl === preset.src ? 'ably-avatar-editor__preset--selected' : ''
                  }`}
                  onClick={() => {
                    handlePresetSelect(preset.src);
                  }}
                >
                  <div className="ably-avatar-editor__preset-content">
                    <Avatar alt={preset.label} src={preset.src} size="md" />
                    <span className="ably-avatar-editor__preset-label">
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
            className="ably-avatar-editor__color-tab"
            role="tabpanel"
            id="color-tab"
            aria-labelledby="color-tab-button"
          >
            <div>
              <label className="ably-avatar-editor__label">
                Background Color
              </label>
              <div className="ably-avatar-editor__color-grid">
                {COLOR_OPTIONS.map((color) => (
                  <div
                    key={color.value}
                    className={`ably-avatar-editor__color-option ${color.value} ${
                      selectedColor === color.value ? 'ably-avatar-editor__color-option--selected' : ''
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
              <label className="ably-avatar-editor__label">
                Custom Initials (max 2 characters)
              </label>
              <input
                type="text"
                value={customInitials}
                onChange={handleInitialsChange}
                maxLength={2}
                placeholder="AB"
                className="ably-avatar-editor__initials-input"
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && <div className="ably-avatar-editor__error">{error}</div>}

        {/* Actions */}
        <div className="ably-avatar-editor__actions">
          <Button variant="secondary" onClick={onClose} className="ably-avatar-editor__action--primary">
            Cancel
          </Button>
          {(currentAvatar || avatarUrl) && (
            <Button variant="secondary" onClick={handleRemove}>
              Remove
            </Button>
          )}
          <Button onClick={handleSave} className="ably-avatar-editor__action--primary">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};
