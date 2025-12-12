import httpClient from './httpClient'

type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
  timestamp?: string
}

export type TreatmentPayload = {
  name: string
  description?: string
  isOneTime?: boolean
  minDuration?: number
  maxDuration?: number
  avgDuration?: number
  regularVisitInterval?: {
    interval: number
    unit: string
  }
  minFees: number
  maxFees: number
  avgFees?: number
  steps: string[]
  aftercare: string[]
  followUpRequired: boolean
  followUpAfterDays?: number
  risks: string[]
  images: string[]
  isActive?: boolean
}

export type Treatment = {
  id: string
  name: string
  description?: string
  isOneTime?: boolean
  minDuration?: number
  maxDuration?: number
  avgDuration?: number
  regularVisitInterval?: {
    interval: number
    unit: string
  }
  minFees?: number
  maxFees?: number
  avgFees?: number
  steps?: string[]
  aftercare?: string[]
  followUpRequired?: boolean
  followUpAfterDays?: number
  risks?: string[]
  images?: string[]
  isActive?: boolean
  createdAt: string
  updatedAt: string
}

export type TreatmentList = {
  id: string
  name: string
  avgFees?: number
  avgDuration?: number
  numberOfPatients: number
  ongoing: number
  completed: number
  isActive?: boolean
}

export type PaginatedTreatmentsResponse = {
  treatments: TreatmentList[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type GetTreatmentsParams = {
  page?: number
  limit?: number
  sortBy?: 'averageAmount' | 'averageDuration' | 'numberOfPatients' | 'ongoing' | 'completed' | ''
  sortOrder?: 'asc' | 'desc'
  search?: string
}

export const createTreatment = async (payload: TreatmentPayload) => {
  const { data } = await httpClient.post<ApiResponse<Treatment>>('treatment/add', payload)
  return data.data
}

export const getTreatments = async (
  params: GetTreatmentsParams = {}
): Promise<PaginatedTreatmentsResponse> => {
  const { data } = await httpClient.get<ApiResponse<PaginatedTreatmentsResponse>>(
    'treatment/all',
    {
      params,
    }
  )
  return data.data
}

export const getTreatment = async (id: string): Promise<Treatment> => {
  const { data } = await httpClient.get<ApiResponse<Treatment>>(`treatment/${id}`)
  return data.data
}

export const updateTreatment = async (id: string, payload: Partial<TreatmentPayload>) => {
  const { data } = await httpClient.patch<ApiResponse<Treatment>>(`treatment/${id}`, payload)
  return data.data
}

export const deleteTreatment = async (id: string) => {
  const { data } = await httpClient.delete<ApiResponse<null>>(`treatment/${id}`)
  return data.data
}

export type TreatmentName = {
  id: string
  name: string
}

export const getTreatmentNames = async (params?: { search?: string }): Promise<TreatmentName[]> => {
  const { data } = await httpClient.get<ApiResponse<TreatmentName[]>>('treatment/names', {
    params,
  })
  return data.data
}

export type TreatmentStatistics = {
  patients: {
    totalCount: number
    uniqueCount: number
  }
  treatmentCourses: {
    totalCount: number
    statusBreakdown: {
      active: number
      paused: number
      completed: number
      cancelled: number
    }
    medicallyCompleted: number
    paymentCompleted: number
  }
  revenue: {
    totalPaid: number
    totalCost: number
    outstanding: number
    averagePerCourse: {
      paid: number
      cost: number
    }
    byPaymentMethod: {
      cash: number
      card: number
      upi: number
      bank: number
      insurance: number
      online: number
    }
    refunds: {
      totalAmount: number
      count: number
    }
  }
  clinics: Array<{
    clinicId: string
    clinicName: string
    courseCount: number
    totalPaid: number
    totalCost: number
    outstanding: number
  }>
  visits: {
    totalCount: number
    averagePerCourse: number
    totalBilledAmount: number
    averageBilledAmount: number
  }
  timeMetrics: {
    earliestStartDate: string
    latestStartDate: string
    averageDuration?: number
  }
  completionRates: {
    treatment: number
    payment: number
    medical: number
    cancellation: number
  }
}

export type TreatmentWithStatistics = Treatment & {
  doctorId: string
  statistics?: TreatmentStatistics
}

export type GetTreatmentWithStatisticsParams = {
  includeStatistics?: boolean
  startDateFrom?: string
  startDateTo?: string
}

export const getTreatmentWithStatistics = async (
  id: string,
  params?: GetTreatmentWithStatisticsParams
): Promise<TreatmentWithStatistics> => {
  const { data } = await httpClient.get<ApiResponse<TreatmentWithStatistics>>(`treatment/${id}`, {
    params,
  })
  return data.data
}

export type PaginatedTreatmentImagesResponse = {
  images: string[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type GetTreatmentImagesParams = {
  page?: number
  limit?: number
}

export const getTreatmentImages = async (
  id: string,
  params?: GetTreatmentImagesParams
): Promise<PaginatedTreatmentImagesResponse> => {
  const { data } = await httpClient.get<ApiResponse<PaginatedTreatmentImagesResponse>>(
    `treatment/${id}/images`,
    {
      params,
    }
  )
  return data.data
}

export const uploadTreatmentImages = async (
  id: string,
  imageUrls: string[]
): Promise<void> => {
  await httpClient.post<ApiResponse<void>>(`treatment/${id}/images`, {
    images: imageUrls,
  })
}

