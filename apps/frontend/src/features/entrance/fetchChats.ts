import { chatEntrySchema } from '@inisie-chat/shared'
import type { ChatEntry } from '@inisie-chat/shared'

export async function fetchChats(): Promise<ChatEntry[]> {
  const res = await fetch('/api/chats')
  if (!res.ok) throw new Error('チャットの取得に失敗しました')
  const json = (await res.json()) as { data: unknown[] }
  return chatEntrySchema.array().parse(json.data)
}
