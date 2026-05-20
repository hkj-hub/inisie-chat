import { describe, it, expect } from 'vitest'
import { chatsHandler } from './handler.js'

// バリデーションエラー時はリポジトリに到達しないので実ファイルアクセスなし

describe('POST /api/chats バリデーション', () => {
  it('color が定義外のとき 422 と統一エラーフォーマットを返すこと', async () => {
    // Arrange
    const req = new Request('http://localhost/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', color: 'invalidcolor', message: 'Hello' }),
    })

    // Act
    const res = await chatsHandler.fetch(req)
    const json = await res.json() as unknown

    // Assert
    expect(res.status).toBe(422)
    expect(json).toEqual({ error: { code: 'validation_error', message: 'Request validation failed' } })
  })

  it('message が空のとき 422 と統一エラーフォーマットを返すこと', async () => {
    // Arrange
    const req = new Request('http://localhost/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', color: 'red', message: '' }),
    })

    // Act
    const res = await chatsHandler.fetch(req)
    const json = await res.json() as unknown

    // Assert
    expect(res.status).toBe(422)
    expect(json).toEqual({ error: { code: 'validation_error', message: 'Request validation failed' } })
  })
})
