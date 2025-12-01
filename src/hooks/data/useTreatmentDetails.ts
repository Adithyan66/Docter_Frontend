import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getTreatmentWithStatistics, type TreatmentWithStatistics, type GetTreatmentWithStatisticsParams } from '@api/treatments'

export function useTreatmentDetails(treatmentId: string | undefined) {
  const [treatment, setTreatment] = useState<TreatmentWithStatistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateFilters, setDateFilters] = useState<{
    startDateFrom?: string
    startDateTo?: string
  }>({})

  const fetchTreatment = async (params?: GetTreatmentWithStatisticsParams) => {
    if (!treatmentId) return

    try {
      setIsLoading(true)
      const treatmentData = await getTreatmentWithStatistics(treatmentId, {
        includeStatistics: true,
        ...params,
      })
      setTreatment(treatmentData)
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to fetch treatment details. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTreatment(dateFilters)
  }, [treatmentId, dateFilters.startDateFrom, dateFilters.startDateTo])

  const handleDateFilterChange = (startDateFrom?: string, startDateTo?: string) => {
    setDateFilters({
      startDateFrom: startDateFrom || undefined,
      startDateTo: startDateTo || undefined,
    })
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return '-'
    }
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return '-'
    }
  }

  return {
    treatment,
    isLoading,
    dateFilters,
    handleDateFilterChange,
    formatDate,
    formatDateTime,
    fetchTreatment,
  }
}

