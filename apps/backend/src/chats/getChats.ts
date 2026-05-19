import type { ChatEntry } from '@inisie-chat/shared'

export interface ChatsRepository {
  findLatest(): Promise<ChatEntry[]>
}

export interface GetChatsInput {
  repo: ChatsRepository
}

export async function getChats({ repo }: GetChatsInput): Promise<ChatEntry[]> {
  return repo.findLatest()
}
