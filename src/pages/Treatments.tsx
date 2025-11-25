import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getTreatments, deleteTreatment, type Treatment } from '@api/treatments'
import ConfirmationModal from '@components/common/ConfirmationModal'
import Pagination from '@components/common/Pagination'
import TreatmentCard from '@components/treatment/TreatmentCard'
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

export default function Treatments() {
  const navigate = useNavigate()
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'fees' | 'duration' | 'createdAt' | ''>('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [treatmentToDelete, setTreatmentToDelete] = useState<Treatment | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, sortBy, sortOrder])

  useEffect(() => {
    const fetchTreatments = async () => {
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

        const response = await getTreatments(params)
        setTreatments(response.treatments)
        setTotalPages(response.totalPages)
        setTotal(response.total)
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          'Unable to fetch treatments. Please try again.'
        toast.error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTreatments()
  }, [currentPage, limit, debouncedSearch, sortBy, sortOrder])

  const handleDelete = (treatment: Treatment) => {
    setTreatmentToDelete(treatment)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!treatmentToDelete) return

    try {
      setIsDeleting(true)
      await deleteTreatment(treatmentToDelete.id)
      toast.success('Treatment deleted successfully.')
      setDeleteModalOpen(false)
      setTreatmentToDelete(null)

      if (treatments.length === 1 && currentPage > 1) {
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

        const response = await getTreatments(params)
        setTreatments(response.treatments)
        setTotalPages(response.totalPages)
        setTotal(response.total)
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to delete treatment. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl bg-white/60 p-6 backdrop-blur-sm dark:bg-slate-900/60 lg:flex-row lg:items-center lg:gap-6">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Treatments</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Manage standard treatments, timelines, and resources.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:max-w-xl">
          <input
            type="text"
            placeholder="Search by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400"
          />
          <div className="flex gap-3">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'fees' | 'duration' | 'createdAt' | '')
              }
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400"
            >
              <option value="">Sort by</option>
              <option value="fees">Fees</option>
              <option value="duration">Duration</option>
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
          onClick={() => navigate('/treatments/add')}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <PlusIcon />
          Add Treatment
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-2xl bg-white/60 p-12 backdrop-blur-sm dark:bg-slate-900/60">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : treatments.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          {search.trim()
            ? 'No treatments found matching your search.'
            : 'No treatments available. Use the button above to add new treatment templates.'}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {treatments.map((treatment) => (
              <TreatmentCard
                key={treatment.id}
                treatment={{
                  name: treatment.name,
                  description: treatment.description,
                  minDuration: treatment.minDuration,
                  maxDuration: treatment.maxDuration,
                  avgDuration: treatment.avgDuration,
                  minFees: treatment.minFees,
                  maxFees: treatment.maxFees,
                  avgFees: treatment.avgFees,
                  followUpRequired: treatment.followUpRequired ?? false,
                  followUpAfterDays: treatment.followUpAfterDays,
                  steps: treatment.steps ?? [],
                  aftercare: treatment.aftercare ?? [],
                  risks: treatment.risks ?? [],
                  images: treatment.images ?? [],
                }}
                showEditActions={true}
                onEdit={() => navigate(`/treatments/edit/${treatment.id}`)}
                onDelete={() => handleDelete(treatment)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between rounded-2xl bg-white/60 p-4 backdrop-blur-sm dark:bg-slate-900/60">
              <div className="text-sm text-slate-600 dark:text-slate-300">
                Showing {((currentPage - 1) * limit) + 1} to{' '}
                {Math.min(currentPage * limit, total)} of {total} treatments
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
          setTreatmentToDelete(null)
        }}
        onConfirm={confirmDelete}
        title="Delete Treatment"
        message={
          treatmentToDelete
            ? `Are you sure you want to delete "${treatmentToDelete.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this treatment? This action cannot be undone.'
        }
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        confirmButtonClassName="bg-red-600 hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-400 disabled:opacity-50"
      />
    </section>
  )
}
