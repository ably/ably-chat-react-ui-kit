# Avatar API Documentation

This document provides comprehensive documentation for the Avatar API, including usage examples and best practices.

## Overview

The Avatar API provides a standardized way to manage and display avatars for users and rooms in the application. It
consists of:

1. **AvatarProvider**: A context provider that manages avatar generation and caching
2. **Avatar Component**: A reusable component for displaying avatars
3. **AvatarEditor**: A component for customizing avatars
4. **useUserAvatar**: A hook for accessing user avatars (Recommended for user-specific contexts)
5. **useRoomAvatar**: A hook for accessing room avatars (Recommended for room-specific contexts)
6. **AvatarData Interface**: A standardized structure for avatar data

## AvatarData Interface

The `AvatarData` interface defines the structure for avatar data across the application:

```typescript
interface AvatarData {
  src?: string;         // URL to the avatar image
  color?: string;       // Background color for initials fallback
  initials?: string;    // Custom initials to display when no image
  displayName: string;  // Used for alt text and generating initials
}
```

## AvatarProvider

The `AvatarProvider` is a context provider that centralizes avatar management and ensures consistency across the
application.

### Setup

Wrap your application with the `AvatarProvider`:

```tsx
import { AvatarProvider } from './context/AvatarContext';

const App = () => {
  return (
    <AvatarProvider>
      <YourApp />
    </AvatarProvider>
  );
};
```

### Usage

Use the `useAvatar` hook to access the avatar context:

```tsx
import { useAvatar } from './context/AvatarContext';

const YourComponent = () => {
  const {
    getAvatarForUser,
    createAvatarForUser,
    getAvatarForRoom,
    createAvatarForRoom,
    setUserAvatar,
    setRoomAvatar,
    getUserAvatars,
    getRoomAvatars,
    clearUserAvatars,
    clearRoomAvatars,
    clearAllAvatars,
    onAvatarChange,
    exportAvatars,
    importAvatars,
  } = useAvatar();

  // Get avatar for a user (returns undefined if not cached)
  const userAvatar = getAvatarForUser('user123', 'John Doe');

  // Create avatar for a user (creates and caches if not exists)
  const createdUserAvatar = createAvatarForUser('user123', 'John Doe');

  // Get avatar for a room (returns undefined if not cached)
  const roomAvatar = getAvatarForRoom('room456', 'General Chat');

  // Create avatar for a room (creates and caches if not exists)
  const createdRoomAvatar = createAvatarForRoom('room456', 'General Chat');

  // Update a user's avatar
  setUserAvatar('user123', { src: 'https://example.com/avatar.jpg' });

  // Update a room's avatar
  setRoomAvatar('room456', { color: 'bg-blue-500' });

  // Get all user avatars
  const allUserAvatars = getUserAvatars();

  // Get all room avatars
  const allRoomAvatars = getRoomAvatars();

  // Listen for avatar changes
  useEffect(() => {
    const unsubscribe = onAvatarChange((type, id, avatar, previousAvatar) => {
      console.log(`Avatar changed for ${type} ${id}:`, avatar);
    });

    return unsubscribe;
  }, [onAvatarChange]);

  return (
    // Your component JSX
  );
};
```

#### useUserAvatar Hook

The `useUserAvatar` hook is the recommended way to manage user avatars. It provides automatic caching, generation, and
synchronization.

##### Props

| Prop        | Type   | Description                                   |
|-------------|--------|-----------------------------------------------|
| clientId    | string | Unique identifier for the user (required)     |
| displayName | string | Optional display name, falls back to clientId |

##### Return Values

| Property      | Type                     | Description                                                           |
|---------------|--------------------------|-----------------------------------------------------------------------|
| userAvatar    | AvatarData OR undefined  | Current avatar data for the user (generates new state if none exists) |
| setUserAvatar | (data: Partial ) => void | Function to update the user avatar                                    |

##### Usage Example

