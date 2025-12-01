import { useState } from 'react'
import { type TreatmentCourseStatus } from '@api/treatmentCourses'

type StatusChangeModalProps = {
  isOpen: boolean
  onClose: () => void
  currentStatus: TreatmentCourseStatus
  onStatusChange: (status: TreatmentCourseStatus) => void
  isUpdating?: boolean
}

const statusConfig: Record<
  TreatmentCourseStatus,
  { label: string; color: string; bgColor: string; borderColor: string; hoverBg: string }
> = {
  active: {
    label: 'Active',
    color: 'text-green-700 dark:text-green-300',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    hoverBg: 'hover:bg-green-100 dark:hover:bg-green-900/30',
  },
  paused: {
    label: 'Paused',
    color: 'text-yellow-700 dark:text-yellow-300',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    hoverBg: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/30',
  },
  completed: {
    label: 'Completed',
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    hoverBg: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    hoverBg: 'hover:bg-red-100 dark:hover:bg-red-900/30',
  },
}

export default function StatusChangeModal({
  isOpen,
  onClose,
  currentStatus,
  onStatusChange,
  isUpdating = false,
}: StatusChangeModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<TreatmentCourseStatus>(currentStatus)

  if (!isOpen) return null

  const statuses: TreatmentCourseStatus[] = ['active', 'paused', 'completed', 'cancelled']

  const handleConfirm = () => {
    if (selectedStatus !== currentStatus) {
      onStatusChange(selectedStatus)
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-slate-900">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Change Status</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Select a new status for this treatment course
          </p>
        </div>
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 gap-3">
            {statuses.map((status) => {
              const config = statusConfig[status]
              const isSelected = selectedStatus === status
              const isCurrent = currentStatus === status

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setSelectedStatus(status)}
                  disabled={isUpdating}
                  className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? `${config.bgColor} ${config.borderColor} border-2 shadow-md`
                      : `${config.bgColor} ${config.borderColor} border ${config.hoverBg}`
                  } ${isUpdating ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
                    {isSelected && (
                      <svg
                        className={`h-5 w-5 ${config.color}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  {isCurrent && !isSelected && (
                    <span className="mt-2 inline-block text-xs text-slate-500 dark:text-slate-400">
                      (Current)
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 p-6 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isUpdating || selectedStatus === currentStatus}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400"
          >
            {isUpdating ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Updating...
              </span>
            ) : (
              'Update Status'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

