import { useState, useEffect, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import { getDailyActivities, type DailyActivity, type DailyActivitySummary, type GetDailyActivitiesParams } from '@api/dailyActivities'

export function useDailyActivities(date: string | null) {
  const [activities, setActivities] = useState<DailyActivity[]>([])
  const [summary, setSummary] = useState<DailyActivitySummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const limit = 10
  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null)

  const fetchActivities = useCallback(async (page: number, append: boolean = false) => {
    if (!date) {
      setActivities([])
      setSummary(null)
      return
    }

    try {
      if (page === 1) {
        setIsLoading(true)
      } else {
        setIsLoadingMore(true)
      }

      const params: GetDailyActivitiesParams = {
        date,
        page,
        limit,
      }

      const response = await getDailyActivities(params)

      if (append) {
        setActivities((prev) => [...prev, ...response.activities])
      } else {
        setActivities(response.activities)
      }

      setSummary(response.summary)
      setCurrentPage(response.pagination.page)
      setTotalPages(response.pagination.totalPages)
      setHasMore(response.pagination.page < response.pagination.totalPages)
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to fetch daily activities. Please try again.'
      toast.error(errorMessage)
      if (!append) {
        setActivities([])
        setSummary(null)
      }
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [date, limit])

  useEffect(() => {
    setCurrentPage(1)
    setActivities([])
    fetchActivities(1, false)
  }, [date, fetchActivities])

  const loadMore = useCallback(() => {
    if (throttleTimerRef.current) {
      return
    }

    if (hasMore && !isLoadingMore && !isLoading) {
      throttleTimerRef.current = setTimeout(() => {
        fetchActivities(currentPage + 1, true)
        throttleTimerRef.current = null
      }, 300)
    }
  }, [hasMore, isLoadingMore, isLoading, currentPage, fetchActivities])

  useEffect(() => {
    return () => {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current)
      }
    }
  }, [])

  return {
    activities,
    summary,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refetch: () => fetchActivities(1, false),
  }
}

