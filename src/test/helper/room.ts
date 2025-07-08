import { ChatClient, ErrorCode, ErrorInfo, Room, RoomOptions, RoomStatus } from '@ably/chat';
import { vi } from 'vitest';

import { randomRoomName } from './identifier.ts';

// Wait 5 seconds for the room to reach the expected status
export const waitForRoomStatus = async (room: Room, expected: RoomStatus, timeout?: number) => {
  return vi.waitUntil(() => room.status === expected, timeout ?? 5000);
};

// Wait 5 seconds for the room error to reach an expected code
export const waitForErrorCode = async (error: ErrorInfo, expected: ErrorCode) => {
  return vi.waitUntil(() => (error.code as ErrorCode) === expected, 5000);
};

// Gets a random room with default options from the chat client
export const getRandomRoom = async (chat: ChatClient, options?: RoomOptions): Promise<Room> =>
  chat.rooms.get(randomRoomName(), options);
