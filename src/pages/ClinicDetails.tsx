import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getClinic, deleteClinic } from '@api/clinics'
import ConfirmationModal from '@components/common/ConfirmationModal'
import RotatingSpinner from '@components/spinner/TeethRotating'
import clinicIcon from '@assets/clinic.png'

export default function ClinicDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [clinic, setClinic] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchClinic = async () => {
      if (!id) {
        navigate('/clinics')
        return
      }

      try {
        setIsLoading(true)
        const clinicData = await getClinic(id)
        setClinic(clinicData)
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          'Unable to fetch clinic. Please try again.'
        toast.error(errorMessage)
        navigate('/clinics')
      } finally {
        setIsLoading(false)
      }
    }

    fetchClinic()
  }, [id, navigate])

  const handleDelete = () => {
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!id || !clinic) return

    try {
      setIsDeleting(true)
      await deleteClinic(id)
      toast.success('Clinic deleted successfully.')
      navigate('/clinics')
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to delete clinic. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
      setDeleteModalOpen(false)
    }
  }

  const closeDeleteModal = () => {
    setDeleteModalOpen(false)
  }

  if (isLoading) {
    return <RotatingSpinner />
  }

  if (!clinic) {
    return (
      <section className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          Clinic not found.
        </div>
      </section>
    )
  }

  const formatTime = (time?: string) => {
    if (!time) return '-'
    return time
  }

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const getWorkingDaysDisplay = () => {
    if (!clinic.workingDays || clinic.workingDays.length === 0) {
      return 'No working days set'
    }

    const workingDaysMap = new Map(
      clinic.workingDays.map((wd: any) => [wd.day, { start: wd.startTime, end: wd.endTime }])
    )

    return daysOfWeek
      .filter((day) => workingDaysMap.has(day))
      .map((day) => {
        const times = workingDaysMap.get(day)!
        const timeStr = times.start || times.end ? `${formatTime(times.start)} - ${formatTime(times.end)}` : 'Closed'
        return `${day.substring(0, 3)}: ${timeStr}`
      })
      .join(', ')
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-md bg-white/60 p-6 backdrop-blur-sm dark:bg-slate-900 lg:flex-row lg:items-center lg:gap-6">
        <img src={clinicIcon} alt="clinic" className="w-[120px] h-[120px]" />
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{clinic.name}</h1>
          {clinic.clinicId && (
            <p className="text-slate-600 dark:text-slate-300">ID: {clinic.clinicId}</p>
          )}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => navigate(`/clinics/edit/${id}`)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:cursor-pointer hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:cursor-pointer hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-400"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Name</span>
              <p className="mt-1 text-sm text-slate-900 dark:text-white">{clinic.name || '-'}</p>
            </div>
            {clinic.clinicId && (
              <div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Clinic ID</span>
                <p className="mt-1 text-sm text-slate-900 dark:text-white">{clinic.clinicId}</p>
              </div>
            )}
            <div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Status</span>
              <p className="mt-1">
                <span
                  className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                    clinic.isActive
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {clinic.isActive ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Address</h2>
          <div className="space-y-4">
            <div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Address</span>
              <p className="mt-1 text-sm text-slate-900 dark:text-white">
                {[clinic.address, clinic.city, clinic.state, clinic.pincode]
                  .filter(Boolean)
                  .join(', ') || '-'}
              </p>
            </div>
            {clinic.city && (
              <div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">City</span>
                <p className="mt-1 text-sm text-slate-900 dark:text-white">{clinic.city}</p>
              </div>
            )}
            {clinic.state && (
              <div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">State</span>
                <p className="mt-1 text-sm text-slate-900 dark:text-white">{clinic.state}</p>
              </div>
            )}
            {clinic.pincode && (
              <div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Pincode</span>
                <p className="mt-1 text-sm text-slate-900 dark:text-white">{clinic.pincode}</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Contact Information</h2>
          <div className="space-y-4">
            {clinic.phone && (
              <div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Phone</span>
                <p className="mt-1 text-sm text-slate-900 dark:text-white">{clinic.phone}</p>
              </div>
            )}
            {clinic.email && (
              <div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Email</span>
                <p className="mt-1 text-sm text-slate-900 dark:text-white">{clinic.email}</p>
              </div>
            )}
            {clinic.website && (
              <div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Website</span>
                <p className="mt-1">
                  <a
                    href={clinic.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {clinic.website}
                  </a>
                </p>
              </div>
            )}
            {clinic.locationUrl && (
              <div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Location URL</span>
                <p className="mt-1">
                  <a
                    href={clinic.locationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {clinic.locationUrl}
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Additional Information</h2>
          <div className="space-y-4">
            <div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Working Days</span>
              <p className="mt-1 text-sm text-slate-900 dark:text-white">{getWorkingDaysDisplay()}</p>
            </div>
            {clinic.treatments && clinic.treatments.length > 0 && (
              <div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Treatments</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {clinic.treatments.map((treatment: any, index: number) => {
                    const treatmentName =
                      typeof treatment === 'object' && treatment !== null && 'name' in treatment
                        ? treatment.name
                        : typeof treatment === 'string'
                          ? treatment
                          : 'Unknown'
                    return (
                      <span
                        key={typeof treatment === 'object' && treatment !== null && 'id' in treatment ? treatment.id : index}
                        className="inline-block rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      >
                        {treatmentName}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}
            {clinic.notes && (
              <div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Notes</span>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-900 dark:text-white">{clinic.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Clinic"
        message={
          clinic
            ? `Are you sure you want to delete "${clinic.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this clinic? This action cannot be undone.'
        }
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        confirmButtonClassName="bg-red-600 hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-400 disabled:opacity-50"
      />
    </section>
  )
}

