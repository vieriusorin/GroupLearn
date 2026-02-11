# Custom Server Setup - Quick Reference

This project uses a **custom Next.js server** to enable Socket.io real-time features.

## 🚀 Quick Start

### Development

```bash
npm run dev
```

This runs the custom server at `http://localhost:3000` with Socket.io enabled.

### Production

```bash
npm run build
npm run start
```

## 📝 Scripts Explained

| Script | Command | Purpose |
|--------|---------|---------|
| `npm run dev` | `tsx server.ts` | Start custom server (development) |
| `npm run dev:next` | `next dev` | Standard Next.js dev (no Socket.io) |
| `npm run start` | `NODE_ENV=production tsx server.ts` | Start custom server (production) |
| `npm run start:next` | `next start` | Standard Next.js start (no Socket.io) |

## ⚙️ Environment Variables

Required for Socket.io to work:

```bash
# .env.local
NEXT_PUBLIC_FEATURE_REALTIME=true
NEXT_PUBLIC_FEATURE_LIVE_SESSIONS=true
NEXT_PUBLIC_FEATURE_BLITZ_QUIZ=true
SOCKET_IO_CORS_ORIGIN=http://localhost:3000
```

## 🔍 How It Works

1. **Custom Server** (`server.ts`):
   - Creates HTTP server
   - Initializes Socket.io
   - Handles WebSocket connections
   - Passes HTTP requests to Next.js

2. **Socket.io Integration**:
   - Authentication via Better Auth
   - Real-time events for live quiz
   - Room management (sessions, groups)

3. **Next.js App**:
   - Handles all page requests
   - API routes work normally
   - Server Components work normally

## 🧪 Testing

### Verify Socket.io is Running

1. Start server: `npm run dev`
2. Open browser: `http://localhost:3000`
3. Open console: Check for Socket.io connection logs

### Health Check

```bash
curl http://localhost:3000/api/socketio
```

Expected response:
```json
{
  "status": "ok",
  "message": "Socket.io server is running via custom server"
}
```

## 📚 Documentation

- **Full Deployment Guide**: See `SOCKET_IO_DEPLOYMENT_GUIDE.md`
- **Testing Guide**: See `TESTING_GUIDE_LIVE_QUIZ.md`
- **Phase 4 Summary**: See `IMPLEMENTATION_PHASE_4_COMPLETE.md`

## ⚠️ Important Notes

### DO use:
- `npm run dev` for development with Socket.io
- `npm run start` for production with Socket.io

### DON'T use:
- `npm run dev:next` unless debugging without Socket.io
- `npm run start:next` unless deploying without real-time features

## 🐳 Docker Support

See `SOCKET_IO_DEPLOYMENT_GUIDE.md` for complete Dockerfile and docker-compose.yml.

## 🔧 Troubleshooting

### Issue: "Cannot connect to Socket.io"

**Fix**: Ensure you're using `npm run dev`, not `npm run dev:next`

### Issue: "CORS error"

**Fix**: Update `SOCKET_IO_CORS_ORIGIN` in `.env.local` to match your URL

### Issue: "Authentication failed"

**Fix**: Verify user is logged in and session token is valid

## 🚀 Deployment

Choose a platform that supports WebSockets:

- ✅ Railway (Recommended)
- ✅ Render
- ✅ DigitalOcean App Platform
- ✅ AWS Elastic Beanstalk
- ✅ Docker (any platform)
- ❌ Vercel (requires workaround)

See `SOCKET_IO_DEPLOYMENT_GUIDE.md` for platform-specific instructions.

---

**Questions?** Check the comprehensive guides or contact the development team.
