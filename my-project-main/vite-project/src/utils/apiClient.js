import { auth } from '../firebase'

// In production the API lives at /api/* on the same Vercel deployment as the
// app, so requests should be relative (no separate backend to host). In
// local dev, default to the standalone server (`npm run server`) on :4010
// (see server/.env PORT), unless VITE_API_BASE_URL overrides it either way.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.PROD ? '' : 'http://127.0.0.1:4010')

export async function apiFetch(path, options = {}) {
  const user = auth.currentUser
  if (!user) throw new Error('You must be signed in to call the API.')

  const token = await user.getIdToken()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || `Request failed with status ${response.status}`)
  return data
}
