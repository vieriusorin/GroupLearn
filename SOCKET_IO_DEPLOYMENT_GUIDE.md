# Socket.io Production Deployment Guide

**Version**: 1.0
**Last Updated**: 2026-02-10
**Status**: Production Ready

---

## 📋 Overview

This guide covers deploying the Learning Cards application with Socket.io real-time features enabled. The custom server setup ensures Socket.io works correctly in both development and production environments.

### Why a Custom Server?

Next.js App Router doesn't provide direct access to the underlying HTTP server, which Socket.io requires to attach WebSocket handlers. Our custom server (`server.ts`) wraps Next.js and provides this access.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│  Custom Server (server.ts)              │
│  ┌────────────────┐  ┌────────────────┐ │
│  │  Next.js App   │  │  Socket.io     │ │
│  │  Handler       │  │  Server        │ │
│  └────────────────┘  └────────────────┘ │
│           │                  │           │
│           └──────HTTP────────┘           │
└─────────────────────────────────────────┘
            │
            ↓
   Port 3000 (configurable)
```

**Key Components:**
1. **server.ts**: Custom Node.js server that creates HTTP server and initializes Socket.io
2. **Socket.io Server**: Handles WebSocket connections, authentication, and real-time events
3. **Next.js App**: Handles all HTTP requests (pages, API routes, static files)

---

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Set up environment variables (see below)
cp .env.example .env.local

# Run with Socket.io
npm run dev

# Alternative: Run without Socket.io (standard Next.js)
npm run dev:next
```

### Production

```bash
# Build the application
npm run build

# Start production server with Socket.io
npm run start

# Alternative: Start without Socket.io (standard Next.js)
npm run start:next
```

---

## ⚙️ Environment Variables

### Required for Socket.io

Add these to your `.env.local` (development) or deployment environment (production):

```bash
# Enable real-time features
NEXT_PUBLIC_FEATURE_REALTIME=true
NEXT_PUBLIC_FEATURE_LIVE_SESSIONS=true
NEXT_PUBLIC_FEATURE_BLITZ_QUIZ=true

# Socket.io Configuration
SOCKET_IO_PATH=/api/socketio
SOCKET_IO_CORS_ORIGIN=http://localhost:3000

# Server Configuration
PORT=3000
HOSTNAME=localhost
NODE_ENV=development
```

### Production Environment Variables

```bash
# Production URLs
NEXT_PUBLIC_APP_URL=https://your-domain.com
SOCKET_IO_CORS_ORIGIN=https://your-domain.com

# Socket.io path (must match client)
SOCKET_IO_PATH=/api/socketio

# Server
PORT=3000
NODE_ENV=production

# Database (existing variables)
DATABASE_URL=postgresql://...
DIRECT_DATABASE_URL=postgresql://...

# Auth (existing variables)
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://your-domain.com
```

