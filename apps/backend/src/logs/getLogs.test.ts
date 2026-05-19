import { describe, it, expect } from 'vitest'
import type { LogEntry } from '@inisie-chat/shared'
import { getLogs } from './getLogs.js'

const sampleLogs: LogEntry[] = [
  {
    timestamp: '2024-01-01T00:00:00.000Z',
    name: 'Alice',
    color: 'red',
    message: 'Hello',
  },
  {
    timestamp: '2024-01-01T00:01:00.000Z',
    name: 'Bob',
    color: 'blue',
    message: 'Hi there',
  },
  {
    timestamp: '2024-01-01T00:02:00.000Z',
    name: 'Charlie',
    color: 'green',
    message: 'Good morning',
  },
]

describe('getLogs', () => {
  it('リポジトリの全件が返ること', async () => {
    const fakeRepo = {
      findAll: async () => sampleLogs,
    }
    const result = await getLogs({ repo: fakeRepo })
    expect(result).toEqual(sampleLogs)
  })
})
