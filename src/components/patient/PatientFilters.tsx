import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { GetPatientsParams } from '@api/patients'

type PatientFiltersProps = {
  isOpen: boolean
  onClose: () => void
  filters: GetPatientsParams
  onPendingFiltersChange: (filters: GetPatientsParams) => void
  buttonRef?: React.RefObject<HTMLButtonElement | null>
}

export default function PatientFilters({
  isOpen,
  onClose,
  filters,
  onPendingFiltersChange,
  buttonRef,
}: PatientFiltersProps) {
  const [localFilters, setLocalFilters] = useState<GetPatientsParams>(filters)
  const modalRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters)
      if (buttonRef?.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        const modalWidth = 320
        const modalHeight = 300
        const padding = 16
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        const scrollY = window.scrollY
        const scrollX = window.scrollX

        let left = rect.left + scrollX
        let top = rect.bottom + scrollY + 8

        if (left + modalWidth > viewportWidth + scrollX - padding) {
          left = viewportWidth + scrollX - modalWidth - padding
        }

        if (left < scrollX + padding) {
          left = scrollX + padding
        }

        if (top + modalHeight > viewportHeight + scrollY - padding) {
          top = rect.top + scrollY - modalHeight - 8
        }

        if (top < scrollY + padding) {
          top = scrollY + padding
        }

        setPosition({ top, left })
      }
    }
  }, [isOpen, filters, buttonRef])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        buttonRef?.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, buttonRef])

  useEffect(() => {
    if (isOpen) {
      onPendingFiltersChange(localFilters)
    }
  }, [localFilters, isOpen, onPendingFiltersChange])

  if (!isOpen) return null

  const handleFilterChange = (key: keyof GetPatientsParams, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value || undefined }))
  }

  const modalContent = (
    <div
      ref={modalRef}
      className="fixed z-[100] w-80 rounded-lg border border-slate-300 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800"
      style={{ top: position.top, left: position.left }}
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">More Filters</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Min Age
            </label>
            <input
              type="number"
              min="0"
              value={localFilters.minAge !== undefined ? localFilters.minAge : ''}
              onChange={(e) =>
                handleFilterChange('minAge', e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder="0"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Max Age
            </label>
            <input
              type="number"
              min="0"
              value={localFilters.maxAge !== undefined ? localFilters.maxAge : ''}
              onChange={(e) =>
                handleFilterChange('maxAge', e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder="100"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Sort By
          </label>
          <select
            value={localFilters.sortBy || 'createdAt'}
            onChange={(e) =>
              handleFilterChange('sortBy', e.target.value as GetPatientsParams['sortBy'])
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400"
          >
            <option value="createdAt">Date Created</option>
            <option value="fullName">Name</option>
            <option value="visitCount">Visit Count</option>
            <option value="lastVisitAt">Last Visit</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Sort Order
          </label>
          <select
            value={localFilters.sortOrder || 'desc'}
            onChange={(e) =>
              handleFilterChange('sortOrder', e.target.value as GetPatientsParams['sortOrder'])
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null
}

