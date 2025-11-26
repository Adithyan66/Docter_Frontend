import { useState, useEffect } from 'react'
import type { ClinicName, GetPatientsParams } from '@api/patients'

type PatientFiltersProps = {
  isOpen: boolean
  onClose: () => void
  filters: GetPatientsParams
  onFiltersChange: (filters: GetPatientsParams) => void
  clinics: ClinicName[]
}

export default function PatientFilters({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  clinics,
}: PatientFiltersProps) {
  const [localFilters, setLocalFilters] = useState<GetPatientsParams>(filters)

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters)
    }
  }, [isOpen, filters])

  if (!isOpen) return null

  const handleFilterChange = (key: keyof GetPatientsParams, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value || undefined }))
  }

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const handleClearFilters = () => {
    const clearedFilters: GetPatientsParams = {
      page: filters.page,
      limit: filters.limit,
      sortBy: filters.sortBy || 'createdAt',
      sortOrder: filters.sortOrder || 'desc',
    }
    setLocalFilters(clearedFilters)
  }

  const hasActiveFilters =
    localFilters.search ||
    localFilters.patientId ||
    localFilters.clinicId ||
    localFilters.gender ||
    localFilters.consultationType ||
    localFilters.minAge !== undefined ||
    localFilters.maxAge !== undefined

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={onClose}
      ></div>
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto bg-white shadow-xl dark:bg-slate-900">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <svg
              className="h-6 w-6"
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

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Search
            </label>
            <input
              type="text"
              value={localFilters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by name or patient ID..."
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Patient ID (Exact Match)
            </label>
            <input
              type="text"
              value={localFilters.patientId || ''}
              onChange={(e) => handleFilterChange('patientId', e.target.value)}
              placeholder="e.g., ABC-123"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Clinic
            </label>
            <select
              value={localFilters.clinicId || ''}
              onChange={(e) => handleFilterChange('clinicId', e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400"
            >
              <option value="">All Clinics</option>
              {clinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Gender
            </label>
            <select
              value={localFilters.gender || ''}
              onChange={(e) =>
                handleFilterChange('gender', e.target.value as GetPatientsParams['gender'])
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400"
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Consultation Type
            </label>
            <select
              value={localFilters.consultationType || ''}
              onChange={(e) =>
                handleFilterChange(
                  'consultationType',
                  e.target.value as GetPatientsParams['consultationType']
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400"
            >
              <option value="">All Types</option>
              <option value="one-time">One-time</option>
              <option value="treatment-plan">Treatment Plan</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Sort By
            </label>
            <select
              value={localFilters.sortBy || 'createdAt'}
              onChange={(e) =>
                handleFilterChange('sortBy', e.target.value as GetPatientsParams['sortBy'])
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400"
            >
              <option value="createdAt">Date Created</option>
              <option value="fullName">Name</option>
              <option value="visitCount">Visit Count</option>
              <option value="lastVisitAt">Last Visit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Sort Order
            </label>
            <select
              value={localFilters.sortOrder || 'desc'}
              onChange={(e) =>
                handleFilterChange('sortOrder', e.target.value as GetPatientsParams['sortOrder'])
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Clear Filters
            </button>
            <button
              type="button"
              onClick={handleApplyFilters}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

