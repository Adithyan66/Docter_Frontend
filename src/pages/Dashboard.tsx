import { useState, useEffect, useRef } from 'react'
import PageHeader from '@components/common/PageHeader'
import dashboard from '@assets/calender.png'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  getFinancialDashboard,
  type GetFinancialDashboardParams,
  type RevenueTrendData,
  type MonthlyRevenueComparison,
  type RevenueByClinic,
} from '@api/financial'
import toast from 'react-hot-toast'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function Dashboard() {
  const periodDropdownRef = useRef<HTMLButtonElement>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<GetFinancialDashboardParams>({
    period: 'monthly',
    months: 12,
  })
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const data = await getFinancialDashboard(filters)
        setDashboardData(data)
      } catch (error) {
        toast.error('Failed to load financial dashboard data')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [filters])

  const handlePeriodChange = (period: 'daily' | 'weekly' | 'monthly') => {
    setFilters({ ...filters, period })
  }

  const handleDateFromChange = (dateFrom: string) => {
    setFilters({ ...filters, dateFrom: dateFrom || undefined })
  }

  const handleDateToChange = (dateTo: string) => {
    setFilters({ ...filters, dateTo: dateTo || undefined })
  }

  const handleMonthsChange = (months: string) => {
    setFilters({ ...filters, months: months ? parseInt(months) : undefined })
  }

  const handleClearFilters = () => {
    setFilters({
      period: 'monthly',
      months: 12,
    })
  }

  const hasActiveFilters =
    filters.dateFrom || filters.dateTo || filters.months !== 12 || filters.clinicId

  if (loading && !dashboardData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400">No data available</p>
      </div>
    )
  }

  const { metrics, revenueTrend, revenueByPaymentMethod, revenueByClinic, monthlyRevenueComparison, outstandingAmount, paymentCompletionRate } = dashboardData

  const metricCards = [
    { label: 'Total Revenue', value: formatCurrency(metrics.totalRevenue) },
    { label: 'Revenue This Month', value: formatCurrency(metrics.revenueThisMonth) },
    { label: 'Revenue This Year', value: formatCurrency(metrics.revenueThisYear) },
    { label: 'Avg Revenue per Visit', value: formatCurrency(metrics.averageRevenuePerVisit) },
    { label: 'Avg Revenue per Patient', value: formatCurrency(metrics.averageRevenuePerPatient) },
    { label: 'Outstanding Amount', value: formatCurrency(outstandingAmount) },
    {
      label: 'Payment Completion Rate',
      value: `${paymentCompletionRate.rate.toFixed(1)}%`,
      subtitle: `${paymentCompletionRate.completedCount} / ${paymentCompletionRate.totalCount}`,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Dashboard"
        description="Comprehensive overview of financial metrics and analytics."
        image={{ src: dashboard, alt: 'dashboard', className: 'w-[120px] h-[120px]' }}
        filterControls={[
          {
            id: 'period',
            type: 'dropdown',
            label: 'Period',
            value: filters.period || 'monthly',
            options: [
              { label: 'Daily', value: 'daily' },
              { label: 'Weekly', value: 'weekly' },
              { label: 'Monthly', value: 'monthly' },
            ],
            onChange: (value) => handlePeriodChange(value as 'daily' | 'weekly' | 'monthly'),
            buttonRef: periodDropdownRef,
          },
          {
            id: 'dateFrom',
            type: 'date',
            label: 'From',
            value: filters.dateFrom || '',
            onChange: handleDateFromChange,
            placeholder: 'Start date',
          },
          {
            id: 'dateTo',
            type: 'date',
            label: 'To',
            value: filters.dateTo || '',
            onChange: handleDateToChange,
            placeholder: 'End date',
          },
          {
            id: 'months',
            type: 'custom',
            render: () => (
              <input
                type="number"
                min="1"
                max="24"
                value={filters.months || 12}
                onChange={(e) => handleMonthsChange(e.target.value)}
                placeholder="Months"
                className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            ),
          },
        ]}
        onClearFilters={handleClearFilters}
        hasPendingChanges={!!hasActiveFilters}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {metricCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
              {card.value}
            </p>
            {card.subtitle && (
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{card.subtitle}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Revenue Trend
          </h3>
          <div className="h-[300px]">
            <Line
              data={{
                labels: revenueTrend.map((item: RevenueTrendData) => item.date),
                datasets: [
                  {
                    label: 'Revenue',
                    data: revenueTrend.map((item: RevenueTrendData) => item.amount),
                    borderColor: '#0088FE',
                    backgroundColor: 'rgba(0, 136, 254, 0.1)',
                    tension: 0.4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top' as const,
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const value = context.parsed.y
                        if (typeof value === 'number') {
                          return `Revenue: ${formatCurrency(value)}`
                        }
                        return `Revenue: ${value}`
                      },
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => {
                        if (typeof value === 'number') {
                          return formatCurrency(value)
                        }
                        return value
                      },
                    },
                    grid: {
                      color: 'rgba(148, 163, 184, 0.3)',
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Monthly Revenue Comparison
          </h3>
          <div className="h-[300px]">
            <Bar
              data={{
                labels: monthlyRevenueComparison.map((item: MonthlyRevenueComparison) => item.month),
                datasets: [
                  {
                    label: 'Revenue',
                    data: monthlyRevenueComparison.map((item: MonthlyRevenueComparison) => item.amount),
                    backgroundColor: '#00C49F',
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top' as const,
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const value = context.parsed.y
                        if (typeof value === 'number') {
                          return `Revenue: ${formatCurrency(value)}`
                        }
                        return `Revenue: ${value}`
                      },
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => {
                        if (typeof value === 'number') {
                          return formatCurrency(value)
                        }
                        return value
                      },
                    },
                    grid: {
                      color: 'rgba(148, 163, 184, 0.3)',
                    },
                  },
                  x: {
                    ticks: {
                      maxRotation: 45,
                      minRotation: 45,
                    },
                    grid: {
                      display: false,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Revenue by Payment Method
          </h3>
          <div className="h-[300px]">
            <Doughnut
              data={{
                labels: revenueByPaymentMethod.map((item: { method: string; amount: number; percentage: number }) => item.method),
                datasets: [
                  {
                    data: revenueByPaymentMethod.map((item: { method: string; amount: number; percentage: number }) => item.amount),
                    backgroundColor: COLORS.slice(0, revenueByPaymentMethod.length),
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: 'right' as const,
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const data = revenueByPaymentMethod[context.dataIndex]
                        return [
                          `${data.method}: ${formatCurrency(data.amount)}`,
                          `Percentage: ${data.percentage.toFixed(1)}%`,
                        ]
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Revenue by Clinic
          </h3>
          <div className="h-[300px]">
            <Bar
              data={{
                labels: revenueByClinic.map((item: RevenueByClinic) => item.clinicName),
                datasets: [
                  {
                    label: 'Revenue',
                    data: revenueByClinic.map((item: RevenueByClinic) => item.amount),
                    backgroundColor: '#FF8042',
                  },
                ],
              }}
              options={{
                indexAxis: 'y' as const,
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top' as const,
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const value = context.parsed.x
                        if (typeof value === 'number') {
                          return `Revenue: ${formatCurrency(value)}`
                        }
                        return `Revenue: ${value}`
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => {
                        if (typeof value === 'number') {
                          return formatCurrency(value)
                        }
                        return value
                      },
                    },
                    grid: {
                      color: 'rgba(148, 163, 184, 0.3)',
                    },
                  },
                  y: {
                    grid: {
                      display: false,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

