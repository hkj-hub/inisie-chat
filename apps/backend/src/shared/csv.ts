import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'

export function parseCsv<T extends Record<string, string>>(
  content: string,
  columns: (keyof T)[],
): T[] {
  if (!content.trim()) return []
  return parse(content, {
    columns: columns as string[],
    skip_empty_lines: true,
    trim: true,
  }) as T[]
}

export function stringifyCsv<T extends Record<string, unknown>>(
  records: T[],
): string {
  if (records.length === 0) return ''
  return stringify(records, { header: false })
}
