import { Hono } from 'hono'
import { getLogs } from './getLogs.js'
import { logsRepository } from './logsRepository.js'

export const logsHandler = new Hono()

logsHandler.get('/api/logs', async (c) => {
  const result = await getLogs({ repo: logsRepository })
  return c.json({ data: result })
})
