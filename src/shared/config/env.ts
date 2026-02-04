// Environment configuration
// Production: Uses relative paths (/api/*) - Kong routes to backend services
// Development: Uses NEXT_PUBLIC_* env vars for port-forwarded services

export const ENV = {
  AUTH_SERVICE_URL:
    process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || '/api/auth',
  ACADEMY_SERVICE_URL:
    process.env.NEXT_PUBLIC_ACADEMY_SERVICE_URL || '/api/academy',
  EXAM_SERVICE_URL:
    process.env.NEXT_PUBLIC_EXAM_SERVICE_URL || '/api/exam',
  CONTENT_SERVICE_URL:
    process.env.NEXT_PUBLIC_CONTENT_SERVICE_URL || '/api/content',
  FILE_SERVICE_URL:
    process.env.NEXT_PUBLIC_FILE_SERVICE_URL || '/api/file',
  GRADING_SERVICE_URL:
    process.env.NEXT_PUBLIC_GRADING_SERVICE_URL || '/api/grading',
  AUDIO_SERVICE_URL:
    process.env.NEXT_PUBLIC_AUDIO_SERVICE_URL || '/api/audio',
} as const;
