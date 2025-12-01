import httpClient from './httpClient'

type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
  timestamp?: string
}

export type DailyActivitySummary = {
  totalPatientsVisited: number
  totalVisits: number
  totalAmount: number
  averageAmountPerVisit: number
  visitStartTime: string | null
  visitEndTime: string | null
  totalHoursWorked: number
  clinicNames: string[]
}

export type DailyActivity = {
  visitId: string
  visitTime: string
  patientId: string
  patientName: string
  courseId: string
  treatmentName: string
  amountPaid: number
  clinicId: string | null
  clinicName: string | null
}

export type DailyActivitiesResponse = {
  summary: DailyActivitySummary
  activities: DailyActivity[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type GetDailyActivitiesParams = {
  date: string
  page?: number
  limit?: number
  clinicId?: string
}

export const getDailyActivities = async (
  params: GetDailyActivitiesParams
): Promise<DailyActivitiesResponse> => {
  const { data } = await httpClient.get<ApiResponse<DailyActivitiesResponse>>('daily-activities', {
    params,
  })
  return data.data
}

