import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AblyChatReactUIComponents',
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@ably/chat', 'ably'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@ably/chat': 'AblyChat',
          'ably': 'Ably'
        }
      }
    }
  }
});
