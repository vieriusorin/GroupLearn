import type { NextRequest } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'node:http';
import { ServerConfig, requireFeature } from '@/lib/shared/feature-flags';
import { auth } from '@/lib/auth/auth';

// Store Socket.io server instance
let io: SocketIOServer | null = null;

/**
 * Initialize Socket.io server
 * This is called once when the API route is first accessed
 */
function initSocketIO(httpServer: HTTPServer): SocketIOServer {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    path: ServerConfig.SOCKET_IO_PATH,
    addTrailingSlash: false,
    cors: {
      origin: ServerConfig.SOCKET_IO_CORS_ORIGIN,
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token as string;

      if (!token) {
        return next(new Error('Authentication token missing'));
      }

      // Verify session token with Better Auth
      const session = await auth.api.getSession({
        headers: new Headers({
          Authorization: `Bearer ${token}`,
        }),
      });

      if (!session) {
        return next(new Error('Invalid session token'));
      }

      // Attach user data to socket
      socket.data.userId = session.user.id;
      socket.data.userEmail = session.user.email;

      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    console.log(`User connected: ${userId} (${socket.id})`);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${userId} (${socket.id}) - Reason: ${reason}`);
    });

    // Presence events
    socket.on('presence:join', async (data: { groupId?: number; sessionId?: string }) => {
      if (data.groupId) {
        socket.join(`group:${data.groupId}`);
        io?.to(`group:${data.groupId}`).emit('presence:user_joined', {
          userId,
          groupId: data.groupId,
        });
      }

      if (data.sessionId) {
        socket.join(`session:${data.sessionId}`);
        io?.to(`session:${data.sessionId}`).emit('presence:user_joined', {
          userId,
          sessionId: data.sessionId,
        });
      }
    });

    socket.on('presence:leave', async (data: { groupId?: number; sessionId?: string }) => {
      if (data.groupId) {
        socket.leave(`group:${data.groupId}`);
        io?.to(`group:${data.groupId}`).emit('presence:user_left', {
          userId,
          groupId: data.groupId,
        });
      }

      if (data.sessionId) {
        socket.leave(`session:${data.sessionId}`);
        io?.to(`session:${data.sessionId}`).emit('presence:user_left', {
          userId,
          sessionId: data.sessionId,
        });
      }
    });
  });

  return io;
}

/**
 * GET handler - Returns Socket.io server status
 */
export async function GET(request: NextRequest) {
  try {
    requireFeature('REALTIME');

    return Response.json({
      status: 'ok',
      message: 'Socket.io server is running',
      path: ServerConfig.SOCKET_IO_PATH,
    });
  } catch (error) {
    return Response.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Feature not enabled',
      },
      { status: 403 }
    );
  }
}

/**
 * POST handler - Initializes Socket.io server
 * Called by custom server or during development
 */
export async function POST(request: NextRequest) {
  try {
    requireFeature('REALTIME');

    // In Next.js App Router, we can't directly access the HTTP server
    // This endpoint exists for compatibility but actual Socket.io setup
    // should be done via custom server or alternative approach

    return Response.json({
      status: 'ok',
      message: 'Socket.io initialization endpoint',
      note: 'Requires custom server setup for production use',
    });
  } catch (error) {
    return Response.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Initialization failed',
      },
      { status: 500 }
    );
  }
}

/**
 * Export Socket.io server instance for use in other parts of the application
 */
export function getSocketIO(): SocketIOServer | null {
  return io;
}
