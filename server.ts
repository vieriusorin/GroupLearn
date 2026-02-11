/**
 * Custom Next.js Server with Socket.io Support
 *
 * This custom server is required for Socket.io to work in production.
 * Next.js App Router doesn't provide direct access to the HTTP server,
 * so we need to create our own server that wraps Next.js.
 *
 * Usage:
 *   Development: npm run dev:server
 *   Production: npm run build && npm run start:server
 */

import { createServer } from "node:http";
import { parse } from "node:url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import type { ServerToClientEvents, ClientToServerEvents } from "./src/lib/realtime/socket-types";
import { setSocketIOServer } from "./src/lib/realtime/socket-server";
import { auth as betterAuth } from "./src/lib/auth/better-auth";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  });

  // Initialize Socket.io
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(server, {
    path: "/api/socketio",
    addTrailingSlash: false,
    cors: {
      origin: dev
        ? ["http://localhost:3000", "http://127.0.0.1:3000"]
        : process.env.NEXT_PUBLIC_APP_URL || "*",
      credentials: true,
      methods: ["GET", "POST"],
    },
    // Production optimizations
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e6, // 1MB
    allowEIO3: true,
  });

  // Register Socket.io server for use in command handlers
  setSocketIOServer(io);

  console.log(`[Socket.io] Initializing server on path: /api/socketio`);

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token as string;

      if (!token) {
        console.log(`[Socket.io] Connection rejected: No token provided`);
        return next(new Error("Authentication token missing"));
      }

      // Verify session token with Better Auth
      const session = await betterAuth.api.getSession({
        headers: new Headers({
          Authorization: `Bearer ${token}`,
        }),
      });

      if (!session || !session.user) {
        console.log(`[Socket.io] Connection rejected: Invalid token`);
        return next(new Error("Invalid session token"));
      }

      // Attach user data to socket
      socket.data.userId = session.user.id;
      socket.data.userEmail = session.user.email;
      socket.data.userName = session.user.name;

      console.log(`[Socket.io] Authenticated: ${session.user.name} (${session.user.id})`);
      next();
    } catch (error) {
      console.error("[Socket.io] Authentication error:", error);
      next(new Error("Authentication failed"));
    }
  });

  // Connection handler
  io.on("connection", (socket) => {
    const userId = socket.data.userId;
    const userName = socket.data.userName || "Unknown";

    console.log(`[Socket.io] User connected: ${userName} (${userId}) - Socket ${socket.id}`);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Emit connection confirmation
    socket.emit("connection:confirmed", {
      socketId: socket.id,
      userId,
      timestamp: new Date().toISOString(),
    });

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      console.log(`[Socket.io] User disconnected: ${userName} (${userId}) - Reason: ${reason}`);
    });

    // Presence events - Join group or session
    socket.on("presence:join", async (data: { groupId?: number; sessionId?: number }) => {
      if (data.groupId) {
        socket.join(`group:${data.groupId}`);
        io.to(`group:${data.groupId}`).emit("presence:user_joined", {
          userId,
          userName,
          groupId: data.groupId,
          timestamp: new Date().toISOString(),
        });
        console.log(`[Socket.io] ${userName} joined group:${data.groupId}`);
      }

      if (data.sessionId) {
        socket.join(`session:${data.sessionId}`);
        io.to(`session:${data.sessionId}`).emit("presence:user_joined", {
          userId,
          userName,
          sessionId: data.sessionId,
          timestamp: new Date().toISOString(),
        });
        console.log(`[Socket.io] ${userName} joined session:${data.sessionId}`);
      }
    });

    // Presence events - Leave group or session
    socket.on("presence:leave", async (data: { groupId?: number; sessionId?: number }) => {
      if (data.groupId) {
        socket.leave(`group:${data.groupId}`);
        io.to(`group:${data.groupId}`).emit("presence:user_left", {
          userId,
          userName,
          groupId: data.groupId,
          timestamp: new Date().toISOString(),
        });
        console.log(`[Socket.io] ${userName} left group:${data.groupId}`);
      }

      if (data.sessionId) {
        socket.leave(`session:${data.sessionId}`);
        io.to(`session:${data.sessionId}`).emit("presence:user_left", {
          userId,
          userName,
          sessionId: data.sessionId,
          timestamp: new Date().toISOString(),
        });
        console.log(`[Socket.io] ${userName} left session:${data.sessionId}`);
      }
    });

    // Typing indicators (for future chat features)
    socket.on("typing:start", (data: { groupId?: number; sessionId?: number }) => {
      if (data.groupId) {
        socket.to(`group:${data.groupId}`).emit("typing:user_started", {
          userId,
          userName,
          groupId: data.groupId,
        });
      }
      if (data.sessionId) {
        socket.to(`session:${data.sessionId}`).emit("typing:user_started", {
          userId,
          userName,
          sessionId: data.sessionId,
        });
      }
    });

    socket.on("typing:stop", (data: { groupId?: number; sessionId?: number }) => {
      if (data.groupId) {
        socket.to(`group:${data.groupId}`).emit("typing:user_stopped", {
          userId,
          groupId: data.groupId,
        });
      }
      if (data.sessionId) {
        socket.to(`session:${data.sessionId}`).emit("typing:user_stopped", {
          userId,
          sessionId: data.sessionId,
        });
      }
    });

    // Error handling
    socket.on("error", (error) => {
      console.error(`[Socket.io] Socket error for ${userName}:`, error);
    });
  });

  // Socket.io error handler
  io.engine.on("connection_error", (err) => {
    console.error("[Socket.io] Connection error:", {
      message: err.message,
      code: err.code,
      context: err.context,
    });
  });

  // Start server
  server.listen(port, () => {
    console.log(`
┌─────────────────────────────────────────────────┐
│  Learning Cards Server                           │
│                                                  │
│  → Local:    http://${hostname}:${port}
│  → Socket.io: ws://${hostname}:${port}/api/socketio
│                                                  │
│  Mode: ${dev ? "Development" : "Production"}                              │
│  Ready in ${process.uptime().toFixed(1)}s                           │
└─────────────────────────────────────────────────┘
    `);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n[Server] ${signal} received, shutting down gracefully...`);

    // Close Socket.io connections
    io.close(() => {
      console.log("[Socket.io] All connections closed");
    });

    // Close HTTP server
    server.close(() => {
      console.log("[Server] HTTP server closed");
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error("[Server] Forced shutdown after timeout");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
});
