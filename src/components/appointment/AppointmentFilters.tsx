import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useClickOutside } from '@hooks/utils/useClickOutside'

type AppointmentFiltersProps = {
  isOpen: boolean
  onClose: () => void
  filters: {
    daysBefore?: number
    daysAfter?: number
  }
  onPendingFiltersChange: (filters: { daysBefore?: number; daysAfter?: number }) => void
  buttonRef?: React.RefObject<HTMLButtonElement | null>
}

export default function AppointmentFilters({
  isOpen,
  onClose,
  filters,
  onPendingFiltersChange,
  buttonRef,
}: AppointmentFiltersProps) {
  const [localFilters, setLocalFilters] = useState<{ daysBefore?: number; daysAfter?: number }>(filters)
  const modalRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const prevIsOpenRef = useRef(isOpen)

  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setLocalFilters(filters)
    }
    prevIsOpenRef.current = isOpen

    if (isOpen && buttonRef?.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const modalWidth = 320
      const modalHeight = 200
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
  }, [isOpen, filters, buttonRef])

  useClickOutside({
    isEnabled: isOpen,
    refs: buttonRef ? [modalRef, buttonRef] : [modalRef],
    handler: onClose,
  })

  const handleFilterChange = (key: 'daysBefore' | 'daysAfter', value: any) => {
    const newFilters = { ...localFilters, [key]: value || undefined }
    setLocalFilters(newFilters)
    onPendingFiltersChange(newFilters)
  }

  if (!isOpen) return null

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
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Days Before
          </label>
          <input
            type="number"
            min="0"
            value={localFilters.daysBefore !== undefined && localFilters.daysBefore >= 0 ? localFilters.daysBefore : ''}
            onChange={(e) =>
              handleFilterChange('daysBefore', e.target.value ? parseInt(e.target.value, 10) : undefined)
            }
            placeholder="0"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Days After
          </label>
          <input
            type="number"
            min="0"
            value={localFilters.daysAfter !== undefined ? localFilters.daysAfter : ''}
            onChange={(e) =>
              handleFilterChange('daysAfter', e.target.value ? parseInt(e.target.value, 10) : undefined)
            }
            placeholder="0"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400"
          />
        </div>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null
}

