import { useState } from 'react'

const ChevronLeftIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
)

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate()
}

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay()
}

const isToday = (year: number, month: number, day: number) => {
  const today = new Date()
  return (
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day
  )
}

export const formatDate = (year: number, month: number, day: number) => {
  const monthStr = String(month + 1).padStart(2, '0')
  const dayStr = String(day).padStart(2, '0')
  return `${year}-${monthStr}-${dayStr}`
}

interface DatePickerProps {
  selectedDate: string | null
  currentMonth: number
  currentYear: number
  onDateSelect: (dateStr: string) => void
  onPreviousMonth: () => void
  onNextMonth: () => void
  calendarEntries?: Record<string, string[]>
}

export default function DatePicker({
  selectedDate,
  currentMonth,
  currentYear,
  onDateSelect,
  onPreviousMonth,
  onNextMonth,
  calendarEntries,
}: DatePickerProps) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null)

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth)

  const handleDateClick = (day: number) => {
    const dateStr = formatDate(currentYear, currentMonth, day)
    onDateSelect(dateStr)
  }

  const handleDayMouseEnter = (e: React.MouseEvent<HTMLButtonElement>, day: number) => {
    const dateStr = formatDate(currentYear, currentMonth, day)
    const clinics = calendarEntries?.[dateStr] || []
    if (clinics.length > 0) {
      setHoveredDay(day)
      const rect = e.currentTarget.getBoundingClientRect()
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      })
    }
  }

  const handleDayMouseLeave = () => {
    setHoveredDay(null)
    setTooltipPosition(null)
  }

  const renderCalendarDays = () => {
    const days = []
    const emptyDays = firstDayOfMonth

    for (let i = 0; i < emptyDays; i++) {
      days.push(
        <div key={`empty-${i}`} className="aspect-square"></div>
      )
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isCurrentDay = isToday(currentYear, currentMonth, day)
      const dateStr = formatDate(currentYear, currentMonth, day)
      const isSelected = selectedDate === dateStr
      const clinics = calendarEntries?.[dateStr] || []

      days.push(
        <div key={day} className="relative">
          <button
            onClick={() => handleDateClick(day)}
            onMouseEnter={(e) => handleDayMouseEnter(e, day)}
            onMouseLeave={handleDayMouseLeave}
            className={`aspect-square rounded-lg border transition-all duration-200 cursor-pointer flex flex-col p-1 w-full ${
              isCurrentDay
                ? 'border-slate-400 bg-gradient-to-br from-slate-100 to-slate-200 font-semibold text-slate-700 shadow-md dark:from-slate-700/30 dark:to-slate-600/30 dark:text-slate-300'
                : isSelected
                ? 'border-blue-500 bg-gradient-to-br from-blue-200 to-blue-300 text-blue-900 shadow-md dark:from-blue-800/50 dark:to-blue-700/50 dark:text-blue-200'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 hover:border-purple-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:from-purple-900/20 dark:hover:to-purple-800/20 dark:hover:border-purple-700'
            }`}
          >
            <span className="text-sm font-medium">{day}</span>
            {clinics.length > 0 && (
              <div className="flex-1 flex flex-col gap-0.5 overflow-hidden mt-0.5 min-h-0">
                {clinics.slice(0, 2).map((clinic, idx) => (
                  <span
                    key={idx}
                    className="text-[8px] leading-tight text-slate-600 dark:text-slate-400 break-words"
                  >
                    {clinic}
                  </span>
                ))}
                {clinics.length > 2 && (
                  <span className="text-[8px] leading-tight text-slate-500 dark:text-slate-500">
                    +{clinics.length - 2}
                  </span>
                )}
              </div>
            )}
          </button>
        </div>
      )
    }

    return days
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onPreviousMonth}
          className="rounded-lg p-2 text-slate-600 transition-colors hover:cursor-pointer hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200 dark:text-slate-400 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30"
        >
          <ChevronLeftIcon />
        </button>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <button
          onClick={onNextMonth}
          className="rounded-lg p-2 text-slate-600 transition-colors hover:cursor-pointer hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200 dark:text-slate-400 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30"
        >
          <ChevronRightIcon />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-slate-500 dark:text-slate-400"
          >
            {day}
          </div>
        ))}
        {renderCalendarDays()}
      </div>

      {hoveredDay !== null && tooltipPosition && (() => {
        const dateStr = formatDate(currentYear, currentMonth, hoveredDay)
        const clinics = calendarEntries?.[dateStr] || []
        return (
          <div
            className="fixed z-50 pointer-events-none"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="mb-2 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-xl dark:border-slate-700 dark:bg-slate-800 min-w-[200px] max-w-[300px]">
              <div className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Scheduled Clinics
              </div>
              <div className="space-y-1.5">
                {clinics.map((clinic, idx) => (
                  <div
                    key={idx}
                    className="text-sm font-medium text-slate-900 dark:text-slate-200"
                  >
                    • {clinic}
                  </div>
                ))}
              </div>
            </div>
            <div
              className="mx-auto h-0 w-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-200 dark:border-t-slate-700"
              style={{ width: 0, height: 0 }}
            />
          </div>
        )
      })()}
    </div>
  )
}

