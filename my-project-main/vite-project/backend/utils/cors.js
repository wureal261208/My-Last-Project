/**
 * Builds cors() options from CLIENT_ORIGIN, which can be a single origin or
 * a comma-separated list (useful locally since "localhost" and "127.0.0.1"
 * count as different origins to the browser even though they're the same
 * machine).
 */
export function corsOptions() {
  const raw = process.env.CLIENT_ORIGIN
  if (!raw) return { origin: true }

  const allowed = raw.split(',').map((item) => item.trim()).filter(Boolean)
  if (allowed.length <= 1) return { origin: allowed[0] || true }

  return {
    origin(requestOrigin, callback) {
      if (!requestOrigin || allowed.includes(requestOrigin)) return callback(null, true)
      callback(new Error(`Origin ${requestOrigin} is not allowed by CORS.`))
    },
  }
}
