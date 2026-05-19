import fs from 'node:fs/promises'
import path from 'node:path'
import type { LogEntry } from '@inisie-chat/shared'
import { parseCsv } from '../shared/csv.js'

const CSV_HEADER = 'timestamp,name,color,message\n'

function getLogCsvPath(): string {
  return process.env.LOG_CSV_PATH ?? path.resolve('../../data/log.csv')
}

async function ensureFile(filePath: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  try {
    await fs.access(filePath)
  } catch {
    await fs.writeFile(filePath, CSV_HEADER, 'utf-8')
  }
}

export const logsRepository = {
  async findAll(): Promise<LogEntry[]> {
    const logPath = getLogCsvPath()
    await ensureFile(logPath)
    const content = await fs.readFile(logPath, 'utf-8')
    return parseCsv<LogEntry>(content)
  },
}
