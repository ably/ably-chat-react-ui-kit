import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { ChatSettings, ChatSettingsContext } from '../../context/chat-settings-context.tsx';
import { ChatSettingsProvider, DEFAULT_SETTINGS } from '../../providers/chat-settings-provider.tsx';

describe('ChatSettingsProvider', () => {
  describe('Default settings', () => {
    it('should provide default settings when no custom settings are provided', () => {
      const TestComponent = () => {
        const context = React.useContext(ChatSettingsContext);
        return (
          <div>
            <div data-testid="global-settings">{JSON.stringify(context?.globalSettings)}</div>
          </div>
        );
      };

      render(
        <ChatSettingsProvider>
          <TestComponent />
        </ChatSettingsProvider>
      );

      const globalSettings = JSON.parse(
        screen.getByTestId('global-settings').textContent ?? '{}'
      ) as ChatSettings;

      // Verify default settings are applied
      expect(globalSettings).toEqual(DEFAULT_SETTINGS);
      expect(globalSettings.allowMessageUpdates).toBe(true);
      expect(globalSettings.allowMessageDeletes).toBe(true);
      expect(globalSettings.allowMessageReactions).toBe(true);
    });
  });

  describe('Custom global settings', () => {
    it('should merge custom global settings with defaults', () => {
      const customGlobalSettings: Partial<ChatSettings> = {
        allowMessageUpdates: false,
      };

      const TestComponent = () => {
        const context = React.useContext(ChatSettingsContext);
        return (
          <div>
            <div data-testid="global-settings">{JSON.stringify(context?.globalSettings)}</div>
          </div>
        );
      };

      render(
        <ChatSettingsProvider initialGlobalSettings={customGlobalSettings}>
          <TestComponent />
        </ChatSettingsProvider>
      );

      const globalSettings = JSON.parse(
        screen.getByTestId('global-settings').textContent ?? '{}'
      ) as ChatSettings;

      // Verify custom settings are merged with defaults
      expect(globalSettings.allowMessageUpdates).toBe(false); // Custom setting
      expect(globalSettings.allowMessageDeletes).toBe(true); // Default setting
      expect(globalSettings.allowMessageReactions).toBe(true); // Default setting
    });
  });

  describe('Room-specific settings', () => {
    it('should provide room-specific settings that override global settings', () => {
      const customGlobalSettings: Partial<ChatSettings> = {
        allowMessageUpdates: false,
        allowMessageDeletes: false,
      };

      const roomSettings = {
        general: { allowMessageUpdates: true },
        announcements: {
          allowMessageUpdates: false,
          allowMessageDeletes: false,
          allowMessageReactions: false,
        },
      };

      const TestComponent = () => {
        const context = React.useContext(ChatSettingsContext);
        return (
          <div>
            <>
              <div data-testid="global-settings">{JSON.stringify(context?.globalSettings)}</div>
              <div data-testid="general-settings">
                {JSON.stringify(context?.getEffectiveSettings('general'))}
              </div>
              <div data-testid="announcements-settings">
                {JSON.stringify(context?.getEffectiveSettings('announcements'))}
              </div>
              <div data-testid="other-room-settings">
                {JSON.stringify(context?.getEffectiveSettings('other-room'))}
              </div>
            </>
          </div>
        );
      };

      render(
        <ChatSettingsProvider
          initialGlobalSettings={customGlobalSettings}
          initialRoomSettings={roomSettings}
        >
          <TestComponent />
        </ChatSettingsProvider>
      );

      // Parse settings from rendered components
      const globalSettings = JSON.parse(
        screen.getByTestId('global-settings').textContent ?? '{}'
      ) as ChatSettings;
      const generalSettings = JSON.parse(
        screen.getByTestId('general-settings').textContent ?? '{}'
      ) as ChatSettings;
      const announcementsSettings = JSON.parse(
        screen.getByTestId('announcements-settings').textContent ?? '{}'
      ) as ChatSettings;
      const otherRoomSettings = JSON.parse(
        screen.getByTestId('other-room-settings').textContent ?? '{}'
      ) as ChatSettings;

      expect(globalSettings.allowMessageUpdates).toBe(false);
      expect(globalSettings.allowMessageDeletes).toBe(false);
      expect(globalSettings.allowMessageReactions).toBe(true);

      expect(generalSettings.allowMessageUpdates).toBe(true);
      expect(generalSettings.allowMessageDeletes).toBe(false);
      expect(generalSettings.allowMessageReactions).toBe(true);

      expect(announcementsSettings.allowMessageUpdates).toBe(false);
      expect(announcementsSettings.allowMessageDeletes).toBe(false);
      expect(announcementsSettings.allowMessageReactions).toBe(false);

      expect(otherRoomSettings.allowMessageUpdates).toBe(false);
      expect(otherRoomSettings.allowMessageDeletes).toBe(false);
      expect(otherRoomSettings.allowMessageReactions).toBe(true);
    });
  });

  describe('getEffectiveSettings function', () => {
    it('should return global settings when no room name is provided', () => {
      const customGlobalSettings: Partial<ChatSettings> = {
        allowMessageUpdates: false,
      };

      const TestComponent = () => {
        const context = React.useContext(ChatSettingsContext);
        return (
          <div>
            <>
              <div data-testid="global-settings">{JSON.stringify(context?.globalSettings)}</div>
              <div data-testid="no-room-settings">
                {JSON.stringify(context?.getEffectiveSettings())}
              </div>
            </>
          </div>
        );
      };

      render(
        <ChatSettingsProvider initialGlobalSettings={customGlobalSettings}>
          <TestComponent />
        </ChatSettingsProvider>
      );

      const globalSettings = JSON.parse(
        screen.getByTestId('global-settings').textContent ?? '{}'
      ) as ChatSettings;
      const noRoomSettings = JSON.parse(
        screen.getByTestId('no-room-settings').textContent ?? '{}'
      ) as ChatSettings;

      expect(noRoomSettings).toEqual(globalSettings);
    });

    it('should return frozen objects to prevent accidental mutations', () => {
      const TestComponent = () => {
        const context = React.useContext(ChatSettingsContext);
        const settings = context?.getEffectiveSettings('room');
        const isFrozen = Object.isFrozen(settings);

        return (
          <div>
            <div data-testid="is-frozen">{String(isFrozen)}</div>
          </div>
        );
      };

      render(
        <ChatSettingsProvider>
          <TestComponent />
        </ChatSettingsProvider>
      );

      expect(screen.getByTestId('is-frozen').textContent).toBe('true');
    });
  });
});
