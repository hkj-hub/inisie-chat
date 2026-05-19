import { chatEntrySchema } from '@inisie-chat/shared'
import type { LogEntry } from '@inisie-chat/shared'

export async function fetchLogs(): Promise<LogEntry[]> {
  const res = await fetch('/api/logs')
  if (!res.ok) throw new Error('ログの取得に失敗しました')
  const json = (await res.json()) as { data: unknown[] }
  return chatEntrySchema.array().parse(json.data)
}