```tsx
// Basic usage in message components
const MessageAvatar = ({ message }) => {
  const { userAvatar } = useUserAvatar({
    clientId: message.clientId,
    displayName: message.senderName
  });

  return (
    <Avatar
      src={userAvatar?.src}
      color={userAvatar?.color}
      initials={userAvatar?.initials}
      alt={userAvatar?.displayName}
      size="sm"
    />
  );
};

// User profile editing with avatar customization
const UserProfile = ({ clientId, name }) => {
  const { userAvatar, setUserAvatar } = useUserAvatar({
    clientId,
    displayName: name
  });

  const handleAvatarUpload = async (file) => {
    const uploadedUrl = await uploadImage(file);
    setUserAvatar({ src: uploadedUrl });
  };

  return (
    <div className="profile-editor">
      <Avatar
        src={userAvatar?.src}
        color={userAvatar?.color}
        initials={userAvatar?.initials}
        alt={userAvatar?.displayName}
        onClick={() => setShowAvatarEditor(true)}
      />
    </div>
  );
};
```

#### useRoomAvatar Hook

The `useRoomAvatar` hook is similar to `useUserAvatar`, but it manages avatars for rooms.

##### Props

| Prop        | Type   | Description                                   |
|-------------|--------|-----------------------------------------------|
| roomName    | string | Unique identifier for the room (required)     |
| displayName | string | Optional display name, falls back to roomName |

##### Return Values

| Property      | Type                     | Description                                                           |
|---------------|--------------------------|-----------------------------------------------------------------------|
| roomAvatar    | AvatarData OR undefined  | Current avatar data for the room (generates new state if none exists) |
| setRoomAvatar | (data: Partial ) => void | Function to update the room avatar                                    |

##### Usage Example

```tsx
// Basic usage in room components
const RoomHeader = ({ roomId }) => {
  const { roomAvatar, setRoomAvatar } = useRoomAvatar({ roomName: roomId });

  return (
    <div className="flex items-center gap-3">
      <Avatar
        src={roomAvatar?.src}
        color={roomAvatar?.color}
        initials={roomAvatar?.initials}
        alt={roomAvatar?.displayName}
      />
      <h1>{roomAvatar?.displayName}</h1>
    </div>
  );
};

// Room management with avatar customization
const RoomSettings = ({ roomName }) => {
  const { roomAvatar, setRoomAvatar } = useRoomAvatar({
    roomName,
    displayName: "General Discussion"
  });

  const handleRoomAvatarChange = (avatarData) => {
    setRoomAvatar(avatarData);
  };

  return (
    <div>
      <Avatar
        src={roomAvatar?.src}
        color={roomAvatar?.color}
        initials={roomAvatar?.initials}
        alt={roomAvatar?.displayName}
        size="lg"
      />
    </div>
  );
};
```

### Avatar Provider Options

The accepts optional configuration: `AvatarProvider`

```tsx
import { AvatarProvider, AvatarOptions } from './context/AvatarContext';

const avatarOptions: AvatarOptions = {
  persist: true,              // Enable localStorage persistence (default: true)
  maxCacheSize: 100,          // Maximum cached avatars (default: 100, 0 = unlimited)
  customColors: [             // Custom color palette (optional)
    'bg-custom-blue',
    'bg-custom-red',
    // ...
  ],
  onError: (error) => {       // Custom error handler (optional)
    console.error('Avatar error:', error);
  }
};

const App = () => {
  return (
    <AvatarProvider options={avatarOptions}>
      <YourApp />
    </AvatarProvider>
  );
};
```

## Avatar Component

The `Avatar` component displays a user or room avatar with fallback to initials when no image is available.

### Props

| Prop     | Type                         | Description                                           |
|----------|------------------------------|-------------------------------------------------------|
| src      | string                       | URL to the avatar image                               |
| alt      | string                       | Alternative text for the avatar image                 |
| color    | string                       | Background color for the avatar (Tailwind CSS class)  |
| size     | 'sm' \| 'md' \| 'lg' \| 'xl' | Size of the avatar                                    |
| initials | string                       | Custom initials to display when no image is available |
| onClick  | () => void                   | Click handler for the avatar                          |