---

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
FROM node:25-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run custom server with Socket.io
CMD ["node", "--import", "tsx/esm", "server.ts"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/learning_cards
      - SOCKET_IO_CORS_ORIGIN=https://your-domain.com
      - NEXT_PUBLIC_APP_URL=https://your-domain.com
      - NEXT_PUBLIC_FEATURE_REALTIME=true
      - NEXT_PUBLIC_FEATURE_LIVE_SESSIONS=true
      - NEXT_PUBLIC_FEATURE_BLITZ_QUIZ=true
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=learning_cards
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    restart: unless-stopped

volumes:
  postgres_data:
```

---

## ☁️ Cloud Platform Deployment

### Vercel

⚠️ **Vercel Limitation**: Vercel's serverless functions don't support WebSockets directly. Use Vercel with a separate WebSocket server or choose an alternative platform.

**Option 1: Hybrid Deployment**
- Deploy Next.js app to Vercel (without Socket.io)
- Deploy Socket.io server separately (Railway, Render, DigitalOcean)
- Configure client to connect to external Socket.io server

**Option 2: Use Alternative Platform** (Recommended)

### Railway

Railway supports custom servers and is ideal for Socket.io.

1. **Connect Repository**
   - Go to Railway dashboard
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

2. **Configure Environment Variables**
   - Add all production environment variables
   - Set `NODE_ENV=production`
   - Set `PORT=3000` (Railway provides this automatically)

3. **Configure Start Command**
   ```bash
   npm run build && npm run start
   ```

4. **Deploy**
   - Railway auto-deploys on git push
   - WebSocket connections work out of the box

### Render

1. **Create New Web Service**
   - Connect your GitHub repository
   - Environment: Node
   - Build Command: `npm run build`
   - Start Command: `npm run start`

2. **Environment Variables**
   - Add all production variables
   - Set `NODE_ENV=production`

3. **WebSocket Support**
   - Render supports WebSockets by default
   - No additional configuration needed

### DigitalOcean App Platform

1. **Create App**
   - Connect repository
   - Select Node.js as environment

2. **Configure Build**
   - Build Command: `npm run build`
   - Run Command: `npm run start`

3. **Environment Variables**
   - Add production variables in App Platform dashboard

4. **Enable WebSockets**
   - WebSockets are enabled by default
   - Ensure health check path excludes Socket.io path

### AWS Elastic Beanstalk

1. **Create Application**
   - Platform: Node.js
   - Upload code or connect to CodeCommit

2. **Configure Nginx Proxy**
   Add `.ebextensions/nginx.config`:
   ```yaml
   files:
     /etc/nginx/conf.d/websockets.conf:
       mode: "000644"
       owner: root
       group: root
       content: |
         upstream nodejs {
           server 127.0.0.1:8081;
           keepalive 256;
         }

         server {
           listen 8080;

           location / {
             proxy_pass http://nodejs;
             proxy_http_version 1.1;
             proxy_set_header Upgrade $http_upgrade;
             proxy_set_header Connection "upgrade";
             proxy_set_header Host $host;
             proxy_cache_bypass $http_upgrade;
           }
         }
   ```

3. **Environment Variables**
   - Configure in Elastic Beanstalk console

---

## 🔧 Configuration Details

### Custom Server (server.ts)

**Features:**
- Wraps Next.js with custom HTTP server
- Initializes Socket.io with proper CORS
- Handles authentication via Better Auth
- Manages connection lifecycle
- Implements graceful shutdown

**Connection Flow:**
1. Client connects with authentication token
2. Server verifies token with Better Auth
3. User data attached to socket session
4. User joins personal room (`user:{userId}`)
5. Ready to emit/receive real-time events

### Socket.io Events

**Client → Server:**
- `presence:join` - Join group or session room
- `presence:leave` - Leave group or session room
- `typing:start` - Start typing indicator
- `typing:stop` - Stop typing indicator

**Server → Client:**
- `connection:confirmed` - Connection successful
- `session:started` - Quiz session started
- `session:card_revealed` - New question revealed
- `session:answer_submitted` - Answer recorded
- `session:leaderboard_updated` - Rankings updated
- `session:ended` - Session completed
- `presence:user_joined` - User joined room
- `presence:user_left` - User left room

---

## 🧪 Testing Socket.io in Production

### Health Check

```bash
# Check if Socket.io API route is accessible
curl https://your-domain.com/api/socketio
```

Expected response:
```json
{
  "status": "ok",
  "message": "Socket.io server is running via custom server",
  "path": "/api/socketio"
}
```

### Connection Test

Use the browser console on your deployed app:

```javascript
// Connect to Socket.io
const socket = io('wss://your-domain.com', {
  path: '/api/socketio',
  auth: {
    token: 'your-auth-token'
  }
});

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);
});

socket.on('connection:confirmed', (data) => {
  console.log('✅ Confirmed:', data);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection failed:', error);
});
```

### Load Testing

Use a tool like `artillery` to test Socket.io under load:

```yaml
# artillery-socketio.yml
config:
  target: 'wss://your-domain.com'
  phases:
    - duration: 60
      arrivalRate: 10
  socketio:
    path: '/api/socketio'

