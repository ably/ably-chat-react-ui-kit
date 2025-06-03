# Avatar API Documentation

This document provides comprehensive documentation for the Avatar API, including usage examples and best practices.

## Overview

The Avatar API provides a standardized way to manage and display avatars for users and rooms in the application. It consists of:

1. **AvatarProvider**: A context provider that manages avatar generation and caching
2. **Avatar Component**: A reusable component for displaying avatars
3. **AvatarEditor**: A component for customizing avatars
4. **AvatarData Interface**: A standardized structure for avatar data

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

The `AvatarProvider` is a context provider that centralizes avatar management and ensures consistency across the application.

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
    getAvatarForRoom, 
    setUserAvatar, 
    setRoomAvatar,
    getUserAvatars,
    getRoomAvatars
  } = useAvatar();
  
  // Get avatar for a user
  const userAvatar = getAvatarForUser('user123', 'John Doe');
  
  // Get avatar for a room
  const roomAvatar = getAvatarForRoom('room456', 'General Chat');
  
  // Update a user's avatar
  setUserAvatar('user123', { src: 'https://example.com/avatar.jpg' });
  
  // Update a room's avatar
  setRoomAvatar('room456', { color: 'bg-blue-500' });
  
  // Get all user avatars
  const allUserAvatars = getUserAvatars();
  
  // Get all room avatars
  const allRoomAvatars = getRoomAvatars();
  
  return (
    // Your component JSX
  );
};
```

## Avatar Component

The `Avatar` component displays a user or room avatar with fallback to initials when no image is available.

### Props

| Prop | Type | Description |
|------|------|-------------|
| src | string | URL to the avatar image |
| alt | string | Alternative text for the avatar image |
| color | string | Background color for the avatar (Tailwind CSS class) |
| size | 'sm' \| 'md' \| 'lg' \| 'xl' | Size of the avatar |
| initials | string | Custom initials to display when no image is available |
| onClick | () => void | Click handler for the avatar |

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

### Features

- Upload custom images
- Enter image URL
- Choose from preset avatars
- Select background colors
- Set custom initials
- Remove avatar

### Props

| Prop | Type | Description |
|------|------|-------------|
| currentAvatar | string | Current avatar URL |
| currentColor | string | Current avatar background color |
| displayName | string | Display name for the avatar |
| isOpen | boolean | Whether the editor is open |
| onClose | () => void | Callback when the editor is closed |
| onSave | (avatar: Partial<AvatarData>) => void | Callback when the avatar is saved |

### Usage Example

```tsx
const [showAvatarEditor, setShowAvatarEditor] = useState(false);
const { setUserAvatar } = useAvatar();

const handleAvatarSave = (avatarData: Partial<AvatarData>) => {
  setUserAvatar('user123', avatarData);
};

return (
  <>
    <button onClick={() => setShowAvatarEditor(true)}>Edit Avatar</button>
    
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

## Best Practices

### 1. Use the AvatarProvider

Always wrap your application with the `AvatarProvider` to ensure consistent avatar management:

```tsx
<AvatarProvider>
  <YourApp />
</AvatarProvider>
```

### 2. Use the useAvatar Hook

Use the `useAvatar` hook to access avatar-related functionality:

```tsx
const { getAvatarForUser, getAvatarForRoom } = useAvatar();
```

### 3. Provide Meaningful Display Names

Always provide meaningful display names for avatars to ensure good initials generation:

```tsx
const userAvatar = getAvatarForUser('user123', 'John Doe'); // Will generate "JD" initials
```

### 4. Handle Avatar Updates Properly

When updating avatars, use the `setUserAvatar` or `setRoomAvatar` methods:

```tsx
setUserAvatar('user123', { 
  src: 'https://example.com/avatar.jpg',
  color: 'bg-blue-500',
  initials: 'JD'
});
```

### 5. Image Recommendations

- **Dimensions**: 256x256 pixels (1:1 aspect ratio)
- **Formats**: JPG, PNG, WebP, SVG
- **File Size**: Less than 5MB

## Edge Cases

The Avatar API handles several edge cases:

1. **Image Loading Failures**: Falls back to initials if the image fails to load
2. **Empty Display Names**: Generates '??' as initials if no display name is provided
3. **Caching**: Avatars are cached to prevent unnecessary re-generation
4. **Deterministic Colors**: Colors are generated deterministically based on ID to ensure consistency