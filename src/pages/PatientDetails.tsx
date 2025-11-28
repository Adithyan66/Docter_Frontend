import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAppSelector } from '@hooks/store'
import CreateTreatmentCourseModal from '@components/treatment/CreateTreatmentCourseModal'
import CreateVisitModal from '@components/visit/CreateVisitModal'
import Pagination from '@components/common/Pagination'
import ImageViewerModal from '@components/common/ImageViewerModal'
import { usePatientDetails } from '@hooks/data/usePatientDetails'
import RotatingSpinner from '@components/spinner/TeethRotating'
import PatientDetail from '@assets/patientDetail.png'
import noprofile from '@assets/noprofile.png'

export default function PatientDetails() {
  const { id } = useParams<{ id: string }>()
  const doctorId = useAppSelector((state) => state.auth.user?.id || '')
  const [viewerImage, setViewerImage] = useState<string | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  const {
    patient,
    isLoading,
    isModalOpen,
    setIsModalOpen,
    courseDetails,
    isLoadingCourse,
    isTreatmentModalOpen,
    treatmentDetails,
    isLoadingTreatment,
    viewMode,
    isVisitModalOpen,
    setIsVisitModalOpen,
    visits,
    visitsPagination,
    isLoadingVisits,
    visitsSearch,
    setVisitsSearch,
    handleVisitsPageChange,
    handleVisitSuccess,
    handleTreatmentDetailsClick,
    handleCloseTreatmentModal,
    handleCreateTreatmentCourseSuccess,
    formatDate,
    formatDateTime,
  } = usePatientDetails(id)

  if (isLoading) {
    return <RotatingSpinner />
  }

  if (!patient) {
    return (
      <section className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          Patient not found.
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white/60 p-6 backdrop-blur-sm dark:bg-slate-900">
        <div className="flex items-center justify-between">

          <img src={PatientDetail} alt="teeth" className="w-[120px] h-[120px]" />
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Patient Details</h1>
          <p className="text-slate-600 dark:text-slate-300">
          View comprehensive patient information.
          </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400"
          >
            Create Treatment Course
          </button>
        </div>
      </div>

      <CreateTreatmentCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patientId={patient.id}
        doctorId={doctorId}
        onSuccess={handleCreateTreatmentCourseSuccess}
      />

      {courseDetails && (
        <CreateVisitModal
          isOpen={isVisitModalOpen}
          onClose={() => setIsVisitModalOpen(false)}
          patientId={patient.id}
          courseId={courseDetails.id}
          doctorId={doctorId}
          clinicId={courseDetails.clinicId}
          onSuccess={() => {
            setIsVisitModalOpen(false)
            handleVisitSuccess()
          }}
        />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div
              className={`absolute left-0 top-0 z-10 ${
                patient.isActive
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
              {patient.isActive ? 'ACTIVE' : 'INACTIVE'}
            </div>
            <div className="flex flex-col items-center space-y-4 mb-8">
              <img
                src={patient.profilePicUrl || noprofile}
                alt={patient.fullName}
                className="h-32 w-32 rounded-full object-cover border-4 border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  setViewerImage(patient.profilePicUrl || noprofile)
                  setIsViewerOpen(true)
                }}
              />
              <div className="text-center">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {patient.fullName || '-'}
                </h2>
                {patient.patientId && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    ID: {patient.patientId}
                  </p>
                )}
              </div>
            </div>

            <div className="w-full space-y-6">
              {patient.treatmentCoursesSummary && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Total Cost
                    </span>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      ₹{patient.treatmentCoursesSummary.totalCost.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Total Paid
                    </span>
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                      ₹{patient.treatmentCoursesSummary.totalPaid.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Remaining
                    </span>
                    <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                      ₹{patient.treatmentCoursesSummary.totalRemaining.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Age
                  </span>
                  {patient.age !== undefined ? (
                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                      {patient.age} years
                    </p>
                  ) : (
                    <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                      No data
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Date of Birth
                  </span>
                  {formatDate(patient.dob) !== '-' ? (
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {formatDate(patient.dob)}
                    </p>
                  ) : (
                    <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                      No data
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Gender
                  </span>
                  {patient.gender ? (
                    <p className="text-base font-semibold text-slate-900 dark:text-white capitalize">
                      {patient.gender}
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
                    Phone
                  </span>
                  {patient.phone ? (
                    <p className="text-xs font-medium text-slate-900 dark:text-white truncate max-w-full text-center">
                      {patient.phone}
                    </p>
                  ) : (
                    <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                      No data
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Email
                  </span>
                  {patient.email ? (
                    <p className="text-xs font-medium text-slate-900 dark:text-white truncate max-w-full text-center">
                      {patient.email}
                    </p>
                  ) : (
                    <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                      No data
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Primary Clinic
                  </span>
                  {patient.primaryClinicName ? (
                    <p className="text-xs font-medium text-slate-900 dark:text-white truncate max-w-full text-center">
                      {patient.primaryClinicName}
                    </p>
                  ) : (
                    <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                      No data
                    </span>
                  )}
                </div>
              </div>

              {patient.address && (
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Address
                  </span>
                  <p className="text-xs font-medium text-slate-900 dark:text-white text-center whitespace-pre-line">
                    {patient.address}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Consultation
                  </span>
                  {patient.consultationType ? (
                    <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                      {patient.consultationType.replace('-', ' ')}
                    </p>
                  ) : (
                    <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                      No data
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Visits
                  </span>
                  {patient.visitCount !== undefined ? (
                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                      {patient.visitCount}
                    </p>
                  ) : (
                    <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                      No data
                    </span>
                  )}
                </div>
              </div>

              {patient.lastVisitAt && formatDate(patient.lastVisitAt) !== '-' && (
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Last Visit
                  </span>
                  <p className="text-xs font-medium text-slate-900 dark:text-white">
                    {formatDate(patient.lastVisitAt)}
                  </p>
                </div>
              )}

              {patient.tags && patient.tags.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-3 block text-center">
                    Tags
                  </span>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {patient.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Created At
                  </span>
                  <p className="text-xs font-medium text-slate-900 dark:text-white text-center">
                    {formatDateTime(patient.createdAt)}
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Updated At
                  </span>
                  <p className="text-xs font-medium text-slate-900 dark:text-white text-center">
                    {formatDateTime(patient.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {viewMode === 'profile' ? (
            <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white/60 p-12 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Content will be displayed here
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  This area is reserved for future features
                </p>
              </div>
            </div>
          ) : (
            <>
              {isLoadingCourse ? (
                <div className="flex items-center justify-center rounded-2xl bg-white/60 p-12 backdrop-blur-sm dark:bg-slate-900/60">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                </div>
              ) : courseDetails ? (
                <>
                  <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Course Details
                      </h3>
                      <div className="flex gap-2">
                        {courseDetails.treatmentId && (
                          <button
                            onClick={handleTreatmentDetailsClick}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400"
                          >
                            View Treatment Details
                          </button>
                        )}
                        <button
                          onClick={() => setIsVisitModalOpen(true)}
                          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-green-500 dark:bg-green-500 dark:hover:bg-green-400"
                        >
                          Add Visit
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Course ID
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1 font-mono">
                          {courseDetails.id}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Treatment ID
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1 font-mono">
                          {courseDetails.treatmentId}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Doctor ID
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1 font-mono">
                          {courseDetails.doctorId}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Patient ID
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1 font-mono">
                          {courseDetails.patientId}
                        </p>
                      </div>
                      {courseDetails.clinicId && (
                        <div>
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Clinic ID
                          </span>
                          <p className="text-sm text-slate-900 dark:text-white mt-1 font-mono">
                            {courseDetails.clinicId}
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Status
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1 capitalize">
                          {courseDetails.status}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Start Date
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {formatDate(courseDetails.startDate)}
                        </p>
                      </div>
                      {courseDetails.expectedEndDate && (
                        <div>
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Expected End Date
                          </span>
                          <p className="text-sm text-slate-900 dark:text-white mt-1">
                            {formatDate(courseDetails.expectedEndDate)}
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Total Cost
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          ₹{courseDetails.totalCost.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Total Paid
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          ₹{courseDetails.totalPaid.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Remaining
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          ₹{(courseDetails.totalCost - courseDetails.totalPaid).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Payment Completed
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {courseDetails.isPaymentCompleted ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Medically Completed
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {courseDetails.isMedicallyCompleted ? 'Yes' : 'No'}
                        </p>
                      </div>
                      {courseDetails.notes && (
                        <div className="md:col-span-2">
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Notes
                          </span>
                          <p className="text-sm text-slate-900 dark:text-white mt-1 whitespace-pre-line">
                            {courseDetails.notes}
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Visits Count
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {courseDetails.visits?.length || 0}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Payments Count
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {courseDetails.payments?.length || 0}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Created At
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {formatDateTime(courseDetails.createdAt)}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Updated At
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {formatDateTime(courseDetails.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Visits ({visitsPagination.total})
                      </h3>
                      <div className="w-64">
                        <input
                          type="text"
                          value={visitsSearch}
                          onChange={(e) => setVisitsSearch(e.target.value)}
                          placeholder="Search by notes..."
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    {isLoadingVisits ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                      </div>
                    ) : visits.length > 0 ? (
                      <>
                        <div className="space-y-4 mb-6">
                          {visits.map((visit) => (
                            <div
                              key={visit.id}
                              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                                    Visit on {formatDate(visit.visitDate)}
                                  </h4>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {formatDateTime(visit.createdAt)}
                                  </p>
                                </div>
                                {visit.billedAmount && (
                                  <span className="rounded-lg bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    ₹{visit.billedAmount.toLocaleString()}
                                  </span>
                                )}
                              </div>

                              {visit.notes && (
                                <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 whitespace-pre-line">
                                  {visit.notes}
                                </p>
                              )}

                              {visit.prescription && (
                                <div className="mb-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                                  <h5 className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-2">
                                    Prescription
                                  </h5>
                                  {visit.prescription.diagnosis && visit.prescription.diagnosis.length > 0 && (
                                    <div className="mb-2">
                                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                        Diagnosis:{' '}
                                      </span>
                                      <span className="text-xs text-blue-600 dark:text-blue-400">
                                        {visit.prescription.diagnosis.join(', ')}
                                      </span>
                                    </div>
                                  )}
                                  {visit.prescription.items && visit.prescription.items.length > 0 && (
                                    <div className="space-y-1">
                                      {visit.prescription.items.map((item, idx) => (
                                        <div key={idx} className="text-xs text-blue-700 dark:text-blue-300">
                                          <span className="font-medium">{item.medicineName}</span>
                                          {item.dosage && <span> - {item.dosage}</span>}
                                          {item.frequency && <span>, {item.frequency}</span>}
                                          {item.duration && <span> ({item.duration})</span>}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {visit.media && visit.media.length > 0 && (
                                <div className="grid grid-cols-3 gap-2">
                                  {visit.media.map((media, idx) => (
                                    <div key={media.id || idx} className="relative group">
                                      <img
                                        src={media.url}
                                        alt={media.notes || `Media ${idx + 1}`}
                                        className="h-24 w-full rounded-lg object-cover border border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => {
                                          setViewerImage(media.url)
                                          setIsViewerOpen(true)
                                        }}
                                      />
                                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="truncate">{media.type}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {visitsPagination.totalPages > 1 && (
                          <Pagination
                            currentPage={visitsPagination.page}
                            totalPages={visitsPagination.totalPages}
                            onPageChange={handleVisitsPageChange}
                          />
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12 text-sm text-slate-600 dark:text-slate-400">
                        No visits found
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </>
          )}
        </div>
      </div>

      {isTreatmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Treatment Details
              </h2>
              <button
                onClick={handleCloseTreatmentModal}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
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
            <div className="p-6">
              {isLoadingTreatment ? (
                <div className="flex items-center justify-center p-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                </div>
              ) : treatmentDetails ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Treatment ID
                      </span>
                      <p className="text-sm text-slate-900 dark:text-white mt-1 font-mono">
                        {treatmentDetails.id}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Name
                      </span>
                      <p className="text-sm text-slate-900 dark:text-white mt-1">
                        {treatmentDetails.name}
                      </p>
                    </div>
                    {treatmentDetails.description && (
                      <div className="md:col-span-2">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Description
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1 whitespace-pre-line">
                          {treatmentDetails.description}
                        </p>
                      </div>
                    )}
                    {treatmentDetails.minDuration !== undefined && (
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Min Duration (days)
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {treatmentDetails.minDuration}
                        </p>
                      </div>
                    )}
                    {treatmentDetails.maxDuration !== undefined && (
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Max Duration (days)
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {treatmentDetails.maxDuration}
                        </p>
                      </div>
                    )}
                    {treatmentDetails.avgDuration !== undefined && (
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Avg Duration (days)
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {treatmentDetails.avgDuration}
                        </p>
                      </div>
                    )}
                    {treatmentDetails.minFees !== undefined && (
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Min Fees
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          ₹{treatmentDetails.minFees.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {treatmentDetails.maxFees !== undefined && (
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Max Fees
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          ₹{treatmentDetails.maxFees.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {treatmentDetails.avgFees !== undefined && (
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Avg Fees
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          ₹{treatmentDetails.avgFees.toLocaleString()}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Follow Up Required
                      </span>
                      <p className="text-sm text-slate-900 dark:text-white mt-1">
                        {treatmentDetails.followUpRequired ? 'Yes' : 'No'}
                      </p>
                    </div>
                    {treatmentDetails.followUpAfterDays !== undefined && (
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Follow Up After (days)
                        </span>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {treatmentDetails.followUpAfterDays}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Created At
                      </span>
                      <p className="text-sm text-slate-900 dark:text-white mt-1">
                        {formatDateTime(treatmentDetails.createdAt)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Updated At
                      </span>
                      <p className="text-sm text-slate-900 dark:text-white mt-1">
                        {formatDateTime(treatmentDetails.updatedAt)}
                      </p>
                    </div>
                  </div>

                  {treatmentDetails.steps && treatmentDetails.steps.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                        Steps
                      </h3>
                      <ol className="list-decimal list-inside space-y-2">
                        {treatmentDetails.steps.map((step, index) => (
                          <li
                            key={index}
                            className="text-sm text-slate-700 dark:text-slate-300"
                          >
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {treatmentDetails.aftercare && treatmentDetails.aftercare.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                        Aftercare
                      </h3>
                      <ul className="list-disc list-inside space-y-2">
                        {treatmentDetails.aftercare.map((item, index) => (
                          <li
                            key={index}
                            className="text-sm text-slate-700 dark:text-slate-300"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {treatmentDetails.risks && treatmentDetails.risks.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                        Risks
                      </h3>
                      <ul className="list-disc list-inside space-y-2">
                        {treatmentDetails.risks.map((risk, index) => (
                          <li
                            key={index}
                            className="text-sm text-slate-700 dark:text-slate-300"
                          >
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {treatmentDetails.images && treatmentDetails.images.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                        Images
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {treatmentDetails.images.map((imageUrl, index) => (
                          <img
                            key={index}
                            src={imageUrl}
                            alt={`Treatment ${index + 1}`}
                            className="h-32 w-full rounded-lg object-cover border border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                              setViewerImage(imageUrl)
                              setIsViewerOpen(true)
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <ImageViewerModal
        isOpen={isViewerOpen}
        imageUrl={viewerImage}
        onClose={() => {
          setIsViewerOpen(false)
          setViewerImage(null)
        }}
        alt={patient.fullName || 'Patient image'}
      />
    </section>
  )
}

