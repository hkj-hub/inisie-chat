import type { LogEntry } from '@inisie-chat/shared'

export interface LogsRepository {
  findAll(): Promise<LogEntry[]>
}

export interface GetLogsInput {
  repo: LogsRepository
}

export async function getLogs({ repo }: GetLogsInput): Promise<LogEntry[]> {
  return repo.findAll()
}
