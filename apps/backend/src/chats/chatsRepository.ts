import fs from 'node:fs/promises'
import path from 'node:path'
import type { ChatEntry } from '@inisie-chat/shared'
import { parseCsv, stringifyCsv } from '../shared/csv.js'

const CSV_COLUMNS: (keyof ChatEntry)[] = ['timestamp', 'name', 'color', 'message']
const MAX_CHAT_ROWS = 20

function getChatCsvPath(): string {
  return process.env.CHAT_CSV_PATH ?? path.resolve('../../data/chat.csv')
}

function getLogCsvPath(): string {
  return process.env.LOG_CSV_PATH ?? path.resolve('../../data/log.csv')
}

async function ensureFile(filePath: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  try {
    await fs.access(filePath)
  } catch {
    await fs.writeFile(filePath, '', 'utf-8')
  }
}

export const chatsRepository = {
  async findLatest(): Promise<ChatEntry[]> {
    const chatPath = getChatCsvPath()
    await ensureFile(chatPath)
    const content = await fs.readFile(chatPath, 'utf-8')
    return parseCsv<ChatEntry>(content, CSV_COLUMNS)
  },

  async append(entry: ChatEntry): Promise<void> {
    const chatPath = getChatCsvPath()
    const logPath = getLogCsvPath()

    await ensureFile(chatPath)
    await ensureFile(logPath)

    const line = stringifyCsv([entry])

    // Append to log.csv (unlimited)
    await fs.appendFile(logPath, line, 'utf-8')

    // Append to chat.csv then trim to MAX_CHAT_ROWS
    await fs.appendFile(chatPath, line, 'utf-8')
    const content = await fs.readFile(chatPath, 'utf-8')
    const all = parseCsv<ChatEntry>(content, CSV_COLUMNS)
    if (all.length > MAX_CHAT_ROWS) {
      const trimmed = all.slice(all.length - MAX_CHAT_ROWS)
      await fs.writeFile(chatPath, stringifyCsv(trimmed), 'utf-8')
    }
  },
}
