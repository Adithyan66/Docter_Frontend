import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import calenderIcon from '@assets/calender.png'
import { useDailyActivities } from '@hooks/data/useDailyActivities'
import RotatingSpinner from '@components/spinner/TeethRotating'

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

const formatDate = (year: number, month: number, day: number) => {
  const monthStr = String(month + 1).padStart(2, '0')
  const dayStr = String(day).padStart(2, '0')
  return `${year}-${monthStr}-${dayStr}`
}

export default function Calendar() {
  const navigate = useNavigate()
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const todayDateStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate())
  const [selectedDate, setSelectedDate] = useState<string | null>(todayDateStr)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const { activities, summary, isLoading, isLoadingMore, hasMore, loadMore } =
    useDailyActivities(selectedDate)

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

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const handleDateClick = (day: number) => {
    const dateStr = formatDate(currentYear, currentMonth, day)
    setSelectedDate(dateStr)
  }

  const handleActivityClick = (patientId: string) => {
    navigate(`/patients/${patientId}`)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || !selectedDate) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      if (scrollHeight - scrollTop - clientHeight < 100) {
        loadMore()
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [loadMore, selectedDate])

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

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`aspect-square rounded-lg border transition-all duration-200 cursor-pointer ${
            isCurrentDay
              ? 'border-blue-500 bg-gradient-to-br from-blue-100 to-blue-200 font-semibold text-blue-700 shadow-md dark:from-blue-900/30 dark:to-blue-800/30 dark:text-blue-400'
              : isSelected
              ? 'border-blue-500 bg-gradient-to-br from-blue-200 to-blue-300 text-blue-900 shadow-md dark:from-blue-800/50 dark:to-blue-700/50 dark:text-blue-200'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 hover:border-purple-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:from-purple-900/20 dark:hover:to-purple-800/20 dark:hover:border-purple-700'
          }`}
        >
          {day}
        </button>
      )
    }

    return days
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-md bg-white/60 p-6 backdrop-blur-sm dark:bg-slate-900 lg:flex-row lg:items-center lg:gap-6">
        <img src={calenderIcon} alt="calendar" className="w-[120px] h-[120px]" />
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Calendar</h1>
          <p className="text-slate-600 dark:text-slate-300">
            See your daily relations with patients.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full lg:w-[40%]">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={handlePreviousMonth}
                className="rounded-lg p-2 text-slate-600 transition-colors hover:cursor-pointer hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200 dark:text-slate-400 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30"
              >
                <ChevronLeftIcon />
              </button>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <button
                onClick={handleNextMonth}
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
          </div>
        </div>

        <div className="w-full lg:w-[60%]">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            {selectedDate ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h2>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RotatingSpinner />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
                        Visits {summary && `(${summary.totalVisits})`}
                      </h3>
                      <div
                        ref={scrollContainerRef}
                        className="max-h-[400px] space-y-3 overflow-y-auto"
                      >
                        {activities.length > 0 ? (
                          <>
                            {activities.map((activity) => (
                              <div
                                key={activity.visitId}
                                onClick={() => handleActivityClick(activity.patientId)}
                                className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-blue-700 dark:hover:bg-blue-900/20"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                      {activity.patientName}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                      {activity.treatmentName}
                                      {activity.clinicName && ` • ${activity.clinicName}`}
                                      {` • ${formatTime(activity.visitTime)}`}
                                    </p>
                                  </div>
                                  <div className="ml-4 text-right">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                      {formatCurrency(activity.amountPaid)}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      Paid
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {isLoadingMore && (
                              <div className="flex items-center justify-center py-4">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                              </div>
                            )}
                            {!hasMore && activities.length > 0 && (
                              <div className="text-center py-2 text-xs text-slate-500 dark:text-slate-400">
                                No more visits to load
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                            No visits found for this date
                          </div>
                        )}
                      </div>
                    </div>

                    {summary && (
                      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-6 shadow-lg dark:border-slate-800">
                        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                          Summary
                        </h3>
                        <div className="flex justify-center gap-8 mb-6">
                          <div className="text-center">
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                              Total Paid
                            </p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(summary.totalAmount)}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                              Total Cost
                            </p>
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                              {formatCurrency(summary.totalAmount)}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                              Outstanding
                            </p>
                            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                              {formatCurrency(0)}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-yellow-200 dark:border-yellow-800">
                          <div className="text-center">
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                              Total Patients
                            </p>
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">
                              {summary.totalPatientsVisited}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                              Total Visits
                            </p>
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">
                              {summary.totalVisits}
                            </p>
                          </div>
                          {summary.visitStartTime && summary.visitEndTime && (
                            <div className="text-center">
                              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                Hours Worked
                              </p>
                              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                {summary.totalHoursWorked.toFixed(1)} hrs
                              </p>
                            </div>
                          )}
                          {summary.clinicNames.length > 0 && (
                            <div className="text-center">
                              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                Clinics
                              </p>
                              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                {summary.clinicNames.length}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full min-h-[400px] items-center justify-center">
                <p className="text-slate-500 dark:text-slate-400">
                  Select a date to view visits and payments
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

