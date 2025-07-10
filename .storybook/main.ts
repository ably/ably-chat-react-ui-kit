import type { StorybookConfig } from '@storybook/react-vite';
import * as path from 'node:path';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-onboarding', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  docs: {
    docsMode: true,
  },
  async viteFinal(originalConfig) {
    return {
      ...originalConfig,
      resolve: {
        ...originalConfig.resolve,
        alias: {
          ...(originalConfig.resolve?.alias ?? {}),
          '@ably/chat/react': path.resolve(__dirname, 'mocks/mock-ably-chat.ts'),
        },
      },
    };
  },
};
export default config;
