import { describe, it, expect } from 'vitest'
import type { ChatEntry } from '@inisie-chat/shared'
import { getChats } from './getChats.js'

const sampleEntries: ChatEntry[] = [
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
]

describe('getChats', () => {
  it('リポジトリの全件が返ること', async () => {
    const fakeRepo = {
      findLatest: async () => sampleEntries,
    }
    const result = await getChats({ repo: fakeRepo })
    expect(result).toEqual(sampleEntries)
  })

  it('リポジトリが空のとき空配列が返ること', async () => {
    const fakeRepo = {
      findLatest: async () => [],
    }
    const result = await getChats({ repo: fakeRepo })
    expect(result).toEqual([])
  })
})
