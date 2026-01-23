/**
 * Feature Flags Configuration
 *
 * Centralized feature flag management for gradual rollout of new features.
 * All flags default to false for safety.
 */

export const FeatureFlags = {
  // Real-Time Features
  REALTIME: process.env.NEXT_PUBLIC_FEATURE_REALTIME === 'true',
  PRESENCE: process.env.NEXT_PUBLIC_FEATURE_PRESENCE === 'true',
  BLITZ_QUIZ: process.env.NEXT_PUBLIC_FEATURE_BLITZ_QUIZ === 'true',
  LIVE_SESSIONS: process.env.NEXT_PUBLIC_FEATURE_LIVE_SESSIONS === 'true',

  // AI Features
  AI_COACH: process.env.NEXT_PUBLIC_FEATURE_AI_COACH === 'true',
  AI_HINTS: process.env.NEXT_PUBLIC_FEATURE_AI_HINTS === 'true',
  AI_GENERATION: process.env.NEXT_PUBLIC_FEATURE_AI_GENERATION === 'true',
  AI_GAP_ANALYSIS: process.env.NEXT_PUBLIC_FEATURE_AI_GAP_ANALYSIS === 'true',

  // Advanced Features
  PEER_REVIEW: process.env.NEXT_PUBLIC_FEATURE_PEER_REVIEW === 'true',
  GROUP_STREAKS: process.env.NEXT_PUBLIC_FEATURE_GROUP_STREAKS === 'true',
  KNOWLEDGE_MAP: process.env.NEXT_PUBLIC_FEATURE_KNOWLEDGE_MAP === 'true',
  CERTIFICATIONS: process.env.NEXT_PUBLIC_FEATURE_CERTIFICATIONS === 'true',
} as const;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof FeatureFlags): boolean {
  return FeatureFlags[feature];
}

/**
 * Throws an error if a feature is not enabled
 * Useful for server-side validation
 */
export function requireFeature(feature: keyof typeof FeatureFlags): void {
  if (!FeatureFlags[feature]) {
    throw new Error(`Feature '${feature}' is not enabled`);
  }
}

/**
 * Hook for checking feature flags in React components
 */
export function useFeatureFlag(feature: keyof typeof FeatureFlags): boolean {
  return FeatureFlags[feature];
}

/**
 * Server-side configuration (not exposed to client)
 */
export const ServerConfig = {
  // Socket.io
  SOCKET_IO_PATH: process.env.SOCKET_IO_PATH || '/api/socketio',
  SOCKET_IO_CORS_ORIGIN: process.env.SOCKET_IO_CORS_ORIGIN || 'http://localhost:3000',

  // AI Configuration
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  AI_DAILY_REQUEST_LIMIT: Number.parseInt(process.env.AI_DAILY_REQUEST_LIMIT || '50', 10),
  AI_MONTHLY_REQUEST_LIMIT: Number.parseInt(process.env.AI_MONTHLY_REQUEST_LIMIT || '500', 10),
  AI_CACHE_TTL_HOURS: Number.parseInt(process.env.AI_CACHE_TTL_HOURS || '24', 10),
  AI_ENABLE_AGGRESSIVE_CACHE: process.env.AI_ENABLE_AGGRESSIVE_CACHE === 'true',

  // Trigger.dev
  TRIGGER_SECRET_KEY: process.env.TRIGGER_SECRET_KEY,
} as const;

/**
 * Validate server configuration on startup
 */
export function validateServerConfig(): void {
  const errors: string[] = [];

  // Check AI features
  if (FeatureFlags.AI_COACH || FeatureFlags.AI_HINTS || FeatureFlags.AI_GENERATION) {
    if (!ServerConfig.ANTHROPIC_API_KEY) {
      errors.push('ANTHROPIC_API_KEY is required when AI features are enabled');
    }
  }

  // Check real-time features
  if (FeatureFlags.REALTIME || FeatureFlags.LIVE_SESSIONS) {
    if (!ServerConfig.SOCKET_IO_CORS_ORIGIN) {
      errors.push('SOCKET_IO_CORS_ORIGIN is required when real-time features are enabled');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}
