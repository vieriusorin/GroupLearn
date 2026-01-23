/**
 * Socket.io Client Utility
 *
 * Manages Socket.io client connection with authentication and reconnection logic
 */

import { io } from 'socket.io-client';
import type { TypedSocket } from './socket-types';
import { FeatureFlags, ServerConfig } from '@/lib/shared/feature-flags';

let socket: TypedSocket | null = null;

/**
 * Initialize Socket.io client connection
 *
 * @param sessionToken - Better Auth session token
 * @returns TypedSocket instance
 */
export function initSocket(sessionToken: string): TypedSocket {
  if (!FeatureFlags.REALTIME) {
    throw new Error('Real-time features are not enabled');
  }

  // Return existing socket if already connected
  if (socket?.connected) {
    return socket;
  }

  // Disconnect existing socket if not connected
  if (socket) {
    socket.disconnect();
  }

  // Create new socket connection
  socket = io({
    path: ServerConfig.SOCKET_IO_PATH,
    auth: {
      token: sessionToken,
    },
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    timeout: 10000,
  }) as TypedSocket;

  // Connection event handlers
  socket.on('connect', () => {
    console.log('[Socket.io] Connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket.io] Disconnected:', reason);

    // Auto-reconnect on server disconnect
    if (reason === 'io server disconnect') {
      socket?.connect();
    }
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket.io] Connection error:', error.message);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('[Socket.io] Reconnected after', attemptNumber, 'attempts');
  });

  socket.on('reconnect_error', (error) => {
    console.error('[Socket.io] Reconnection error:', error.message);
  });

  socket.on('reconnect_failed', () => {
    console.error('[Socket.io] Reconnection failed after all attempts');
  });

  return socket;
}

/**
 * Get the current Socket.io instance
 *
 * @returns TypedSocket instance or null if not initialized
 */
export function getSocket(): TypedSocket | null {
  return socket;
}

/**
 * Disconnect and cleanup Socket.io connection
 */
export function disconnectSocket(): void {
  if (socket) {
    console.log('[Socket.io] Disconnecting...');
    socket.disconnect();
    socket = null;
  }
}

/**
 * Check if socket is connected
 */
export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}

/**
 * Join a room (group or session)
 *
 * @param roomType - 'group' or 'session'
 * @param roomId - ID of the group or session
 */
export function joinRoom(roomType: 'group' | 'session', roomId: number | string): void {
  if (!socket?.connected) {
    console.warn('[Socket.io] Cannot join room: socket not connected');
    return;
  }

  if (roomType === 'group') {
    socket.emit('presence:join', { groupId: Number(roomId) });
  } else {
    socket.emit('presence:join', { sessionId: String(roomId) });
  }
}

/**
 * Leave a room (group or session)
 *
 * @param roomType - 'group' or 'session'
 * @param roomId - ID of the group or session
 */
export function leaveRoom(roomType: 'group' | 'session', roomId: number | string): void {
  if (!socket?.connected) {
    return;
  }

  if (roomType === 'group') {
    socket.emit('presence:leave', { groupId: Number(roomId) });
  } else {
    socket.emit('presence:leave', { sessionId: String(roomId) });
  }
}

/**
 * Update presence status
 *
 * @param status - User status
 * @param metadata - Additional metadata
 */
export function updatePresence(
  status: 'online' | 'away' | 'offline',
  metadata?: { currentActivity?: string; currentPath?: number }
): void {
  if (!socket?.connected) {
    return;
  }

  socket.emit('presence:update', { status, metadata });
}