scenarios:
  - name: "Connect and join session"
    engine: socketio
    flow:
      - emit:
          channel: "presence:join"
          data:
            sessionId: 1
      - think: 30
      - emit:
          channel: "presence:leave"
          data:
            sessionId: 1
```

Run test:
```bash
npm install -g artillery
artillery run artillery-socketio.yml
```

---

## 🔒 Security Considerations

### Authentication

- All Socket.io connections require valid Better Auth token
- Tokens are verified on every connection attempt
- User data is attached to socket session

### CORS Configuration

- Set `SOCKET_IO_CORS_ORIGIN` to your exact domain
- Never use `*` in production
- For multiple domains, provide array in code

### Rate Limiting

Consider adding rate limiting for Socket.io events:

```typescript
// In server.ts, add after authentication middleware
io.use(async (socket, next) => {
  // Implement rate limiting logic
  const userId = socket.data.userId;
  // Check request rate for user
  next();
});
```

---

## 📊 Monitoring

### Metrics to Track

1. **Connection Metrics**
   - Active connections count
   - Connection errors rate
   - Average connection duration

2. **Event Metrics**
   - Events emitted per second
   - Event processing time
   - Failed event deliveries

3. **Resource Metrics**
   - Memory usage
   - CPU usage
   - Network bandwidth

### Logging

The custom server includes comprehensive logging:
- Connection/disconnection events
- Room join/leave events
- Authentication failures
- Server errors

Check logs in your platform's dashboard:
- Railway: View in Logs tab
- Render: View in Logs section
- AWS: Check CloudWatch Logs

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Authentication token missing"

**Cause**: Client not sending auth token

**Fix**: Ensure client includes token in handshake:
```typescript
const socket = io(url, {
  auth: { token: sessionToken }
});
```

#### 2. CORS Error

**Cause**: CORS origin mismatch

**Fix**: Update `SOCKET_IO_CORS_ORIGIN` to match your domain exactly

#### 3. Connection Timeout

**Cause**: Firewall blocking WebSocket connections

**Fix**:
- Ensure port 3000 (or your configured port) is open
- Check if platform supports WebSockets
- Verify health check doesn't timeout Socket.io requests

#### 4. "Custom server not running"

**Cause**: Using `next start` instead of custom server

**Fix**: Use `npm run start` (which runs `tsx server.ts`)

---

## 🔄 Migration from Standard Next.js

If migrating from standard Next.js to custom server:

1. **Update Scripts**
   ```json
   {
     "dev": "tsx server.ts",
     "start": "NODE_ENV=production tsx server.ts"
   }
   ```

2. **Update Client Code**
   No changes needed - client code remains the same

3. **Test Locally**
   ```bash
   npm run dev
   # Verify Socket.io connects at http://localhost:3000
   ```

4. **Deploy**
   Update deployment scripts to use new start command

---

## 📚 Additional Resources

- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Next.js Custom Server](https://nextjs.org/docs/pages/building-your-application/configuring/custom-server)
- [Better Auth Documentation](https://www.better-auth.com/docs)

---

## ✅ Production Checklist

Before deploying to production:

- [ ] Environment variables configured (especially `SOCKET_IO_CORS_ORIGIN`)
- [ ] Custom server tested locally
- [ ] Authentication working with Socket.io
- [ ] CORS properly configured for production domain
- [ ] SSL/TLS certificate installed (wss:// requires HTTPS)
- [ ] Load testing completed
- [ ] Monitoring and logging set up
- [ ] Error handling tested
- [ ] Graceful shutdown working
- [ ] Health checks configured
- [ ] Database migrations run
- [ ] Feature flags enabled (REALTIME, LIVE_SESSIONS, BLITZ_QUIZ)

---

## 🆘 Support

For deployment issues:

1. Check logs in your platform's dashboard
2. Verify all environment variables are set
3. Test Socket.io connection from browser console
4. Review this guide's troubleshooting section
5. Check GitHub Issues for similar problems

---

**Last Updated**: 2026-02-10
**Maintainer**: Development Team
**Status**: Production Ready ✅
