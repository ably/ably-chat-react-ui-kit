declare global {
  var __ABLY_CHAT_REACT_UI_KIT_VERSION__: string;
}

globalThis.__ABLY_CHAT_REACT_UI_KIT_VERSION__ = '0.3.0';
export * from './app/index.js';
export * from './components/molecules/index.js';
export * from './context/index.js';
export * from './hooks/index.js';
export * from './providers/index.js';
import './style.css';
