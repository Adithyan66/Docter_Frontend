import httpClient from './httpClient'

type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
  timestamp?: string
}

export type PrescriptionItemDto = {
  medicineName: string
  form?: string
  strength?: string
  dosage?: string
  frequency?: string
  duration?: string
  notes?: string
}

export type CreateVisitPrescriptionDto = {
  clinicId?: string
  diagnosis?: string[]
  items: PrescriptionItemDto[]
  notes?: string
}

export type MediaType = 'image' | 'xray' | 'report' | 'other'

export type CreateVisitMediaDto = {
  url: string
  filename?: string
  mimeType?: string
  size?: number
  type?: MediaType
  notes?: string
}

export type CreateVisitRequestDto = {
  patientId: string
  courseId: string
  clinicId?: string
  visitDate: string
  nextVisitDate?: string
  notes?: string
  billedAmount?: number
  mediaIds?: string[]
  prescriptionId?: string
  prescription?: CreateVisitPrescriptionDto
  media?: CreateVisitMediaDto[]
}

export type VisitResponseDto = {
  id: string
  doctorId: string
  patientId: string
  courseId: string
  clinicId?: string
  visitDate: string
  notes?: string
  billedAmount?: number
  mediaIds: string[]
  prescriptionId?: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  prescription?: PrescriptionResponseDto
  media?: MediaResponseDto[]
}

export type PrescriptionResponseDto = {
  id: string
  doctorId: string
  patientId: string
  visitId: string
  clinicId?: string
  diagnosis: string[]
  items: PrescriptionItemDto[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export type MediaResponseDto = {
  id: string
  doctorId: string
  patientId?: string
  courseId?: string
  visitId?: string
  clinicId?: string
  url: string
  filename?: string
  mimeType?: string
  size?: number
  type: MediaType
  notes?: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export type GetVisitsQueryDto = {
  page?: number
  limit?: number
  patientId?: string
  courseId?: string
  clinicId?: string
  visitDateFrom?: string
  visitDateTo?: string
  notes?: string
  sortBy?: 'visitDate' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  include?: string
}

export type PaginatedVisitsResponseDto = {
  visits: VisitResponseDto[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const createVisit = async (payload: CreateVisitRequestDto): Promise<VisitResponseDto> => {
  const { data } = await httpClient.post<ApiResponse<VisitResponseDto>>('visit/add', payload)
  return data.data
}

export const getVisits = async (
  params: GetVisitsQueryDto = {}
): Promise<PaginatedVisitsResponseDto> => {
  const { data } = await httpClient.get<ApiResponse<PaginatedVisitsResponseDto>>('visits/all', {
    params,
  })
  return data.data
}

export const updateVisit = async (
  visitId: string,
  payload: CreateVisitRequestDto
): Promise<VisitResponseDto> => {
  const { data } = await httpClient.patch<ApiResponse<VisitResponseDto>>(`visit/${visitId}`, payload)
  return data.data
}

export const deleteVisit = async (visitId: string): Promise<void> => {
  await httpClient.delete<ApiResponse<void>>(`visit/${visitId}`)
}

export const deleteMedia = async (mediaId: string): Promise<void> => {
  await httpClient.delete<ApiResponse<void>>(`media/${mediaId}`)
}

