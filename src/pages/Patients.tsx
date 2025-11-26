import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getPatients, getClinicNames, type Patient, type GetPatientsParams, type ClinicName } from '@api/patients'
import PatientCard from '@components/patient/PatientCard'
import PatientFilters from '@components/patient/PatientFilters'
import Pagination from '@components/common/Pagination'
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

const FilterIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
)

export default function Patients() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState<Patient[]>([])
  const [clinics, setClinics] = useState<ClinicName[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit] = useState(10)
  const [filters, setFilters] = useState<GetPatientsParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [search, setSearch] = useState('')

  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const clinicList = await getClinicNames()
        setClinics(clinicList)
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          'Unable to fetch clinics. Please try again.'
        toast.error(errorMessage)
      }
    }

    fetchClinics()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setIsLoading(true)
        const params: GetPatientsParams = {
          ...filters,
          page: currentPage,
          limit,
        }

        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim()
        }

        const response = await getPatients(params)
        setPatients(response.patients)
        setTotalPages(response.totalPages)
        setTotal(response.total)
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          'Unable to fetch patients. Please try again.'
        toast.error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatients()
  }, [currentPage, limit, debouncedSearch, filters])

  const handleFiltersChange = (newFilters: GetPatientsParams) => {
    setFilters(newFilters)
    setCurrentPage(1)
    setFilterDrawerOpen(false)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.patientId) count++
    if (filters.clinicId) count++
    if (filters.gender) count++
    if (filters.consultationType) count++
    if (filters.minAge !== undefined) count++
    if (filters.maxAge !== undefined) count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl bg-white/60 p-6 backdrop-blur-sm dark:bg-slate-900/60 lg:flex-row lg:items-center lg:gap-6">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Patients</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Manage patient records, consultations, and medical history.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:max-w-xl">
          <input
            type="text"
            placeholder="Search by name or patient ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400"
          />
          <button
            type="button"
            onClick={() => setFilterDrawerOpen(true)}
            className={`inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 ${
              activeFilterCount > 0
                ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                : ''
            }`}
          >
            <FilterIcon />
            Filters
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white dark:bg-blue-500">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
        <button
          type="button"
          onClick={() => navigate('/patient/add')}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <PlusIcon />
          Add Patient
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-2xl bg-white/60 p-12 backdrop-blur-sm dark:bg-slate-900/60">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : patients.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          {search.trim() || activeFilterCount > 0
            ? 'No patients found matching your search or filters.'
            : 'No patients available. Use the button above to add new patients.'}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
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
        onFiltersChange={handleFiltersChange}
        clinics={clinics}
      />
    </section>
  )
}

