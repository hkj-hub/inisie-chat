import type { ChatEntry } from '@inisie-chat/shared'
import type { z } from 'zod'
import type { postChatBodySchema } from '@inisie-chat/shared'

export interface PostChatRepository {
  append(entry: ChatEntry): Promise<void>
}

export type PostChatInput = z.infer<typeof postChatBodySchema> & {
  repo: PostChatRepository
}

export async function postChat({ repo, name, color, message }: PostChatInput): Promise<void> {
  const entry: ChatEntry = {
    timestamp: new Date().toISOString(),
    name,
    color,
    message,
  }
  await repo.append(entry)
}
