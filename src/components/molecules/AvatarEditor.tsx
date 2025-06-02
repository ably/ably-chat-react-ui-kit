import React, { useState } from 'react';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Avatar from '../atoms/Avatar';

interface AvatarEditorProps {
  currentAvatar?: string;
  currentColor?: string;
  displayName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (avatarUrl: string | undefined) => void;
}

const AvatarEditor: React.FC<AvatarEditorProps> = ({
  currentAvatar,
  currentColor,
  displayName,
  isOpen,
  onClose,
  onSave,
}) => {
  const [avatarUrl, setAvatarUrl] = useState(currentAvatar || '');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      // Create a data URL for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setAvatarUrl(dataUrl);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to upload image');
      setIsUploading(false);
    }
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarUrl(event.target.value);
    setError('');
  };

  const handleSave = () => {
    onSave(avatarUrl || undefined);
    onClose();
  };

  const handleRemove = () => {
    setAvatarUrl('');
    onSave(undefined);
    onClose();
  };

  const getInitials = () => {
    return displayName
      .split(' ')
      .map((name) => name.charAt(0).toUpperCase())
      .join('')
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
            color={currentColor || 'bg-gray-500'}
            size="xl"
            initials={getInitials()}
          />
        </div>

        {/* Upload Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Image
            </label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="avatar-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="avatar-upload"
                className={`cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium ${
                  isUploading
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon name="upload" size="sm" />
                {isUploading ? 'Uploading...' : 'Choose File'}
              </label>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400">or</div>

          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Image URL
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={handleUrlChange}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Error Message */}
          {error && <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          {currentAvatar && (
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

export default AvatarEditor;
