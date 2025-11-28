import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import PatientCard from '@components/patient/PatientCard'
import PatientFilters from '@components/patient/PatientFilters'
import Pagination from '@components/common/Pagination'
import { usePatientsData } from '@hooks/data/usePatientsData'
import { PlusIcon, FilterIcon } from '@assets/Icons'
import RotatingSpinner from '@components/spinner/TeethRotating'
import patientsteeth from '@assets/patientsList.png'
import type { GetPatientsParams } from '@api/patients'
import { useAppDispatch } from '@hooks/store'
import { clearAllFilters } from '@redux/slices/patientsSlice'


type DropdownFilterProps = {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  buttonRef: React.RefObject<HTMLButtonElement | null>
}

function DropdownFilter({
  label,
  value,
  options,
  onChange,
  isOpen,
  onToggle,
  onClose,
  buttonRef,
}: DropdownFilterProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    if (isOpen && buttonRef.current) {
      document.addEventListener('mousedown', handleClickOutside)
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, buttonRef])

  const selectedOption = options.find((opt) => opt.value === value)
  const displayText = selectedOption ? selectedOption.label : options[0]?.label || label

  const dropdownContent = isOpen ? (
    <div
      ref={dropdownRef}
      className="fixed z-[100] w-48 rounded-lg border border-slate-300 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
      style={{ top: position.top, left: position.left }}
    >
      <div className="max-h-60 overflow-y-auto p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              onChange(option.value)
              onClose()
            }}
            className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
              value === option.value
                ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  ) : null

  return (
    <div className="relative flex-shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 max-w-[calc((100%-2rem)/5)] min-w-[100px] ${
          value ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20' : ''
        }`}
      >
        <span className="truncate min-w-0">{displayText}</span>
        <svg
          className={`h-4 w-4 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {typeof document !== 'undefined' && createPortal(dropdownContent, document.body)}
    </div>
  )
}

