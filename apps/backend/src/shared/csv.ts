import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'

export function parseCsv<T>(content: string): T[] {
  if (!content.trim()) return []
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as T[]
}

export function stringifyCsvRow<T extends Record<string, unknown>>(record: T): string {
  return stringify([record], { header: false })
}

export function stringifyCsvFull<T extends Record<string, unknown>>(
  records: T[],
  columns: readonly string[],
): string {
  return stringify(records, { header: true, columns: columns as string[] })
}
