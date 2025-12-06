import httpClient from './httpClient'

export interface GetVisitRemindersQueryDto {
  page?: number
  limit?: number
  daysBefore?: number
  daysAfter?: number
  treatmentId?: string
  clinicId?: string
}

export interface VisitReminderResponseDto {
  treatmentCourseId: string
  patientName: string
  treatmentName: string
  clinicName?: string
  nextVisitDate: Date
}

export interface PaginatedVisitRemindersResponseDto {
  reminders: VisitReminderResponseDto[]
  total: number
  page: number
  limit: number
  totalPages: number
}

type VisitRemindersApiResponse = {
  success: boolean
  data: VisitReminderResponseDto[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  timestamp?: string
  message?: string
}

export const getVisitReminders = async (
  params?: GetVisitRemindersQueryDto
): Promise<PaginatedVisitRemindersResponseDto> => {
  const { data } = await httpClient.get<VisitRemindersApiResponse>('reminders/visits', {
    params,
  })
  return {
    reminders: data.data || [],
    total: data.pagination?.total || 0,
    page: data.pagination?.page || 1,
    limit: data.pagination?.limit || 10,
    totalPages: data.pagination?.totalPages || 1,
  }
}