### Size Reference

- **sm**: 32px (2rem) - `w-8 h-8 text-sm`
- **md**: 40px (2.5rem) - (default) `w-10 h-10 text-lg`
- **lg**: 48px (3rem) - `w-12 h-12 text-xl`
- **xl**: 64px (4rem) - `w-16 h-16 text-2xl`

### Usage Examples

#### Basic Usage

```tsx
<Avatar alt="John Doe" />
```

#### With Image

```tsx
<Avatar src="https://example.com/avatar.jpg" alt="John Doe" />
```

#### With Custom Color and Size

```tsx
<Avatar alt="John Doe" color="bg-purple-500" size="lg" />
```

#### Using AvatarData Object

```tsx
const avatarData = {
  displayName: "John Doe",
  src: "https://example.com/avatar.jpg",
  color: "bg-blue-500",
  initials: "JD"
};

<Avatar
  alt={avatarData.displayName}
  src={avatarData.src}
  color={avatarData.color}
  initials={avatarData.initials}
/>
```

## AvatarEditor

The `AvatarEditor` component allows users to customize their avatars.

```tsx
<Avatar
  src="https://example.com/avatar.jpg"
  alt="John Doe"
  size="lg"
  onClick={() => setShowAvatarEditor(true)}
/>
```

### Features

- Upload custom images
- Enter image URL
- Choose from preset avatars
- Select background colors
- Set custom initials
- Remove avatar

### Props

| Prop          | Type                                  | Description                        |
|---------------|---------------------------------------|------------------------------------|
| currentAvatar | string                                | Current avatar URL                 |
| currentColor  | string                                | Current avatar background color    |
| displayName   | string                                | Display name for the avatar        |
| isOpen        | boolean                               | Whether the editor is open         |
| onClose       | () => void                            | Callback when the editor is closed |
| onSave        | (avatar: Partial<AvatarData>) => void | Callback when the avatar is saved  |

### Usage Example

```tsx
const [showAvatarEditor, setShowAvatarEditor] = useState(false);
const { setUserAvatar } = useAvatar();

const handleAvatarSave = (avatarData: Partial<AvatarData>) => {
  setUserAvatar('user123', avatarData);
  setShowAvatarEditor(false);
};

return (
  <>
    <Avatar
      src="https://example.com/avatar.jpg"
      alt="John Doe"
      onClick={() => setShowAvatarEditor(true)}
    />

    <AvatarEditor
      isOpen={showAvatarEditor}
      onClose={() => setShowAvatarEditor(false)}
      onSave={handleAvatarSave}
      currentAvatar="https://example.com/avatar.jpg"
      currentColor="bg-blue-500"
      displayName="John Doe"
    />
  </>
);
```

### File Upload Validation

The AvatarEditor validates uploaded files:

- **Supported Formats**: JPG, PNG, WebP, SVG
- **Maximum File Size**: 5MB
- **Automatic Error Handling**: Invalid files show error messages

## Best Practices

### 1. Use the AvatarProvider

Always wrap your application with the `AvatarProvider` to ensure consistent avatar management:

```tsx
<AvatarProvider>
  <YourApp />
</AvatarProvider>
```

### 2. Use the useUserAvatar and useRoomAvatar Hooks

Use the `useUserAvatar` or `useRoomAvatar` hooks as the preferred way to access avatar-related functionality:

```tsx
const UserProfileAvatar = ({ clientId }) => {
  const { userAvatar, setUserAvatar } = useUserAvatar({ clientId });

  return (
    <Avatar
      src={userAvatar?.src}
      color={userAvatar?.color}
      initials={userAvatar?.initials}
      alt={userAvatar?.displayName}
      size="lg"
      onClick={() => setShowAvatarEditor(true)}
    />
  );
};
```

