import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { getMonthlyCalendar, type CalendarDay, type GetMonthlyCalendarParams } from '@api/calendarEntries'

export function useCalendarEntries(month: number, year: number) {
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchCalendarEntries = useCallback(async () => {
    try {
      setIsLoading(true)
      const params: GetMonthlyCalendarParams = {
        month,
        year,
      }

      const response = await getMonthlyCalendar(params)
      setCalendarDays(response.days)
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to fetch calendar entries. Please try again.'
      toast.error(errorMessage)
      setCalendarDays([])
    } finally {
      setIsLoading(false)
    }
  }, [month, year])

  useEffect(() => {
    fetchCalendarEntries()
  }, [fetchCalendarEntries])

  const getClinicsForDate = useCallback(
    (dateStr: string): string[] => {
      const day = calendarDays.find((d) => d.date === dateStr)
      return day?.clinics || []
    },
    [calendarDays]
  )

  return {
    calendarDays,
    isLoading,
    refetch: fetchCalendarEntries,
    getClinicsForDate,
  }
}

