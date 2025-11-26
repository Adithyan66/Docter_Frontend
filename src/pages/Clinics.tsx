import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getClinics, deleteClinic, type Clinic } from '@api/clinics'
import ConfirmationModal from '@components/common/ConfirmationModal'
import Pagination from '@components/common/Pagination'
import ClinicCard from '@components/clinic/ClinicCard'
import { useDebounce } from '@hooks/utils/useDebounce'

const PlusIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
)

export default function Clinics() {
  const navigate = useNavigate()
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'city' | 'createdAt' | ''>('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [clinicToDelete, setClinicToDelete] = useState<Clinic | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, sortBy, sortOrder])

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        setIsLoading(true)
        const params: any = {
          page: currentPage,
          limit,
        }

        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim()
        }

        if (sortBy) {
          params.sortBy = sortBy
          params.sortOrder = sortOrder
        }

        const response = await getClinics(params)
        setClinics(response.clinics)
        setTotalPages(response.totalPages)
        setTotal(response.total)
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          'Unable to fetch clinics. Please try again.'
        toast.error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchClinics()
  }, [currentPage, limit, debouncedSearch, sortBy, sortOrder])

  const handleDelete = (clinic: Clinic) => {
    setClinicToDelete(clinic)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!clinicToDelete) return

    try {
      setIsDeleting(true)
      await deleteClinic(clinicToDelete.id)
      toast.success('Clinic deleted successfully.')
      setDeleteModalOpen(false)
      setClinicToDelete(null)

      if (clinics.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      } else {
        const params: any = {
          page: currentPage,
          limit,
        }

        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim()
        }

        if (sortBy) {
          params.sortBy = sortBy
          params.sortOrder = sortOrder
        }

        const response = await getClinics(params)
        setClinics(response.clinics)
        setTotalPages(response.totalPages)
        setTotal(response.total)
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to delete clinic. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl bg-white/60 p-6 backdrop-blur-sm dark:bg-slate-900/60 lg:flex-row lg:items-center lg:gap-6">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Clinics</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Manage clinic locations, contact information, and working hours.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:max-w-xl">
          <input
            type="text"
            placeholder="Search by name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400"
          />
          <div className="flex gap-3">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'name' | 'city' | 'createdAt' | '')
              }
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400"
            >
              <option value="">Sort by</option>
              <option value="name">Name</option>
              <option value="city">City</option>
              <option value="createdAt">Date Created</option>
            </select>
            {sortBy && (
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/clinics/add')}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <PlusIcon />
          Add Clinic
        </button>
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
        onClose={() => {
          setDeleteModalOpen(false)
          setClinicToDelete(null)
        }}
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

