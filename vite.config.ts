import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      exclude: [
        'src/stories/*',
        'src/test/**/*',
        '.storybook/**/*'
      ]
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AblyChatReactUIKit',
      fileName: 'ably/chat-react-ui-kit',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: [
        'ably',
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@ably/chat',
        '@ably/chat/react'
      ]
    },
    sourcemap: true
  }
});