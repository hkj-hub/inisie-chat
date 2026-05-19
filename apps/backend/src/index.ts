import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { ApiError } from './shared/errors.js'
import { chatsHandler } from './chats/handler.js'
import { logsHandler } from './logs/handler.js'

const app = new Hono()

app.use('*', cors({ origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173' }))

app.route('/', chatsHandler)
app.route('/', logsHandler)

app.onError((err, c) => {
  if (err instanceof ApiError) {
    return c.json({ error: { code: err.code, message: err.message } }, err.status as ContentfulStatusCode)
  }
  return c.json({ error: { code: 'internal_error', message: 'Internal server error' } }, 500)
})

const port = Number(process.env.PORT ?? 3000)
serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running on http://localhost:${port}`)
})
