import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '@components/common/PageHeader'
import DatePicker, { formatDate } from '@components/common/DatePicker'
import calenderIcon from '@assets/calender.png'
import { useDailyActivities } from '@hooks/data/useDailyActivities'
import RotatingSpinner from '@components/spinner/TeethRotating'

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

  const handleDateSelect = (dateStr: string) => {
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
      const rect = container.getBoundingClientRect()
      const windowHeight = window.innerHeight
      
      if (rect.bottom - windowHeight < 200) {
        loadMore()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loadMore, selectedDate])

  return (
    <section className="space-y-6">
      <PageHeader
        title="Calendar"
        description="See your daily relations with patients."
        image={{
          src: calenderIcon,
          alt: 'calendar',
          className: 'w-[120px] h-[120px]',
        }}
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full lg:w-[40%] lg:sticky lg:top-4 lg:self-start">
          <DatePicker
            selectedDate={selectedDate}
            currentMonth={currentMonth}
            currentYear={currentYear}
            onDateSelect={handleDateSelect}
            onPreviousMonth={handlePreviousMonth}
            onNextMonth={handleNextMonth}
          />
        </div>

        <div className="w-full lg:w-[60%]">
          <div ref={scrollContainerRef} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            {selectedDate ? (
              <div className="space-y-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RotatingSpinner />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {summary && (
                      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-6 shadow-lg dark:border-slate-800">
                        <div className="mb-8 flex items-center gap-2 flex-wrap">
                          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {new Date(selectedDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </h2>
                          {summary.clinicNames && summary.clinicNames.length > 0 && (
                            <>
                              <span className="text-2xl font-bold text-slate-400 dark:text-slate-500">
                                -
                              </span>
                              <span className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                                {summary.clinicNames.join(', ')}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex justify-center gap-18">
                          <div className="text-center">
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                              Patients
                            </p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                              {summary.totalPatientsVisited}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                              Visits
                            </p>
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                              {summary.totalVisits}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                              Total Amount
                            </p>
                            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                              {formatCurrency(summary.totalAmount)}
                            </p>
                          </div>
                        </div>
                        {summary.visitStartTime && summary.visitEndTime && (
                          <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-yellow-200 dark:border-yellow-800">
                            <div className="text-center">
                              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                Average Amount per Visit
                              </p>
                              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                {formatCurrency(summary.averageAmountPerVisit)}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                Total Hours Worked
                              </p>
                              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                {summary.totalHoursWorked.toFixed(1)} hrs
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                First Visit
                              </p>
                              <p className="text-xl font-bold text-teal-600 dark:text-teal-400">
                                {formatTime(summary.visitStartTime)}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                Last Visit
                              </p>
                              <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
                                {formatTime(summary.visitEndTime)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
                        Visits {summary && `(${summary.totalVisits})`}
                      </h3>
                      <div className="space-y-3">
                        {activities.length > 0 ? (
                          <>
                            {activities.map((activity) => (
                              <div
                                key={activity.visitId}
                                onClick={() => handleActivityClick(activity.patientId)}
                                className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-blue-700 dark:hover:bg-blue-900/20"
                              >
                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                  <span className="font-bold text-slate-900 dark:text-white">
                                    {activity.patientName}
                                  </span>
                                  {' visited '}
                                  {activity.clinicName || 'clinic'}
                                  {' for '}
                                  <span className="font-bold text-slate-900 dark:text-white">
                                    {activity.treatmentName}
                                  </span>
                                  {' at '}
                                  {formatTime(activity.visitTime)}
                                </p>
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

