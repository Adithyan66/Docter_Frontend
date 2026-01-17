import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { getDateCalendar, type DateCalendarResponse } from '@api/calendarEntries'

export function useDateCalendar(date: string | null) {
  const [data, setData] = useState<DateCalendarResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchDateCalendar = useCallback(async () => {
    if (!date) {
      setData(null)
      return
    }

    try {
      setIsLoading(true)
      const response = await getDateCalendar(date)
      setData(response)
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to fetch calendar entries. Please try again.'
      toast.error(errorMessage)
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [date])

  useEffect(() => {
    fetchDateCalendar()
  }, [fetchDateCalendar])

  return {
    data,
    isLoading,
    refetch: fetchDateCalendar,
  }
}