### 3. Handle Avatar Updates Properly

When updating avatars, use the exposed setter functions to ensure proper caching and synchronization:

```tsx
const { setUserAvatar } = useUserAvatar({ clientId: 'user123' });
const handleAvatarUpdate = (newAvatarData) => {
  setUserAvatar({ src: newAvatarData.src });
};
```

### 4. Use with the Avatar Component

To ensure consistent styling and functionality, always use the `Avatar` component for displaying avatars:

```tsx
import { Avatar } from './atoms/Avatar';

const MessageAvatar = ({ message }) => {
  const { userAvatar } = useUserAvatar({
    clientId: message.clientId,
    displayName: message.senderName
  });

  return (
    <Avatar
      src={userAvatar?.src}
      color={userAvatar?.color}
      initials={userAvatar?.initials}
      alt={userAvatar?.displayName}
      size="sm"
    />
  );
};
```

### 6. Automatic Caching and Persistence

The hooks automatically handle caching and persistence:

- Storing avatar data manually
- Checking if avatars exist before creating them
- Managing cache invalidation
- Synchronizing avatar changes across components

### 7. Image Recommendations

- **Dimensions**: 256x256 pixels (1:1 aspect ratio)
- **Formats**: JPG, PNG, WebP, SVG
- **File Size**: Less than 5MB
- **Loading**: Images are loaded lazily for performance

### 8. Performance Considerations

- Avatars are cached automatically to prevent regeneration
- Colors are generated deterministically for consistency
- localStorage persistence is enabled by default
- Cache size can be limited with option `maxCacheSize`
- The hooks prevent unnecessary re-renders through proper memoization

## Other Features

### Avatar Change Notifications

Listen for avatar changes across the application using the base hook: `useAvatar`

```tsx
import { useAvatar } from './context/AvatarContext';

useEffect(() => {
  const { onAvatarChange } = useAvatar();
  const unsubscribe = onAvatarChange((type, id, newAvatar, previousAvatar) => {
    if (type === 'user') {
      console.log(`User ${id} changed avatar`);
    } else {
      console.log(`Room ${id} changed avatar`);
    }
  });

  return unsubscribe;
}, []);
```

### Data Export/Import

Export and import avatar data for backup or migration:

```tsx
import { useAvatar } from './context/AvatarContext';

const { exportAvatars, importAvatars } = useAvatar();

// Export all avatar data
const avatarData = exportAvatars();

// Import avatar data
importAvatars(avatarData);
```

### Cache Management

Clear avatars when needed:

```tsx
import { useAvatar } from './context/AvatarContext';

const { clearUserAvatars, clearRoomAvatars, clearAllAvatars } = useAvatar();

// Clear all user avatars
clearUserAvatars();

// Clear all room avatars  
clearRoomAvatars();

// Clear everything
clearAllAvatars();
```

## Edge Cases

The Avatar API handles several edge cases:

1. **Image Loading Failures**: Falls back to initials if the image fails to load
2. **Empty Display Names**: Generates '??' as initials if no display name is provided
3. **Invalid Image URLs**: Shows initials when image URLs are invalid
4. **Caching**: Avatars are cached to prevent unnecessary re-generation
5. **Deterministic Colors**: Colors are generated deterministically based on ID to ensure consistency
6. **Name Cleaning**: Removes common prefixes (Mr., Dr., etc.) and special characters for better initials
7. **Cache Size Limits**: Automatically manages cache size to prevent memory issues
8. **Error Handling**: Graceful error handling with optional error callbacks

## Accessibility

The Avatar component includes proper accessibility features:

- **Alt Text**: Uses `alt` prop for screen readers
- **Keyboard Navigation**: Supports Enter and Space key activation when clickable
- **Focus Management**: Proper focus indicators for interactive avatars
- **ARIA Labels**: Appropriate `aria-label` and `role` attributes
- **Color Contrast**: Default color palette ensures good contrast ratios
