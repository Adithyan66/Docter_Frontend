import type { ReactNode } from 'react'

type TableColumn<T> = {
  key: string
  header: string
  render: (row: T, index: number) => ReactNode
  className?: string
}

type TableProps<T> = {
  columns: TableColumn<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  emptyMessage?: string
}

export default function Table<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data available.',
}: TableProps<T>) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border-2 border-blue-300/50 bg-white shadow-sm dark:border-blue-400/50 dark:bg-slate-900">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-blue-300/50 bg-blue-50/30 dark:border-blue-400/50 dark:bg-blue-900/10">
            {columns.map((column) => {
              const hasLeftAlign = column.className?.includes('text-left')
              const alignClass = hasLeftAlign ? 'text-left' : 'text-center'
              return (
                <th
                  key={column.key}
                  className={`px-6 py-4 ${alignClass} text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 ${
                    column.className || ''
                  }`}
                >
                  {column.header}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {data.map((row, rowIndex) => {
            const isEven = rowIndex % 2 === 0
            const rowBgClass = isEven
              ? 'bg-slate-50/50 dark:bg-slate-800/30'
              : 'bg-white dark:bg-slate-900'
            return (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={`${rowBgClass} ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((column) => {
                  const hasLeftAlign = column.className?.includes('text-left')
                  const alignClass = hasLeftAlign ? 'text-left' : 'text-center'
                  return (
                    <td
                      key={column.key}
                      className={`px-6 py-4 ${alignClass} text-sm text-slate-900 dark:text-slate-100 ${
                        column.className || ''
                      }`}
                    >
                      {column.render(row, rowIndex)}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

