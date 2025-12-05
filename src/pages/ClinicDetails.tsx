import { useParams, useNavigate } from 'react-router-dom'
import ConfirmationModal from '@components/common/ConfirmationModal'
import DeleteConfirmationModal from '@components/common/DeleteConfirmationModal'
import PageHeader from '@components/common/PageHeader'
import RotatingSpinner from '@components/spinner/TeethRotating'
import ImageViewerModal from '@components/common/ImageViewerModal'
import { useClinicDetails } from '@hooks/data/useClinicDetails'
import clinicIcon from '@assets/clinic.png'

export default function ClinicDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    clinic,
    isLoading,
    dateFilters,
    viewerImage,
    isViewerOpen,
    showAllImages,
    startDateFrom,
    startDateTo,
    deleteModalOpen,
    statusModalOpen,
    isTogglingStatus,
    displayedImages,
    hasMoreImages,
    workingDaysMap,
    maxRevenue,
    daysOfWeek,
    formatDate,
    formatDateTime,
    formatTime,
    handleApplyDateFilter,
    handleClearDateFilter,
    setStartDateFrom,
    setStartDateTo,
    setViewerImage,
    setIsViewerOpen,
    setShowAllImages,
    handleDelete,
    confirmDelete,
    closeDeleteModal,
    handleToggleStatus,
    confirmToggleStatus,
    closeStatusModal,
    getPaymentMethodColor,
    getPaymentMethodLabel,
  } = useClinicDetails(id)

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

  const statistics = clinic.statistics

  return (
    <section className="space-y-6">
      <PageHeader
        title={clinic.name}
        description="View comprehensive clinic information and statistics."
        image={{
          src: clinicIcon,
          alt: 'clinic',
          className: 'w-[120px] h-[120px]',
        }}
        actionButtons={[
          {
            label: 'Edit',
            onClick: () => navigate(`/clinics/edit/${id}`),
            className:
              'inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-blue-200 hover:to-blue-300 dark:from-blue-800/30 dark:to-blue-700/30 dark:text-slate-200 dark:hover:from-blue-700/40 dark:hover:to-blue-600/40',
          },
          {
            label: clinic.isActive ? 'Set Inactive' : 'Set Active',
            onClick: handleToggleStatus,
            disabled: isTogglingStatus,
            isLoading: isTogglingStatus,
            loadingLabel: clinic.isActive ? 'Deactivating...' : 'Activating...',
            className: `inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
              clinic.isActive
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
                clinic.isActive
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
              {clinic.isActive ? 'ACTIVE' : 'INACTIVE'}
            </div>
            <div className="flex flex-col items-center space-y-4 mb-8">
              {clinic.images && clinic.images.length > 0 ? (
                <img
                  src={clinic.images[0]}
                  alt={clinic.name}
                  className="h-32 w-32 rounded-full object-cover border-4 border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    setViewerImage(clinic.images![0])
                    setIsViewerOpen(true)
                  }}
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  <img src={clinicIcon} alt="clinic" className="w-20 h-20 opacity-50" />
                </div>
              )}
              <div className="text-center">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {clinic.name}
                </h2>
                {clinic.clinicId && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    ID: {clinic.clinicId}
                  </p>
                )}
              </div>
            </div>

            <div className="w-full space-y-6">
              {clinic.address && (
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Address
                  </span>
                  <p className="text-xs font-medium text-slate-900 dark:text-white text-center whitespace-pre-line">
                    {[clinic.address, clinic.city, clinic.state, clinic.pincode]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              )}

              {clinic.city && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                      City
                    </span>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {clinic.city}
                    </p>
                  </div>
                  {clinic.state && (
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                        State
                      </span>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {clinic.state}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {clinic.pincode && (
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Pincode
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {clinic.pincode}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {clinic.phone && (
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Phone
                    </span>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      {clinic.phone}
                    </p>
                  </div>
                )}
                {clinic.email && (
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Email
                    </span>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-full text-center">
                      {clinic.email}
                    </p>
                  </div>
                )}
              </div>

              {clinic.website && (
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Website
                  </span>
                  <a
                    href={clinic.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400 text-center break-all"
                  >
                    {clinic.website}
                  </a>
                </div>
              )}

              {clinic.locationUrl && (
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Location URL
                  </span>
                  <a
                    href={clinic.locationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400 text-center break-all"
                  >
                    {clinic.locationUrl}
                  </a>
                </div>
              )}

              {clinic.workingDays && clinic.workingDays.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-3 block ml-1">
                    Working Days
                  </span>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800">
                        <tr>
                          <th className="px-2 py-1.5 text-left font-medium text-slate-700 dark:text-slate-300">
                            Day
                          </th>
                          <th className="px-2 py-1.5 text-left font-medium text-slate-700 dark:text-slate-300">
                            Time
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {daysOfWeek.map((day) => {
                          const workingDay = workingDaysMap.get(day)
                          return (
                            <tr
                              key={day}
                              className={workingDay ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}
                            >
                              <td className="px-2 py-1.5 text-slate-900 dark:text-white">
                                {day}
                              </td>
                              <td className="px-2 py-1.5 text-slate-900 dark:text-white">
                                {workingDay && workingDay.start && workingDay.end
                                  ? `${formatTime(workingDay.start)} - ${formatTime(workingDay.end)}`
                                  : 'Closed'}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {clinic.treatments && clinic.treatments.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-3 block ml-1">
                    Treatments ({clinic.treatments.length})
                  </span>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {clinic.treatments.map((treatment: any, index: number) => {
                      const treatmentName =
                        typeof treatment === 'object' && treatment !== null && 'name' in treatment
                          ? treatment.name
                          : typeof treatment === 'string'
                            ? treatment
                            : 'Unknown'
                      return (
                        <span
                          key={
                            typeof treatment === 'object' && treatment !== null && 'id' in treatment
                              ? treatment.id
                              : index
                          }
                          className="inline-block rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        >
                          {treatmentName}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {displayedImages.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-3 block text-center">
                    Images ({clinic.images?.length || 0})
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {displayedImages.map((imageUrl, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img
                          src={imageUrl}
                          alt={`${clinic.name} ${index + 1}`}
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
                      className="mt-2 w-full rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-blue-200 hover:to-blue-300 dark:from-blue-800/30 dark:to-blue-700/30 dark:text-slate-200 dark:hover:from-blue-700/40 dark:hover:to-blue-600/40"
                    >
                      Show More ({clinic.images!.length - displayedImages.length} more)
                    </button>
                  )}
                  {showAllImages && hasMoreImages && (
                    <button
                      type="button"
                      onClick={() => setShowAllImages(false)}
                      className="mt-2 w-full rounded-lg bg-gradient-to-r from-slate-100 to-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-slate-200 hover:to-slate-300 dark:from-slate-800/30 dark:to-slate-700/30 dark:text-slate-200 dark:hover:from-slate-700/40 dark:hover:to-slate-600/40"
                    >
                      Show Less
                    </button>
                  )}
                </div>
              )}

              {clinic.notes && (
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Notes
                  </span>
                  <p className="text-xs font-medium text-slate-900 dark:text-white text-center whitespace-pre-line">
                    {clinic.notes}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Created At
                  </span>
                  <p className="text-xs font-medium text-slate-900 dark:text-white text-center">
                    {formatDateTime(clinic.createdAt)}
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Updated At
                  </span>
                  <p className="text-xs font-medium text-slate-900 dark:text-white text-center">
                    {formatDateTime(clinic.updatedAt)}
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

                  {statistics.treatments && statistics.treatments.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Treatments ({statistics.treatments.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {statistics.treatments.map((treatment) => (
                          <div
                            key={treatment.treatmentId}
                            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                          >
                            <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                              {treatment.treatmentName}
                            </h5>
                            <div className="flex justify-center gap-4 mb-4">
                              <div className="text-center">
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                  Total Paid
                                </p>
                                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                  ₹{treatment.totalPaid.toLocaleString()}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                  Total Cost
                                </p>
                                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                  ₹{treatment.totalCost.toLocaleString()}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                  Outstanding
                                </p>
                                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                  ₹{treatment.outstanding.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                              <span className="text-xs text-slate-600 dark:text-slate-400">
                                Course Count
                              </span>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                {treatment.courseCount}
                              </p>
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

                    {statistics.timeMetrics && (statistics.timeMetrics.earliestStartDate || statistics.timeMetrics.latestStartDate) && (
                      <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-6 shadow-lg border border-amber-200 dark:border-amber-800">
                        <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-4">
                          Time Metrics
                        </h4>
                        <div className="space-y-3">
                          {statistics.timeMetrics.earliestStartDate && (
                            <div>
                              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                Earliest Start Date
                              </p>
                              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                                {formatDate(statistics.timeMetrics.earliestStartDate)}
                              </p>
                            </div>
                          )}
                          {statistics.timeMetrics.latestStartDate && (
                            <div>
                              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                Latest Start Date
                              </p>
                              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                                {formatDate(statistics.timeMetrics.latestStartDate)}
                              </p>
                            </div>
                          )}
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
                    )}
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
        alt={clinic.name || 'Clinic image'}
      />

      {clinic && (
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
          title="Delete Clinic"
          message="This action cannot be undone. This will permanently delete the clinic and all associated data."
          confirmText="Delete Clinic"
          confirmationWord={clinic.name}
        />
      )}

      <ConfirmationModal
        isOpen={statusModalOpen}
        onClose={closeStatusModal}
        onConfirm={confirmToggleStatus}
        title="Change Clinic Status"
        message={
          clinic
            ? `Are you sure you want to mark "${clinic.name}" as ${!clinic.isActive ? 'active' : 'inactive'}?`
            : `Are you sure you want to change the clinic status?`
        }
        confirmText={isTogglingStatus ? (clinic?.isActive ? 'Deactivating...' : 'Activating...') : 'Confirm'}
        cancelText="Cancel"
        confirmButtonClassName="bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400 disabled:opacity-50"
      />
    </section>
  )
}
