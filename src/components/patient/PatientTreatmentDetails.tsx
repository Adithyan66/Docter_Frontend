import { useMemo } from 'react'
import type { TreatmentCourse, TreatmentCourseStatus } from '@api/treatmentCourses'
import type { TreatmentCourseSummary } from '@api/patients'

type PatientTreatmentDetailsProps = {
  courseDetails: TreatmentCourse
  selectedCourseId: string | null
  treatmentCourses: TreatmentCourseSummary[] | undefined
  isSettingDefault: boolean
  formatDate: (dateString?: string) => string
  formatDateTime: (dateString?: string) => string
  onViewTreatmentDetails: () => void
  onSetDefaultCourse: (courseId: string) => void
  onStatusChange: () => void
  onDeleteCourse: () => void
  onEditCourse: () => void
  onAddVisit: () => void
}

const calculateTimeProgress = (startDate: string, expectedEndDate: string): number => {
  const start = new Date(startDate).getTime()
  const end = new Date(expectedEndDate).getTime()
  const now = new Date().getTime()
  const total = end - start
  const elapsed = now - start
  return total > 0 ? Math.min(Math.max((elapsed / total) * 100, 0), 100) : 0
}

const getStatusBadgeClassName = (status: TreatmentCourseStatus) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'paused':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'completed':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400'
  }
}

