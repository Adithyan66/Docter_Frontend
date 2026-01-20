import httpClient from './httpClient'

type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
  timestamp?: string
}

export type FinancialDashboardMetrics = {
  totalRevenue: number
  revenueThisMonth: number
  revenueThisYear: number
  averageRevenuePerVisit: number
  averageRevenuePerPatient: number
}

export type RevenueTrendData = {
  date: string
  amount: number
}

export type RevenueByPaymentMethod = {
  method: string
  amount: number
  percentage: number
}

export type RevenueByClinic = {
  clinicId: string
  clinicName: string
  amount: number
}

export type MonthlyRevenueComparison = {
  month: string
  amount: number
}

export type PaymentCompletionRate = {
  rate: number
  completedCount: number
  totalCount: number
}

export type FinancialDashboardData = {
  metrics: FinancialDashboardMetrics
  revenueTrend: RevenueTrendData[]
  revenueByPaymentMethod: RevenueByPaymentMethod[]
  revenueByClinic: RevenueByClinic[]
  monthlyRevenueComparison: MonthlyRevenueComparison[]
  outstandingAmount: number
  paymentCompletionRate: PaymentCompletionRate
}

export type GetFinancialDashboardParams = {
  period?: 'daily' | 'weekly' | 'monthly'
  dateFrom?: string
  dateTo?: string
  clinicId?: string
  months?: number
}

export const getFinancialDashboard = async (
  params?: GetFinancialDashboardParams
): Promise<FinancialDashboardData> => {
  const { data } = await httpClient.get<ApiResponse<FinancialDashboardData>>(
    'analytics/financial/dashboard',
    {
      params,
    }
  )
  return data.data
}

