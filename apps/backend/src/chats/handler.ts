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

chatsHandler.post('/api/chats', zValidator('json', postChatBodySchema), async (c) => {
  const body = c.req.valid('json')
  await postChat({ ...body, repo: chatsRepository })
  return c.json({ data: null }, 201)
})
