import '@testing-library/jest-dom';

import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { useComponents } from '../../hooks/use-components.tsx';
import { ComponentsProvider } from '../../providers/components-provider.tsx';

// A marker component stands in for any overridable slot — the tests only
// need to tell which component was selected, not exercise real rendering.
const makeMarker =
  (id: string) =>
  // eslint-disable-next-line react/display-name
  () => <span data-testid={id} />;

const DefaultAvatar = makeMarker('default-avatar');
const CustomAvatar = makeMarker('custom-avatar');
const ParentEmojiPicker = makeMarker('parent-emoji-picker');
const ChildEmojiPicker = makeMarker('child-emoji-picker');

/**
 * Probes read the context and render whichever slot the tests care about,
 * falling back to a default when no override is in scope and rendering
 * nothing when the override is `null`.
 */
const AvatarProbe = () => {
  const { Avatar = DefaultAvatar } = useComponents();
  if (Avatar === null) return <span data-testid="avatar-hidden" />;
  return <Avatar />;
};

const EmojiPickerProbe = () => {
  const { EmojiPicker } = useComponents();
  if (!EmojiPicker) return <span data-testid="emoji-picker-absent" />;
  return <EmojiPicker />;
};

describe('ComponentsProvider', () => {
  afterEach(cleanup);

  it('returns an empty override set when no provider wraps the tree', () => {
    render(<AvatarProbe />);
    expect(screen.getByTestId('default-avatar')).toBeInTheDocument();
  });

  it('supplies overrides to descendants', () => {
    render(
      <ComponentsProvider overrides={{ Avatar: CustomAvatar }}>
        <AvatarProbe />
      </ComponentsProvider>
    );

    expect(screen.queryByTestId('default-avatar')).not.toBeInTheDocument();
    expect(screen.getByTestId('custom-avatar')).toBeInTheDocument();
  });

  it('treats a null override as "do not render"', () => {
    render(
      <ComponentsProvider overrides={{ Avatar: null }}>
        <AvatarProbe />
      </ComponentsProvider>
    );

    expect(screen.getByTestId('avatar-hidden')).toBeInTheDocument();
    expect(screen.queryByTestId('default-avatar')).not.toBeInTheDocument();
  });

  it('merges overrides from nested providers, with child entries taking precedence', () => {
    render(
      <ComponentsProvider
        overrides={{ Avatar: CustomAvatar, EmojiPicker: ParentEmojiPicker }}
      >
        <ComponentsProvider overrides={{ EmojiPicker: ChildEmojiPicker }}>
          <AvatarProbe />
          <EmojiPickerProbe />
        </ComponentsProvider>
      </ComponentsProvider>
    );

    // Avatar inherited from the parent provider.
    expect(screen.getByTestId('custom-avatar')).toBeInTheDocument();
    // EmojiPicker was replaced at the child level.
    expect(screen.getByTestId('child-emoji-picker')).toBeInTheDocument();
    expect(screen.queryByTestId('parent-emoji-picker')).not.toBeInTheDocument();
  });

  it('lets a nested provider hide an inherited slot by setting it to null', () => {
    render(
      <ComponentsProvider overrides={{ Avatar: CustomAvatar }}>
        <ComponentsProvider overrides={{ Avatar: null }}>
          <AvatarProbe />
        </ComponentsProvider>
      </ComponentsProvider>
    );

    expect(screen.getByTestId('avatar-hidden')).toBeInTheDocument();
    expect(screen.queryByTestId('custom-avatar')).not.toBeInTheDocument();
  });
});
