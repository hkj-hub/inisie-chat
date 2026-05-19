import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { postChatBodySchema } from '@inisie-chat/shared'
import { getChats } from './getChats.js'
import { postChat } from './postChat.js'
import { chatsRepository } from './chatsRepository.js'

export const chatsHandler = new Hono()

chatsHandler.get('/api/chats', async (c) => {
  const result = await getChats({ repo: chatsRepository })
  return c.json({ data: result })
})

chatsHandler.post(
  '/api/chats',
  zValidator('json', postChatBodySchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: { code: 'validation_error', message: 'Request validation failed' } }, 422)
    }
  }),
  async (c) => {
  const body = c.req.valid('json')
  await postChat({ ...body, repo: chatsRepository })
    return c.json({ data: null }, 201)
  },
)
