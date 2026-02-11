/**
 * React Hooks for Socket.io Integration
 */

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/hooks/auth';
import {
  initSocket,
  getSocket,
  disconnectSocket,
  isSocketConnected,
  joinRoom,
  leaveRoom,
  updatePresence,
} from '@/lib/realtime/socket-client';
import type { TypedSocket } from '@/lib/realtime/socket-types';
import { FeatureFlags } from '@/lib/shared/feature-flags';

/**
 * Initialize and manage Socket.io connection
 *
 * Automatically connects/disconnects based on authentication status
 */
export function useSocket() {
  const { user } = useSession();
  const [socket, setSocket] = useState<TypedSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!FeatureFlags.REALTIME) {
      return;
    }

    if (!user) {
      // Disconnect if user logs out
      if (socket) {
        disconnectSocket();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Initialize socket with session token
    const sessionToken = user.id; // Or use actual session token
    const socketInstance = initSocket(sessionToken);
    setSocket(socketInstance);

    // Update connection status
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);

    // Set initial state
    setIsConnected(socketInstance.connected);

    return () => {
      socketInstance.off('connect', handleConnect);
      socketInstance.off('disconnect', handleDisconnect);
    };
  }, [user]);

  return {
    socket,
    isConnected,
  };
}

/**
 * Hook for presence management in a group
 *
 * @param groupId - Group ID to track presence in
 * @param enabled - Whether presence tracking is enabled
 */
export function usePresence(groupId: number | null, enabled = true) {
  const { socket, isConnected } = useSocket();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!enabled || !isConnected || !socket || !groupId || !FeatureFlags.PRESENCE) {
      return;
    }

    // Join group presence
    joinRoom('group', groupId);

    // Listen for presence updates
    const handleUserJoined = (payload: { userId: string; groupId?: number }) => {
      if (payload.groupId === groupId) {
        setOnlineUsers((prev) => [...new Set([...prev, payload.userId])]);
      }
    };

    const handleUserLeft = (payload: { userId: string; groupId?: number }) => {
      if (payload.groupId === groupId) {
        setOnlineUsers((prev) => prev.filter((id) => id !== payload.userId));
      }
    };

    socket.on('presence:user_joined', handleUserJoined);
    socket.on('presence:user_left', handleUserLeft);

    // Heartbeat to maintain presence
    const heartbeatInterval = setInterval(() => {
      if (document.hasFocus()) {
        updatePresence('online');
      } else {
        updatePresence('away');
      }
    }, 30000); // Every 30 seconds

    return () => {
      socket.off('presence:user_joined', handleUserJoined);
      socket.off('presence:user_left', handleUserLeft);
      clearInterval(heartbeatInterval);
      leaveRoom('group', groupId);
    };
  }, [socket, isConnected, groupId, enabled]);

  return {
    onlineUsers,
    isConnected,
  };
}

/**
 * Hook for live session events
 *
 * @param sessionId - Live session ID
 * @param enabled - Whether to listen to session events
 */
export function useLiveSession(sessionId: number | null, enabled = true) {
  const { socket, isConnected } = useSocket();
  const [sessionState, setSessionState] = useState<{
    status: 'waiting' | 'active' | 'ended';
    currentCardIndex: number;
    leaderboard: any[];
  }>({
    status: 'waiting',
    currentCardIndex: 0,
    leaderboard: [],
  });

  useEffect(() => {
    if (!enabled || !isConnected || !socket || !sessionId || !FeatureFlags.LIVE_SESSIONS) {
      return;
    }

    // Join session room
    joinRoom('session', sessionId);

    // Listen for session events
    socket.on('session:started', (payload) => {
      if (payload.sessionId === sessionId) {
        setSessionState((prev) => ({ ...prev, status: 'active' }));
      }
    });

    socket.on('session:card_revealed', (payload) => {
      if (payload.sessionId === sessionId) {
        setSessionState((prev) => ({
          ...prev,
          currentCardIndex: payload.cardIndex,
        }));
      }
    });

    socket.on('session:leaderboard_updated', (payload) => {
      if (payload.sessionId === sessionId) {
        setSessionState((prev) => ({
          ...prev,
          leaderboard: payload.leaderboard,
        }));
      }
    });

    socket.on('session:ended', (payload) => {
      if (payload.sessionId === sessionId) {
        setSessionState((prev) => ({
          ...prev,
          status: 'ended',
          leaderboard: payload.finalLeaderboard,
        }));
      }
    });

    return () => {
      socket.off('session:started');
      socket.off('session:card_revealed');
      socket.off('session:leaderboard_updated');
      socket.off('session:ended');
      leaveRoom('session', sessionId);
    };
  }, [socket, isConnected, sessionId, enabled]);

  return {
    sessionState,
    isConnected,
  };
}

/**
 * Hook for subscribing to specific Socket.io events
 *
 * @param event - Event name
 * @param handler - Event handler function
 * @param enabled - Whether to listen to events
 */
export function useSocketEvent<T>(
  event: string,
  handler: (payload: T) => void,
  enabled = true
) {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!enabled || !isConnected || !socket) {
      return;
    }

    socket.on(event, handler);

    return () => {
      socket.off(event, handler);
    };
  }, [socket, isConnected, event, handler, enabled]);
}