export default function Patients() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const {
    patients,
    clinics,
    isLoading,
    currentPage,
    totalPages,
    total,
    limit,
    filters,
    filterDrawerOpen,
    search,
    activeFilterCount,
    setCurrentPage,
    setFilterDrawerOpen,
    setSearch,
    handleFiltersChange,
  } = usePatientsData()

  const [pendingFilters, setPendingFilters] = useState<{
    clinicId?: string
    gender?: GetPatientsParams['gender']
    consultationType?: GetPatientsParams['consultationType']
  }>({
    clinicId: filters.clinicId,
    gender: filters.gender,
    consultationType: filters.consultationType,
  })

  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const clinicButtonRef = useRef<HTMLButtonElement>(null)
  const genderButtonRef = useRef<HTMLButtonElement>(null)
  const consultationButtonRef = useRef<HTMLButtonElement>(null)
  const moreFiltersButtonRef = useRef<HTMLButtonElement>(null)
  const [pendingModalFilters, setPendingModalFilters] = useState<GetPatientsParams>(filters)

  useEffect(() => {
    setPendingFilters({
      clinicId: filters.clinicId,
      gender: filters.gender,
      consultationType: filters.consultationType,
    })
    setPendingModalFilters({
      ...filters,
      minAge: filters.minAge,
      maxAge: filters.maxAge,
      sortBy: filters.sortBy || 'createdAt',
      sortOrder: filters.sortOrder || 'desc',
    })
  }, [filters])

  const clinicOptions: Array<{ value: string; label: string }> = [
    { value: '', label: 'All Clinics' },
    ...clinics.map((clinic) => ({ value: clinic.id, label: clinic.name })),
  ]

  const genderOptions: Array<{ value: string; label: string }> = [
    { value: '', label: 'All Genders' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'unknown', label: 'Unknown' },
  ]

  const consultationTypeOptions: Array<{ value: string; label: string }> = [
    { value: '', label: 'All Types' },
    { value: 'one-time', label: 'One-time' },
    { value: 'treatment-plan', label: 'Treatment Plan' },
  ]

  const handleApplyFilters = () => {
    handleFiltersChange({
      ...filters,
      clinicId: pendingFilters.clinicId || undefined,
      gender: pendingFilters.gender || undefined,
      consultationType: pendingFilters.consultationType || undefined,
      minAge: pendingModalFilters.minAge,
      maxAge: pendingModalFilters.maxAge,
      sortBy: pendingModalFilters.sortBy || 'createdAt',
      sortOrder: pendingModalFilters.sortOrder || 'desc',
    })
  }

  const handleClearAllFilters = () => {
    dispatch(clearAllFilters())
    setPendingFilters({
      clinicId: undefined,
      gender: undefined,
      consultationType: undefined,
    })
    setPendingModalFilters({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })
  }

  const hasPendingChanges =
    pendingFilters.clinicId !== filters.clinicId ||
    pendingFilters.gender !== filters.gender ||
    pendingFilters.consultationType !== filters.consultationType ||
    pendingModalFilters.minAge !== filters.minAge ||
    pendingModalFilters.maxAge !== filters.maxAge ||
    pendingModalFilters.sortBy !== (filters.sortBy || 'createdAt') ||
    pendingModalFilters.sortOrder !== (filters.sortOrder || 'desc')

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-md bg-white/60 p-6 backdrop-blur-sm dark:bg-slate-900 lg:flex-row lg:items-center lg:gap-6">
        <img src={patientsteeth} alt="teeth" className="w-[120px] h-[120px]" />
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Patients</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Manage patient records, consultations, and medical history.
          </p>
          <button
            type="button"
            onClick={() => navigate('/patient/add')}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-100 to-green-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-green-200 hover:to-green-300 dark:from-green-800/30 dark:to-green-700/30 dark:text-slate-200 dark:hover:from-green-700/40 dark:hover:to-green-600/40"
          >
            <PlusIcon />
            Add Patient
          </button>
        </div>
        <div className="flex w-full flex-col gap-3 lg:max-w-xl">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search by name or patient ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400"
            />
            <button
              ref={moreFiltersButtonRef}
              type="button"
              onClick={() => setFilterDrawerOpen(true)}
              className={`inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap ${
                activeFilterCount > 0
                  ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                  : ''
              }`}
            >
              <FilterIcon />
              More Filters
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white dark:bg-blue-500">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible scrollbar-hide">
            <DropdownFilter
              label="Clinic"
              value={pendingFilters.clinicId || ''}
              options={clinicOptions}
              onChange={(value) =>
                setPendingFilters((prev) => ({ ...prev, clinicId: value || undefined }))
              }
              isOpen={openDropdown === 'clinic'}
              onToggle={() => setOpenDropdown(openDropdown === 'clinic' ? null : 'clinic')}
              onClose={() => setOpenDropdown(null)}
              buttonRef={clinicButtonRef}
            />
            <DropdownFilter
              label="Gender"
              value={pendingFilters.gender || ''}
              options={genderOptions}
              onChange={(value) =>
                setPendingFilters((prev) => ({
                  ...prev,
                  gender: (value || undefined) as GetPatientsParams['gender'],
                }))
              }
              isOpen={openDropdown === 'gender'}
              onToggle={() => setOpenDropdown(openDropdown === 'gender' ? null : 'gender')}
              onClose={() => setOpenDropdown(null)}
              buttonRef={genderButtonRef}
            />
            <DropdownFilter
              label="Consultation Type"
              value={pendingFilters.consultationType || ''}
              options={consultationTypeOptions}
              onChange={(value) =>
                setPendingFilters((prev) => ({
                  ...prev,
                  consultationType: (value || undefined) as GetPatientsParams['consultationType'],
                }))
              }
              isOpen={openDropdown === 'consultation'}
              onToggle={() =>
                setOpenDropdown(openDropdown === 'consultation' ? null : 'consultation')
              }
              onClose={() => setOpenDropdown(null)}
              buttonRef={consultationButtonRef}
            />
            <button
              type="button"
              onClick={handleApplyFilters}
              disabled={!hasPendingChanges}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400 max-w-[calc((100%-2rem)/5)] min-w-0 whitespace-nowrap"
            >
              <span className="truncate">Apply</span>
            </button>
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 max-w-[calc((100%-2rem)/5)] min-w-0 whitespace-nowrap"
            >
              <span className="truncate">Clear All</span>
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <RotatingSpinner />
      ) : patients.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          {search.trim() || activeFilterCount > 0
            ? 'No patients found matching your search or filters.'
            : 'No patients available. Use the button above to add new patients.'}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {patients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between rounded-2xl bg-white/60 p-4 backdrop-blur-sm dark:bg-slate-900/60">
              <div className="text-sm text-slate-600 dark:text-slate-300">
                Showing {((currentPage - 1) * limit) + 1} to{' '}
                {Math.min(currentPage * limit, total)} of {total} patients
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                maxVisiblePages={10}
              />
            </div>
          )}
        </>
      )}

      <PatientFilters
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filters}
        onPendingFiltersChange={setPendingModalFilters}
        buttonRef={moreFiltersButtonRef}
      />
    </section>
  )
}

