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
  minDuration: number
  maxDuration: number
  avgDuration?: number
  minFees: number
  maxFees: number
  avgFees?: number
  steps: string[]
  aftercare: string[]
  followUpRequired: boolean
  followUpAfterDays?: number
  risks: string[]
  images: string[]
}

export type Treatment = {
  id: string
  name: string
  description?: string
  minDuration?: number
  maxDuration?: number
  avgDuration?: number
  minFees?: number
  maxFees?: number
  avgFees?: number
  steps?: string[]
  aftercare?: string[]
  followUpRequired?: boolean
  followUpAfterDays?: number
  risks?: string[]
  images?: string[]
  createdAt: string
  updatedAt: string
}

export type PaginatedTreatmentsResponse = {
  treatments: Treatment[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type GetTreatmentsParams = {
  page?: number
  limit?: number
  sortBy?: 'fees' | 'duration' | 'createdAt'
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

export const updateTreatment = async (id: string, payload: TreatmentPayload) => {
  const { data } = await httpClient.patch<ApiResponse<Treatment>>(`treatment/${id}`, payload)
  return data.data
}

export const deleteTreatment = async (id: string) => {
  const { data } = await httpClient.delete<ApiResponse<null>>(`treatment/${id}`)
  return data.data
}

