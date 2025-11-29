import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import ConfirmationModal from '@components/common/ConfirmationModal'
import Pagination from '@components/common/Pagination'
import ClinicCard from '@components/clinic/ClinicCard'
import { useClinics } from '@hooks/data/useClinics'
import { PlusIcon } from '@assets/Icons'
import clinicIcon from '@assets/clinic.png'
import { useClickOutside } from '@hooks/utils/useClickOutside'

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

  useClickOutside({
    isEnabled: isOpen,
    refs: [dropdownRef, buttonRef],
    handler: onClose,
  })

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }
  }, [isOpen, buttonRef])

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
        className={`flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 ${
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

export default function Clinics() {
  const navigate = useNavigate()
  const {
    clinics,
    isLoading,
    currentPage,
    totalPages,
    total,
    limit,
    search,
    sortBy,
    sortOrder,
    deleteModalOpen,
    clinicToDelete,
    isDeleting,
    setCurrentPage,
    setSearch,
    setSortBy,
    setSortOrder,
    handleDelete,
    confirmDelete,
    closeDeleteModal,
  } = useClinics()

  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const sortByButtonRef = useRef<HTMLButtonElement>(null)
  const sortOrderButtonRef = useRef<HTMLButtonElement>(null)

  const sortByOptions: Array<{ value: string; label: string }> = [
    { value: '', label: 'Sort by' },
    { value: 'name', label: 'Name' },
    { value: 'city', label: 'City' },
    { value: 'createdAt', label: 'Date Created' },
  ]

  const sortOrderOptions: Array<{ value: string; label: string }> = [
    { value: 'asc', label: 'Ascending' },
    { value: 'desc', label: 'Descending' },
  ]

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-md bg-white/60 p-6 backdrop-blur-sm dark:bg-slate-900 lg:flex-row lg:items-center lg:gap-6">
        <img src={clinicIcon} alt="clinic" className="w-[120px] h-[120px]" />
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Clinics</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Manage clinic locations, contact information, and working hours.
          </p>
          <button
            type="button"
            onClick={() => navigate('/clinics/add')}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-100 to-green-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-green-200 hover:to-green-300 dark:from-green-900 dark:to-green-800 dark:text-slate-200 dark:hover:from-green-800/50 dark:hover:to-green-700/50"
          >
            <PlusIcon />
            Add Clinic
          </button>
        </div>
        <div className="flex w-full flex-col gap-3 lg:max-w-xl">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search by name or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible scrollbar-hide">
            <DropdownFilter
              label="Sort by"
              value={sortBy || ''}
              options={sortByOptions}
              onChange={(value) =>
                setSortBy((value || '') as 'name' | 'city' | 'createdAt' | '')
              }
              isOpen={openDropdown === 'sortBy'}
              onToggle={() => setOpenDropdown(openDropdown === 'sortBy' ? null : 'sortBy')}
              onClose={() => setOpenDropdown(null)}
              buttonRef={sortByButtonRef}
            />
            {sortBy && (
              <DropdownFilter
                label="Order"
                value={sortOrder}
                options={sortOrderOptions}
                onChange={(value) => setSortOrder(value as 'asc' | 'desc')}
                isOpen={openDropdown === 'sortOrder'}
                onToggle={() => setOpenDropdown(openDropdown === 'sortOrder' ? null : 'sortOrder')}
                onClose={() => setOpenDropdown(null)}
                buttonRef={sortOrderButtonRef}
              />
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-2xl bg-white/60 p-12 backdrop-blur-sm dark:bg-slate-900/60">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : clinics.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          {search.trim()
            ? 'No clinics found matching your search.'
            : 'No clinics available. Use the button above to add new clinic locations.'}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {clinics.map((clinic) => (
              <ClinicCard
                key={clinic.id}
                clinic={{
                  name: clinic.name,
                  clinicId: clinic.clinicId,
                  address: clinic.address,
                  city: clinic.city,
                  state: clinic.state,
                  pincode: clinic.pincode,
                  phone: clinic.phone,
                  email: clinic.email,
                  website: clinic.website,
                  locationUrl: clinic.locationUrl,
                  workingDays: clinic.workingDays,
                  treatments: clinic.treatments
                    ? clinic.treatments.map((t) =>
                        typeof t === 'string'
                          ? { id: t, name: 'Unknown' }
                          : { id: t.id, name: t.name || 'Unknown' }
                      )
                    : undefined,
                  images: clinic.images,
                  notes: clinic.notes,
                  isActive: clinic.isActive,
                }}
                showEditActions={true}
                onEdit={() => navigate(`/clinics/edit/${clinic.id}`)}
                onDelete={() => handleDelete(clinic)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between rounded-2xl bg-white/60 p-4 backdrop-blur-sm dark:bg-slate-900/60">
              <div className="text-sm text-slate-600 dark:text-slate-300">
                Showing {((currentPage - 1) * limit) + 1} to{' '}
                {Math.min(currentPage * limit, total)} of {total} clinics
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

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Clinic"
        message={
          clinicToDelete
            ? `Are you sure you want to delete "${clinicToDelete.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this clinic? This action cannot be undone.'
        }
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        confirmButtonClassName="bg-red-600 hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-400 disabled:opacity-50"
      />
    </section>
  )
}