export default function PatientTreatmentDetails({
  courseDetails,
  selectedCourseId,
  treatmentCourses,
  isSettingDefault,
  formatDate,
  formatDateTime,
  onViewTreatmentDetails,
  onSetDefaultCourse,
  onStatusChange,
  onDeleteCourse,
  onEditCourse,
  onAddVisit,
}: PatientTreatmentDetailsProps) {
  const treatmentName = useMemo(() => {
    if (!selectedCourseId || !treatmentCourses) return 'Treatment Course'
    return treatmentCourses.find((c) => c.id === selectedCourseId)?.treatmentName || 'Treatment Course'
  }, [selectedCourseId, treatmentCourses])

  const currentCourseIndex = useMemo(() => {
    if (!selectedCourseId || !treatmentCourses) return -1
    return treatmentCourses.findIndex((c) => c.id === selectedCourseId)
  }, [selectedCourseId, treatmentCourses])

  const showSetDefaultButton = currentCourseIndex > 0

  const paymentProgress = useMemo(() => {
    if (!courseDetails.totalCost) return 0
    return Math.round((courseDetails.totalPaid / courseDetails.totalCost) * 100)
  }, [courseDetails.totalCost, courseDetails.totalPaid])

  const timeProgress = useMemo(() => {
    if (!courseDetails.expectedEndDate) return 0
    return Math.round(calculateTimeProgress(courseDetails.startDate, courseDetails.expectedEndDate))
  }, [courseDetails.startDate, courseDetails.expectedEndDate])

  const remainingAmount = courseDetails.totalCost - courseDetails.totalPaid

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        {selectedCourseId && treatmentCourses && (
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">{treatmentName}</h3>
            {courseDetails?.status && (
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClassName(
                  courseDetails.status
                )}`}
              >
                {courseDetails.status.charAt(0).toUpperCase() + courseDetails.status.slice(1)}
              </span>
            )}
          </div>
        )}
        <div className="flex gap-2">
          {courseDetails.treatmentId && (
            <button
              onClick={onViewTreatmentDetails}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-100 to-purple-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-purple-200 hover:to-purple-300 dark:from-purple-800/30 dark:to-purple-700/30 dark:text-slate-200 dark:hover:from-purple-700/40 dark:hover:to-purple-600/40"
            >
              View Treatment Details
            </button>
          )}
          {showSetDefaultButton && (
            <button
              onClick={() => onSetDefaultCourse(selectedCourseId!)}
              disabled={isSettingDefault}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-100 to-orange-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-orange-200 hover:to-orange-300 disabled:cursor-not-allowed disabled:opacity-60 dark:from-orange-800/30 dark:to-orange-700/30 dark:text-slate-200 dark:hover:from-orange-700/40 dark:hover:to-orange-600/40"
            >
              {isSettingDefault ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-700 border-t-transparent dark:border-slate-200"></span>
                  Setting...
                </>
              ) : (
                'Set as Default'
              )}
            </button>
          )}
          <button
            onClick={onStatusChange}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-100 to-indigo-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-indigo-200 hover:to-indigo-300 dark:from-indigo-800/30 dark:to-indigo-700/30 dark:text-slate-200 dark:hover:from-indigo-700/40 dark:hover:to-indigo-600/40"
          >
            Change Status
          </button>
          <button
            onClick={onDeleteCourse}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-100 to-red-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-red-200 hover:to-red-300 dark:from-red-800/30 dark:to-red-700/30 dark:text-slate-200 dark:hover:from-red-700/40 dark:hover:to-red-600/40"
          >
            Delete Course
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 shadow-lg border border-blue-200 dark:border-blue-800 relative">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200">Payment Summary</h4>
            {courseDetails.isPaymentCompleted && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Completed
              </span>
            )}
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-around mb-2">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Cost</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Paid</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Remaining</span>
              </div>
            </div>
            <div className="flex items-center justify-around mb-6">
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">₹{courseDetails.totalCost.toLocaleString()}</span>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">₹{courseDetails.totalPaid.toLocaleString()}</span>
              <span className="text-xl font-bold text-orange-600 dark:text-orange-400">₹{remainingAmount.toLocaleString()}</span>
            </div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Payment Progress</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">{paymentProgress}%</span>
              </div>
              <div className="relative w-full bg-white/80 dark:bg-slate-800/80 rounded-full h-5 shadow-inner overflow-hidden">
                <div
                  className="relative h-full rounded-full bg-gradient-to-r from-green-400 via-green-500 to-green-600 transition-all duration-1000 ease-out shadow-lg"
                  style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow-md">
                    {paymentProgress}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 shadow-lg border border-purple-200 dark:border-purple-800">
          <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-200 mb-6">Treatment Timeline</h4>
          {courseDetails.expectedEndDate ? (
            <div className="space-y-4">
              <div className="flex items-center justify-around mb-2">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Start Date</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">End Date</span>
                </div>
              </div>
              <div className="flex items-center justify-around mb-6">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatDate(courseDetails.startDate)}</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatDate(courseDetails.expectedEndDate)}</span>
              </div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Time Progress</span>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{timeProgress}%</span>
                </div>
                <div className="relative w-full bg-white/80 dark:bg-slate-800/80 rounded-full h-5 shadow-inner overflow-hidden">
                  <div
                    className="relative h-full rounded-full bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 transition-all duration-1000 ease-out shadow-lg"
                    style={{ width: `${timeProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow-md">
                      {timeProgress}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">No expected end date set</span>
            </div>
          )}
        </div>
      </div>

      <div className='flex justify-center gap-8'>
        <div className='text-center'>
          <h1 className='text-sm font-semibold text-slate-900 dark:text-white mb-2'>Last Visit :</h1>
          <p className='text-xl font-bold text-slate-900 dark:text-white'>{formatDate(courseDetails.lastVisitDate)}</p>
        </div>
        <div className='text-center'>
          <h1 className='text-sm font-semibold text-slate-900 dark:text-white mb-2'>Next Visit :</h1>
          <p className='text-xl font-bold text-slate-900 dark:text-white'>{formatDate(courseDetails.nextVisitDate)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(courseDetails.notes) ? (
          <div className="md:col-span-2">
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Notes</span>
              <p className="text-sm text-slate-900 dark:text-white whitespace-pre-line">{courseDetails.notes}</p>
            </div>
          </div>
        ):(
          <div className='md:col-span-2'>
            <div className='rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4'>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Notes</span>
            <span className='text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block'>No notes found</span>
            </div>
          </div>
        )}

        <div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Created At</span>
          <p className="text-sm text-slate-900 dark:text-white mt-1">{formatDateTime(courseDetails.createdAt)}</p>
        </div>
        <div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Updated At</span>
          <p className="text-sm text-slate-900 dark:text-white mt-1">{formatDateTime(courseDetails.updatedAt)}</p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={onEditCourse}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-yellow-100 to-yellow-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-yellow-200 hover:to-yellow-300 dark:from-yellow-800/30 dark:to-yellow-700/30 dark:text-slate-200 dark:hover:from-yellow-700/40 dark:hover:to-yellow-600/40"
        >
          Edit Course
        </button>
        <button
          onClick={onAddVisit}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-100 to-green-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-green-200 hover:to-green-300 dark:from-green-800/30 dark:to-green-700/30 dark:text-slate-200 dark:hover:from-green-700/40 dark:hover:to-green-600/40"
        >
          Add Visit Data
        </button>
      </div>
    </div>
  )
}

