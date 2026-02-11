/**
 * Socket.io API Route
 *
 * This route provides status information about the Socket.io server.
 * The actual Socket.io server is initialized in the custom server (server.ts).
 *
 * This route is primarily for:
 * - Health checks
 * - Verifying Socket.io is properly configured
 * - Getting connection information
 *
 * Note: Socket.io initialization and event handlers are in server.ts
 */

import type { NextRequest } from 'next/server';
import { ServerConfig, requireFeature } from '@/lib/shared/feature-flags';

/**
 * GET handler - Returns Socket.io server status
 */
export async function GET(request: NextRequest) {
  try {
    requireFeature('REALTIME');

    return Response.json({
      status: 'ok',
      message: 'Socket.io server is running via custom server',
      path: ServerConfig.SOCKET_IO_PATH,
      config: {
        path: ServerConfig.SOCKET_IO_PATH,
        cors: {
          origin: ServerConfig.SOCKET_IO_CORS_ORIGIN,
        },
      },
      instructions: {
        development: 'Run `npm run dev` to start the custom server with Socket.io',
        production: 'Run `npm run build && npm run start` for production',
      },
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
 * POST handler - Health check endpoint
 */
export async function POST(request: NextRequest) {
  try {
    requireFeature('REALTIME');

    const body = await request.json().catch(() => ({}));

    return Response.json({
      status: 'ok',
      message: 'Socket.io health check passed',
      timestamp: new Date().toISOString(),
      receivedData: body,
    });
  } catch (error) {
    return Response.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Health check failed',
      },
      { status: 500 }
    );
  }
}
