/**
 * Custom Next.js Server with Socket.io Support
 *
 * This custom server is required for Socket.io to work in production.
 * Next.js App Router doesn't provide direct access to the HTTP server,
 * so we need to create our own server that wraps Next.js.
 *
 * Usage:
 *   Development: npm run dev
 *   Production: npm run build && npm run start
 */

const { createServer } = require("node:http");
const { parse } = require("node:url");
const next = require("next");
const { Server: SocketIOServer } = require("socket.io");

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
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  });

  // Initialize Socket.io
  const io = new SocketIOServer(server, {
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

  // Import and set Socket.io server for use in command handlers
  // We'll do this dynamically to avoid import issues
  let setSocketIOServer;
  try {
    // Try ESM import
    import("./src/lib/realtime/socket-server.js").then((module) => {
      setSocketIOServer = module.setSocketIOServer;
      setSocketIOServer(io);
      console.log("[Socket.io] Server registered successfully");
    }).catch(() => {
      console.warn("[Socket.io] Could not import socket-server module. Events may not work.");
    });
  } catch (err) {
    console.warn("[Socket.io] Could not import socket-server module:", err.message);
  }

  console.log(`[Socket.io] Initializing server on path: /api/socketio`);

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        console.log(`[Socket.io] Connection rejected: No token provided`);
        return next(new Error("Authentication token missing"));
      }

      // Import auth dynamically
      const { auth } = await import("./src/lib/auth/auth.js");

      // Verify session token with Better Auth
      const session = await auth.api.getSession({
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
    socket.on("presence:join", async (data) => {
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
    socket.on("presence:leave", async (data) => {
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
    socket.on("typing:start", (data) => {
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

    socket.on("typing:stop", (data) => {
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
│  → Local:    http://${hostname}:${port}${' '.repeat(Math.max(0, 26 - hostname.length - port.toString().length))}│
│  → Socket.io: ws://${hostname}:${port}/api/socketio${' '.repeat(Math.max(0, 13 - hostname.length - port.toString().length))}│
│                                                  │
│  Mode: ${dev ? "Development" : "Production"}${' '.repeat(dev ? 24 : 26)}│
│  Ready in ${process.uptime().toFixed(1)}s${' '.repeat(Math.max(0, 32 - process.uptime().toFixed(1).length))}│
└─────────────────────────────────────────────────┘
    `);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
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
