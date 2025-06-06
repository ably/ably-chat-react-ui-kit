/**
 * Atomic UI Components
 *
 * This module exports all atomic components that serve as the foundational
 * building blocks for the chat UI.
 */

// Form and Input Components
export { default as Button } from './Button';
export { default as TextInput } from './TextInput';

// Visual and Media Components
export { default as Icon } from './Icon';
export { default as Avatar } from './Avatar';

// Feedback and Status Components
export { TypingDots } from './TypingDots';

// Tooltip Components
export { TooltipSurface } from './TooltipSurface';
export { TooltipArrow } from './TooltipArrow';

// Re-export types for external use
export type { AvatarData } from './Avatar';
