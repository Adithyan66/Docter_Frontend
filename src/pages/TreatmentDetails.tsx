import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import treatmentLogo from '@assets/treatment.png'
import RotatingSpinner from '@components/spinner/TeethRotating'
import PageHeader from '@components/common/PageHeader'
import ImageViewerModal from '@components/common/ImageViewerModal'
import DeleteConfirmationModal from '@components/common/DeleteConfirmationModal'
import ConfirmationModal from '@components/common/ConfirmationModal'
import { useTreatmentDetails } from '@hooks/data/useTreatmentDetails'
import { updateTreatment, deleteTreatment } from '@api/treatments'
import toast from 'react-hot-toast'

const INITIAL_IMAGES_TO_SHOW = 6

export default function TreatmentDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [viewerImage, setViewerImage] = useState<string | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [showAllImages, setShowAllImages] = useState(false)
  const [startDateFrom, setStartDateFrom] = useState('')
  const [startDateTo, setStartDateTo] = useState('')
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    treatment,
    isLoading,
    dateFilters,
    handleDateFilterChange,
    formatDate,
    formatDateTime,
    fetchTreatment,
  } = useTreatmentDetails(id)

  const handleApplyDateFilter = () => {
    handleDateFilterChange(startDateFrom || undefined, startDateTo || undefined)
  }

  const handleClearDateFilter = () => {
    setStartDateFrom('')
    setStartDateTo('')
    handleDateFilterChange(undefined, undefined)
  }

  const handleToggleStatus = () => {
    setStatusModalOpen(true)
  }

  const confirmToggleStatus = async () => {
    if (!id || !treatment || isTogglingStatus) return

    try {
      setIsTogglingStatus(true)
      await updateTreatment(id, {
        isActive: !treatment.isActive,
      })
      toast.success(`Treatment marked as ${!treatment.isActive ? 'active' : 'inactive'} successfully.`)
      setStatusModalOpen(false)
      await fetchTreatment(dateFilters)
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to update treatment status. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsTogglingStatus(false)
    }
  }

  const closeStatusModal = () => {
    setStatusModalOpen(false)
  }

  const handleDelete = () => {
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!id || isDeleting) return

    try {
      setIsDeleting(true)
      await deleteTreatment(id)
      toast.success('Treatment deleted successfully.')
      setTimeout(() => navigate('/treatments'), 800)
    } catch (error: any) {
      setIsDeleting(false)
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to delete treatment. Please try again.'
      toast.error(errorMessage)
    }
  }

  const closeDeleteModal = () => {
    setDeleteModalOpen(false)
  }

  const displayedImages = treatment?.images
    ? showAllImages
      ? treatment.images
      : treatment.images.slice(0, INITIAL_IMAGES_TO_SHOW)
    : []

  const hasMoreImages = treatment?.images && treatment.images.length > INITIAL_IMAGES_TO_SHOW

  if (isLoading) {
    return <RotatingSpinner />
  }

  if (!treatment) {
    return (
      <section className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          Treatment not found.
        </div>
      </section>
    )
  }

  const statistics = treatment.statistics

  const getPaymentMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      cash: 'bg-green-500',
      card: 'bg-blue-500',
      upi: 'bg-purple-500',
      bank: 'bg-indigo-500',
      insurance: 'bg-yellow-500',
      online: 'bg-pink-500',
    }
    return colors[method] || 'bg-slate-500'
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Cash',
      card: 'Card',
      upi: 'UPI',
      bank: 'Bank',
      insurance: 'Insurance',
      online: 'Online',
    }
    return labels[method] || method
  }

  const maxRevenue = statistics?.revenue
    ? Math.max(...Object.values(statistics.revenue.byPaymentMethod))
    : 0

  return (
    <section className="space-y-6">
      <PageHeader
        title={treatment.name}
        description="View comprehensive treatment information and statistics."
        image={{
          src: treatmentLogo,
          alt: 'treatment',
          className: 'w-[120px] h-[120px]',
        }}
        actionButtons={[
          {
            label: 'Edit',
            onClick: () => navigate(`/treatments/edit/${id}`),
            className:
              'inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-blue-200 hover:to-blue-300 dark:from-blue-800/30 dark:to-blue-700/30 dark:text-slate-200 dark:hover:from-blue-700/40 dark:hover:to-blue-600/40',
          },
          {
            label: treatment.isActive ? 'Set Inactive' : 'Set Active',
            onClick: handleToggleStatus,
            disabled: isTogglingStatus,
            isLoading: isTogglingStatus,
            loadingLabel: treatment.isActive ? 'Deactivating...' : 'Activating...',
            className: `inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
              treatment.isActive
                ? 'bg-gradient-to-r from-orange-100 to-orange-200 hover:from-orange-200 hover:to-orange-300 dark:from-orange-800/30 dark:to-orange-700/30 dark:text-slate-200 dark:hover:from-orange-700/40 dark:hover:to-orange-600/40'
                : 'bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 dark:from-green-800/30 dark:to-green-700/30 dark:text-slate-200 dark:hover:from-green-700/40 dark:hover:to-green-600/40'
            }`,
          },
          {
            label: 'Delete',
            onClick: handleDelete,
            className:
              'inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-100 to-red-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-red-200 hover:to-red-300 dark:from-red-800/30 dark:to-red-700/30 dark:text-slate-200 dark:hover:from-red-700/40 dark:hover:to-red-600/40',
          },
        ]}
        filterControls={[
          {
            id: 'fromDate',
            type: 'date',
            label: 'From Date',
            value: startDateFrom,
            onChange: setStartDateFrom,
            placeholder: 'From Date',
          },
          {
            id: 'toDate',
            type: 'date',
            label: 'To Date',
            value: startDateTo,
            onChange: setStartDateTo,
            placeholder: 'To Date',
          },
        ]}
        onApplyFilters={handleApplyDateFilter}
        onClearFilters={
          dateFilters.startDateFrom || dateFilters.startDateTo
            ? handleClearDateFilter
            : undefined
        }
        hasPendingChanges={
          startDateFrom !== (dateFilters.startDateFrom || '') ||
          startDateTo !== (dateFilters.startDateTo || '')
        }
        applyButtonLabel="Apply"
        clearButtonLabel="Clear"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-1">
            <div
              className={`absolute left-0 top-0 z-10 ${
                treatment.isActive
                  ? 'bg-green-500 dark:bg-green-600'
                  : 'bg-red-500 dark:bg-red-600'
              } px-8 py-1 text-xs font-bold text-white shadow-md`}
              style={{
                transform: 'rotate(-45deg)',
                transformOrigin: 'top left',
                left: '-15px',
                top: '58px',
              }}
            >
              {treatment.isActive ? 'ACTIVE' : 'INACTIVE'}
            </div>
            <div className="flex flex-col items-center space-y-4 mb-8">
              {treatment.images && treatment.images.length > 0 ? (
                <img
                  src={treatment.images[0]}
                  alt={treatment.name}
                  className="h-32 w-32 rounded-full object-cover border-4 border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    setViewerImage(treatment.images![0])
                    setIsViewerOpen(true)
                  }}
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  <img src={treatmentLogo} alt="treatment" className="w-20 h-20 opacity-50" />
                </div>
              )}
              <div className="text-center">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {treatment.name}
                </h2>
                
              </div>
            </div>

            <div className="w-full space-y-6">
              {treatment.description && (
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Description
                  </span>
                  <p className="text-xs font-medium text-slate-900 dark:text-white text-center whitespace-pre-line">
                    {treatment.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Min Duration
                  </span>
                  {treatment.minDuration !== undefined ? (
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {treatment.minDuration} Months
                    </p>
                  ) : (
                    <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                      No data
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Max Duration
                  </span>
                  {treatment.maxDuration !== undefined ? (
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {treatment.maxDuration} Months
                    </p>
                  ) : (
                    <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                      No data
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Avg Duration
                  </span>
                  {treatment.avgDuration !== undefined ? (
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {treatment.avgDuration} Months
                    </p>
                  ) : (
                    <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                      No data
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Min Fees
                  </span>
                  {treatment.minFees !== undefined ? (
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      ₹{treatment.minFees.toLocaleString()}
                    </p>
                  ) : (
                    <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                      No data
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Max Fees
                  </span>
                  {treatment.maxFees !== undefined ? (
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      ₹{treatment.maxFees.toLocaleString()}
                    </p>
                  ) : (
                    <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                      No data
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Avg Fees
                  </span>
                  {treatment.avgFees !== undefined ? (
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      ₹{treatment.avgFees.toLocaleString()}
                    </p>
                  ) : (
                    <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                      No data
                    </span>
                  )}
                </div>
              </div>

              {treatment.steps && treatment.steps.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-3 block ml-1">
                    Steps
                  </span>
                  <ol className="list-decimal list-inside space-y-2">
                    {treatment.steps.map((step, index) => (
                      <li
                        key={index}
                        className="text-xs text-slate-700 dark:text-slate-300"
                      >
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {treatment.aftercare && treatment.aftercare.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-3 block ml-1">
                    Aftercare
                  </span>
                  <ul className="list-disc list-inside space-y-2">
                    {treatment.aftercare.map((item, index) => (
                      <li
                        key={index}
                        className="text-xs text-slate-700 dark:text-slate-300"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {treatment.risks && treatment.risks.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-3 block ml-1">
                    Risks
                  </span>
                  <ul className="list-disc list-inside space-y-2">
                    {treatment.risks.map((risk, index) => (
                      <li
                        key={index}
                        className="text-xs text-slate-700 dark:text-slate-300"
                      >
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Follow Up Required
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {treatment.followUpRequired ? 'Yes' : 'No'}
                  </p>
                </div>
                {treatment.followUpAfterDays !== undefined && (
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Follow Up After
                    </span>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {treatment.followUpAfterDays} days
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {treatment.isOneTime !== undefined && (
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Treatment Type
                    </span>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {treatment.isOneTime ? 'One Time' : 'Regular'}
                    </p>
                  </div>
                )}

                {treatment.regularVisitInterval && treatment.regularVisitInterval.interval && treatment.regularVisitInterval.unit && (
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Regular Visit Interval
                    </span>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Every {treatment.regularVisitInterval.interval} {treatment.regularVisitInterval.unit}
                    </p>
                  </div>
                )}
              </div>

              {displayedImages.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-3 block text-center">
                    Images ({treatment.images?.length || 0})
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {displayedImages.map((imageUrl, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img
                          src={imageUrl}
                          alt={`${treatment.name} ${index + 1}`}
                          className="h-full w-full rounded-lg object-cover border border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            setViewerImage(imageUrl)
                            setIsViewerOpen(true)
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  {hasMoreImages && !showAllImages && (
                    <button
                      type="button"
                      onClick={() => setShowAllImages(true)}
                      className="mt-2 w-full rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400"
                    >
                      Show More ({treatment.images!.length - INITIAL_IMAGES_TO_SHOW} more)
                    </button>
                  )}
                  {showAllImages && hasMoreImages && (
                    <button
                      type="button"
                      onClick={() => setShowAllImages(false)}
                      className="mt-2 w-full rounded-lg bg-slate-600 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-slate-500 dark:bg-slate-500 dark:hover:bg-slate-400"
                    >
                      Show Less
                    </button>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Created At
                  </span>
                  <p className="text-xs font-medium text-slate-900 dark:text-white text-center">
                    {formatDateTime(treatment.createdAt)}
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Updated At
                  </span>
                  <p className="text-xs font-medium text-slate-900 dark:text-white text-center">
                    {formatDateTime(treatment.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {statistics && (
            <>
              <div className="rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                      Statistics
                    </h2>
                    <div className="flex justify-center gap-32 mb-6">
                    <div className="text-center">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Total Paid
                      </p>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                        ₹{statistics.revenue.totalPaid.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Total Cost
                      </p>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        ₹{statistics.revenue.totalCost.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Outstanding
                      </p>
                      <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                        ₹{statistics.revenue.outstanding.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 shadow-lg border border-green-200 dark:border-green-800">
                    <h4 className="text-sm font-semibold text-green-900 dark:text-green-200 mb-4">
                      Patients
                    </h4>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Total Count
                        </span>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {statistics.patients.totalCount}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Unique Patients
                        </span>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {statistics.patients.uniqueCount}
                        </p>
                      </div>
                    </div>

                    <h4 className="text-sm font-semibold text-green-900 dark:text-green-200 mb-4 mt-6 pt-6 border-t border-green-200 dark:border-green-700">
                      Treatment Courses
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Total Courses
                        </span>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {statistics.treatmentCourses.totalCount}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className="text-center">
                          <p className="text-xs text-slate-600 dark:text-slate-400">Active</p>
                          <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                            {statistics.treatmentCourses.statusBreakdown.active}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-600 dark:text-slate-400">Paused</p>
                          <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                            {statistics.treatmentCourses.statusBreakdown.paused}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-600 dark:text-slate-400">Completed</p>
                          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {statistics.treatmentCourses.statusBreakdown.completed}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-600 dark:text-slate-400">Cancelled</p>
                          <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                            {statistics.treatmentCourses.statusBreakdown.cancelled}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-green-200 dark:border-green-700">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Medically Completed
                        </span>
                        <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                          {statistics.treatmentCourses.medicallyCompleted}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Payment Completed
                        </span>
                        <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                          {statistics.treatmentCourses.paymentCompleted}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 shadow-lg border border-green-200 dark:border-green-800">
                    <h4 className="text-sm font-semibold text-green-900 dark:text-green-200 mb-6">
                      Revenue by Payment Method
                    </h4>
                    <div className="space-y-3 mb-6">
                      {Object.entries(statistics.revenue.byPaymentMethod).map(([method, amount]) => (
                        <div key={method} className="flex items-center gap-3">
                          <div className="w-20 text-xs font-medium text-slate-600 dark:text-slate-400">
                            {getPaymentMethodLabel(method)}
                          </div>
                          <div className="flex-1">
                            <div className="relative w-full bg-white/80 dark:bg-slate-800/80 rounded-full h-6 shadow-inner overflow-hidden">
                              <div
                                className={`h-full rounded-full ${getPaymentMethodColor(method)} transition-all duration-1000 ease-out shadow-lg flex items-center justify-end pr-2`}
                                style={{
                                  width: `${maxRevenue > 0 ? (amount / maxRevenue) * 100 : 0}%`,
                                }}
                              >
                                {amount > 0 && (
                                  <span className="text-xs font-bold text-white drop-shadow-md">
                                    ₹{amount.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="w-24 text-right text-xs font-semibold text-slate-900 dark:text-white">
                            ₹{amount.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-green-200 dark:border-green-700">
                      <div>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Avg Paid per Course
                        </p>
                        <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                          ₹{statistics.revenue.averagePerCourse.paid.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Avg Cost per Course
                        </p>
                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          ₹{statistics.revenue.averagePerCourse.cost.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {statistics.clinics && statistics.clinics.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                      Clinics ({statistics.clinics.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {statistics.clinics.map((clinic) => (
                        <div
                          key={clinic.clinicId}
                          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                        >
                          <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                            {clinic.clinicName}
                          </h5>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-600 dark:text-slate-400">
                                Course Count
                              </span>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                {clinic.courseCount}
                              </p>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-600 dark:text-slate-400">
                                Total Paid
                              </span>
                              <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                ₹{clinic.totalPaid.toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-600 dark:text-slate-400">
                                Total Cost
                              </span>
                              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                ₹{clinic.totalCost.toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-600 dark:text-slate-400">
                                Outstanding
                              </span>
                              <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                                ₹{clinic.outstanding.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-6 shadow-lg border border-indigo-200 dark:border-indigo-800">
                    <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-200 mb-4">
                      Visits
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Total Visits
                        </span>
                        <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                          {statistics.visits.totalCount}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Avg per Course
                        </span>
                        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                          {statistics.visits.averagePerCourse.toFixed(1)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Total Billed
                        </span>
                        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                          ₹{statistics.visits.totalBilledAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Avg Billed Amount
                        </span>
                        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                          ₹{statistics.visits.averageBilledAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-6 shadow-lg border border-amber-200 dark:border-amber-800">
                    <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-4">
                      Time Metrics
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Earliest Start Date
                        </p>
                        <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                          {formatDate(statistics.timeMetrics.earliestStartDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Latest Start Date
                        </p>
                        <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                          {formatDate(statistics.timeMetrics.latestStartDate)}
                        </p>
                      </div>
                      {statistics.timeMetrics.averageDuration !== undefined && (
                        <div>
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Average Duration
                          </p>
                          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                            {statistics.timeMetrics.averageDuration.toFixed(1)} days
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 p-6 shadow-lg border border-rose-200 dark:border-rose-800">
                  <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-200 mb-4">
                    Completion Rates
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Treatment Completion
                        </span>
                        <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                          {statistics.completionRates.treatment.toFixed(2)}%
                        </span>
                      </div>
                      <div className="relative w-full bg-white/80 dark:bg-slate-800/80 rounded-full h-4 shadow-inner overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-1000 ease-out shadow-lg"
                          style={{ width: `${statistics.completionRates.treatment}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Payment Completion
                        </span>
                        <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                          {statistics.completionRates.payment.toFixed(2)}%
                        </span>
                      </div>
                      <div className="relative w-full bg-white/80 dark:bg-slate-800/80 rounded-full h-4 shadow-inner overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-1000 ease-out shadow-lg"
                          style={{ width: `${statistics.completionRates.payment}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Medical Completion
                        </span>
                        <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                          {statistics.completionRates.medical.toFixed(2)}%
                        </span>
                      </div>
                      <div className="relative w-full bg-white/80 dark:bg-slate-800/80 rounded-full h-4 shadow-inner overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-1000 ease-out shadow-lg"
                          style={{ width: `${statistics.completionRates.medical}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Cancellation Rate
                        </span>
                        <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                          {statistics.completionRates.cancellation.toFixed(2)}%
                        </span>
                      </div>
                      <div className="relative w-full bg-white/80 dark:bg-slate-800/80 rounded-full h-4 shadow-inner overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-red-400 to-red-600 transition-all duration-1000 ease-out shadow-lg"
                          style={{ width: `${statistics.completionRates.cancellation}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </>
          )}

          {!statistics && (
            <div className="rounded-2xl border border-slate-200 bg-white/60 p-12 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  No Statistics Available
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  Statistics will be available once treatment courses are created.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <ImageViewerModal
        isOpen={isViewerOpen}
        imageUrl={viewerImage}
        onClose={() => {
          setIsViewerOpen(false)
          setViewerImage(null)
        }}
        alt={treatment.name || 'Treatment image'}
      />

      <ConfirmationModal
        isOpen={statusModalOpen}
        onClose={closeStatusModal}
        onConfirm={confirmToggleStatus}
        title="Change Treatment Status"
        message={
          treatment
            ? `Are you sure you want to mark "${treatment.name}" as ${!treatment.isActive ? 'active' : 'inactive'}?`
            : `Are you sure you want to change the treatment status?`
        }
        confirmText={isTogglingStatus ? (treatment?.isActive ? 'Deactivating...' : 'Activating...') : 'Confirm'}
        cancelText="Cancel"
        confirmButtonClassName="bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400 disabled:opacity-50"
      />

      {treatment && (
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
          title="Delete Treatment"
          message="This action cannot be undone. This will permanently delete the treatment and all associated data."
          confirmText="Delete Treatment"
          confirmationWord={treatment.name}
        />
      )}
    </section>
  )
}
