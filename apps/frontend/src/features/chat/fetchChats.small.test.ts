import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchChats } from './fetchChats.js'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('fetchChats', () => {
  it('昇順データを受け取ったとき降順（新しい順）で返すこと', async () => {
    // Arrange
    const mockData = [
      { timestamp: '2026-01-01T00:00:00Z', name: 'Alice', color: 'red', message: 'first' },
      { timestamp: '2026-01-02T00:00:00Z', name: 'Bob', color: 'blue', message: 'second' },
    ]
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockData }),
    }))

    // Act
    const result = await fetchChats()

    // Assert
    expect(result[0].timestamp).toBe('2026-01-02T00:00:00Z')
    expect(result[1].timestamp).toBe('2026-01-01T00:00:00Z')
  })
})
