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
    selectedCourseId,
    handleCourseSelect,
    formatDate,
    formatDateTime,
    formatDateWithTime,
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
                  Total  Visits
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

        <div className="lg:col-span-2">
          {patient.treatmentCourses && patient.treatmentCourses.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800/50">
                <div className="flex gap-0 overflow-x-auto">
                  {patient.treatmentCourses.map((course, index) => (
                    <button
                      key={course.id}
                      onClick={() => handleCourseSelect(course.id)}
                      className={`relative whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-all ${
                        selectedCourseId === course.id
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      } ${
                        selectedCourseId === course.id
                          ? 'rounded-tl-lg rounded-tr-lg'
                          : ''
                      }`}
                    >
                      {index > 0 && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-px bg-slate-200 dark:bg-slate-700"></div>
                      )}
                      {course.treatmentName}
                    </button>
                  ))}
                </div>
              </div>

              {isLoadingCourse ? (
                <div className="flex items-center justify-center p-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                </div>
              ) : courseDetails ? (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    {selectedCourseId && patient.treatmentCourses && (
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
                          {patient.treatmentCourses.find(c => c.id === selectedCourseId)?.treatmentName || 'Treatment Course'}
                        </h3>
                        {courseDetails?.status && (
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                              courseDetails.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : courseDetails.status === 'paused'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : courseDetails.status === 'completed'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                          >
                            {courseDetails.status.charAt(0).toUpperCase() + courseDetails.status.slice(1)}
                          </span>
                        )}
                      </div>
                    )}
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

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 shadow-lg border border-blue-200 dark:border-blue-800 relative">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200">Payment Summary</h4>
                        {courseDetails.isPaymentCompleted && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Completed
                          </span>
                        )}
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-around mb-2">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Cost</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Paid</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Remaining</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-around mb-6">
                          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">₹{courseDetails.totalCost.toLocaleString()}</span>
                          <span className="text-xl font-bold text-green-600 dark:text-green-400">₹{courseDetails.totalPaid.toLocaleString()}</span>
                          <span className="text-xl font-bold text-orange-600 dark:text-orange-400">₹{(courseDetails.totalCost - courseDetails.totalPaid).toLocaleString()}</span>
                        </div>
                        <div className="relative">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Payment Progress</span>
                            <span className="text-sm font-bold text-green-600 dark:text-green-400">
                              {Math.round((courseDetails.totalPaid / courseDetails.totalCost) * 100)}%
                            </span>
                          </div>
                          <div className="relative w-full bg-white/80 dark:bg-slate-800/80 rounded-full h-5 shadow-inner overflow-hidden">
                            <div
                              className="relative h-full rounded-full bg-gradient-to-r from-green-400 via-green-500 to-green-600 transition-all duration-1000 ease-out shadow-lg"
                              style={{ width: `${Math.min((courseDetails.totalPaid / courseDetails.totalCost) * 100, 100)}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow-md">
                                {Math.round((courseDetails.totalPaid / courseDetails.totalCost) * 100)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 shadow-lg border border-purple-200 dark:border-purple-800">
                      <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-200 mb-6">Treatment Timeline</h4>
                      {courseDetails.expectedEndDate ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-around mb-2">
                            <div className="flex items-center gap-1.5">
                              <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Start Date</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">End Date</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-around mb-6">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatDate(courseDetails.startDate)}</span>
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatDate(courseDetails.expectedEndDate)}</span>
                          </div>
                          <div className="relative">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Time Progress</span>
                              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                                {(() => {
                                  const start = new Date(courseDetails.startDate).getTime()
                                  const end = new Date(courseDetails.expectedEndDate).getTime()
                                  const now = new Date().getTime()
                                  const total = end - start
                                  const elapsed = now - start
                                  const percentage = total > 0 ? Math.min(Math.max((elapsed / total) * 100, 0), 100) : 0
                                  return Math.round(percentage)
                                })()}%
                              </span>
                            </div>
                            <div className="relative w-full bg-white/80 dark:bg-slate-800/80 rounded-full h-5 shadow-inner overflow-hidden">
                              <div
                                className="relative h-full rounded-full bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 transition-all duration-1000 ease-out shadow-lg"
                                style={{
                                  width: `${(() => {
                                    const start = new Date(courseDetails.startDate).getTime()
                                    const end = new Date(courseDetails.expectedEndDate).getTime()
                                    const now = new Date().getTime()
                                    const total = end - start
                                    const elapsed = now - start
                                    const percentage = total > 0 ? Math.min(Math.max((elapsed / total) * 100, 0), 100) : 0
                                    return percentage
                                  })()}%`
                                }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow-md">
                                  {(() => {
                                    const start = new Date(courseDetails.startDate).getTime()
                                    const end = new Date(courseDetails.expectedEndDate).getTime()
                                    const now = new Date().getTime()
                                    const total = end - start
                                    const elapsed = now - start
                                    const percentage = total > 0 ? Math.min(Math.max((elapsed / total) * 100, 0), 100) : 0
                                    return Math.round(percentage)
                                  })()}%
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm text-center">
                          <span className="text-xs text-slate-500 dark:text-slate-400">No expected end date set</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                      {courseDetails.notes && (
                        <div className="md:col-span-2">
                          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                              Notes
                            </span>
                            <p className="text-sm text-slate-900 dark:text-white whitespace-pre-line">
                              {courseDetails.notes}
                            </p>
                          </div>
                        </div>
                      )}
                     
                    
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

                  <div>
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
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                                  Visit on {formatDateWithTime(visit.visitDate)}
                                </h4>
                                {visit.billedAmount ? (
                                  <span className="rounded-lg bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    ₹{visit.billedAmount.toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-500 dark:text-slate-400">No payment</span>
                                )}
                              </div>

                              <div className="flex gap-4 items-stretch">
                                <div className="w-1/2 flex">
                                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 w-full flex flex-col">
                                    <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                      Notes
                                    </h5>
                                    {visit.notes ? (
                                      <p className="text-sm text-slate-900 dark:text-white whitespace-pre-line">
                                        {visit.notes}
                                      </p>
                                    ) : (
                                      <p className="text-sm text-slate-500 dark:text-slate-400">No notes</p>
                                    )}
                                  </div>
                                </div>

                                <div className="w-1/2 flex flex-col gap-3">
                                  <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                                    <h5 className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-2">
                                      Prescription
                                    </h5>
                                    {visit.prescription ? (
                                      <>
                                        {visit.prescription.diagnosis && visit.prescription.diagnosis.length > 0 ? (
                                          <div className="mb-2">
                                            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                              Diagnosis:{' '}
                                            </span>
                                            <span className="text-xs text-blue-600 dark:text-blue-400">
                                              {visit.prescription.diagnosis.join(', ')}
                                            </span>
                                          </div>
                                        ) : null}
                                        {visit.prescription.items && visit.prescription.items.length > 0 ? (
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
                                        ) : null}
                                        {(!visit.prescription.diagnosis || visit.prescription.diagnosis.length === 0) && 
                                         (!visit.prescription.items || visit.prescription.items.length === 0) && (
                                          <p className="text-xs text-slate-500 dark:text-slate-400">No prescription</p>
                                        )}
                                      </>
                                    ) : (
                                      <p className="text-xs text-slate-500 dark:text-slate-400">No prescription</p>
                                    )}
                                  </div>

                                  {visit.media && visit.media.length > 0 ? (
                                    <div className="grid grid-cols-4 gap-2">
                                      {visit.media.map((media, idx) => (
                                        <div key={media.id || idx} className="relative group aspect-square">
                                          <img
                                            src={media.url}
                                            alt={media.notes || `Media ${idx + 1}`}
                                            className="h-full w-full rounded-lg object-cover border border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
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
                                  ) : (
                                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3">
                                      <p className="text-xs text-slate-500 dark:text-slate-400">No images</p>
                                    </div>
                                  )}
                                </div>
                              </div>
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
                </div>
              ) : (
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Select a treatment course to view details
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white/60 p-12 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
              <div className="text-center mb-4">
                <p className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  No treatment courses
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  Create a treatment course to get started
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400"
              >
                Add Treatment Course
              </button>
            </div>
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

