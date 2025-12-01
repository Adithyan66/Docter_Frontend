import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppSelector } from '@hooks/store'
import toast from 'react-hot-toast'
import CreateTreatmentCourseModal from '@components/treatment/CreateTreatmentCourseModal'
import CreateVisitModal from '@components/visit/CreateVisitModal'
import StatusChangeModal from '@components/treatment/StatusChangeModal'
import { updateTreatmentCourse, type TreatmentCourseStatus } from '@api/treatmentCourses'
import Pagination from '@components/common/Pagination'
import ImageViewerModal from '@components/common/ImageViewerModal'
import DeleteConfirmationModal from '@components/common/DeleteConfirmationModal'
import { usePatientDetails } from '@hooks/data/usePatientDetails'
import { deletePatient, updatePatient, type PatientPayload } from '@api/patients'
import RotatingSpinner from '@components/spinner/TeethRotating'
import { PlusIcon } from '@assets/Icons'
import PatientDetail from '@assets/patientDetail.png'
import noprofile from '@assets/noprofile.png'

export default function PatientDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const doctorId = useAppSelector((state) => state.auth.user?.id || '')
  const [viewerImage, setViewerImage] = useState<string | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const handleDeletePatient = async () => {
    if (!id || isDeleting) return

    try {
      setIsDeleting(true)
      await deletePatient(id)
      toast.success('Patient deleted successfully.')
      setTimeout(() => navigate('/patients'), 800)
    } catch (error: any) {
      setIsDeleting(false)
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to delete patient. Please try again.'
      toast.error(errorMessage)
    }
  }

  const handleToggleStatus = async () => {
    if (!patient || !id || isTogglingStatus) return

    try {
      setIsTogglingStatus(true)
      const payload: PatientPayload = {
        firstName: patient.firstName || '',
        lastName: patient.lastName,
        fullName: patient.fullName,
        address: patient.address,
        profilePicUrl: patient.profilePicUrl,
        consultationType: patient.consultationType,
        primaryClinic: patient.primaryClinic,
        clinics: patient.clinics,
        dob: patient.dob,
        lastVisitAt: patient.lastVisitAt,
        age: patient.age,
        visitCount: patient.visitCount,
        gender: patient.gender,
        phone: patient.phone,
        email: patient.email,
        tags: patient.tags,
        isActive: !patient.isActive,
      }
      await updatePatient(id, payload)
      toast.success(`Patient marked as ${!patient.isActive ? 'active' : 'inactive'} successfully.`)
      await fetchPatient()
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to update patient status. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsTogglingStatus(false)
    }
  }

  const handleStatusChange = async (status: TreatmentCourseStatus) => {
    if (!courseDetails) return

    try {
      setIsUpdatingStatus(true)
      await updateTreatmentCourse(courseDetails.id, { status })
      toast.success(`Status updated to ${status.charAt(0).toUpperCase() + status.slice(1)} successfully.`)
      setIsStatusModalOpen(false)
      await fetchCourseDetails()
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to update status. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

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
    handleSetDefaultCourse,
    isSettingDefault,
    fetchPatient,
    fetchCourseDetails,
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
            <div className="mt-3 flex flex-wrap gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-100 to-purple-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-purple-200 hover:to-purple-300 dark:from-purple-800/30 dark:to-purple-700/30 dark:text-slate-200 dark:hover:from-purple-700/40 dark:hover:to-purple-600/40"
              >
                <PlusIcon />
                Add Treatment
              </button>
              <button
                onClick={() => navigate(`/patients/${id}/edit`)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-blue-200 hover:to-blue-300 dark:from-blue-800/30 dark:to-blue-700/30 dark:text-slate-200 dark:hover:from-blue-700/40 dark:hover:to-blue-600/40"
              >
                Edit Profile
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-100 to-red-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-red-200 hover:to-red-300 dark:from-red-800/30 dark:to-red-700/30 dark:text-slate-200 dark:hover:from-red-700/40 dark:hover:to-red-600/40"
              >
                Delete Profile
              </button>
              <button
                onClick={handleToggleStatus}
                disabled={isTogglingStatus}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
                  patient.isActive
                    ? 'bg-gradient-to-r from-orange-100 to-orange-200 hover:from-orange-200 hover:to-orange-300 dark:from-orange-800/30 dark:to-orange-700/30 dark:text-slate-200 dark:hover:from-orange-700/40 dark:hover:to-orange-600/40'
                    : 'bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 dark:from-green-800/30 dark:to-green-700/30 dark:text-slate-200 dark:hover:from-green-700/40 dark:hover:to-green-600/40'
                }`}
              >
                {isTogglingStatus ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-700 border-t-transparent dark:border-slate-200"></span>
                    {patient.isActive ? 'Deactivating...' : 'Activating...'}
                  </>
                ) : (
                  <>
                    {patient.isActive ? 'Set Inactive' : 'Set Active'}
                  </>
                )}
          </button>
            </div>
          </div>
        </div>
      </div>

      <CreateTreatmentCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patientId={patient.id}
        doctorId={doctorId}
        primaryClinicId={patient.primaryClinic}
        onSuccess={handleCreateTreatmentCourseSuccess}
      />

      {courseDetails && (
        <CreateTreatmentCourseModal
          isOpen={isEditCourseModalOpen}
          onClose={() => setIsEditCourseModalOpen(false)}
          patientId={patient.id}
          doctorId={doctorId}
          primaryClinicId={patient.primaryClinic}
          courseId={courseDetails.id}
          courseData={courseDetails}
          onSuccess={() => {
            setIsEditCourseModalOpen(false)
            fetchCourseDetails()
          }}
        />
      )}

      {courseDetails && (
        <CreateVisitModal
          isOpen={isVisitModalOpen}
          onClose={() => setIsVisitModalOpen(false)}
          patientId={patient.id}
          courseId={courseDetails.id}
          doctorId={doctorId}
          clinicId={courseDetails.clinicId}
          primaryClinicId={patient.primaryClinic}
          onSuccess={() => {
            setIsVisitModalOpen(false)
            handleVisitSuccess()
          }}
        />
      )}

      {courseDetails && (
        <StatusChangeModal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          currentStatus={courseDetails.status}
          onStatusChange={handleStatusChange}
          isUpdating={isUpdatingStatus}
        />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
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
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-100 to-purple-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-purple-200 hover:to-purple-300 dark:from-purple-800/30 dark:to-purple-700/30 dark:text-slate-200 dark:hover:from-purple-700/40 dark:hover:to-purple-600/40"
                        >
                          View Treatment Details
                        </button>
                      )}
                         {selectedCourseId && patient.treatmentCourses && (() => {
                        const currentCourseIndex = patient.treatmentCourses.findIndex(c => c.id === selectedCourseId)
                        return currentCourseIndex > 0 ? (
                          <button
                            onClick={() => handleSetDefaultCourse(selectedCourseId)}
                            disabled={isSettingDefault}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-100 to-orange-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-orange-200 hover:to-orange-300 disabled:cursor-not-allowed disabled:opacity-60 dark:from-orange-800/30 dark:to-orange-700/30 dark:text-slate-200 dark:hover:from-orange-700/40 dark:hover:to-orange-600/40"
                          >
                            {isSettingDefault ? (
                              <>
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-700 border-t-transparent dark:border-slate-200"></span>
                                Setting...
                              </>
                            ) : (
                              'Set as Default'
                            )}
                          </button>
                        ) : null
                      })()}
                      <button
                        onClick={() => setIsStatusModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-100 to-indigo-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-indigo-200 hover:to-indigo-300 dark:from-indigo-800/30 dark:to-indigo-700/30 dark:text-slate-200 dark:hover:from-indigo-700/40 dark:hover:to-indigo-600/40"
                      >
                        Change Status
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

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setIsEditCourseModalOpen(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-yellow-100 to-yellow-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-yellow-200 hover:to-yellow-300 dark:from-yellow-800/30 dark:to-yellow-700/30 dark:text-slate-200 dark:hover:from-yellow-700/40 dark:hover:to-yellow-600/40"
                    >
                      Edit Course
                    </button>
                    <button
                      onClick={() => setIsVisitModalOpen(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-100 to-green-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-green-200 hover:to-green-300 dark:from-green-800/30 dark:to-green-700/30 dark:text-slate-200 dark:hover:from-green-700/40 dark:hover:to-green-600/40"
                    >
                      Add Visit Data
                    </button>
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
                                <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                                  Visit on {formatDateWithTime(visit.visitDate)}
                                </h4>
                                {visit.billedAmount ? (
                                  <span className="rounded-lg bg-green-100 px-3 py-1 text-lg font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
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

     

      <ImageViewerModal
        isOpen={isViewerOpen}
        imageUrl={viewerImage}
        onClose={() => {
          setIsViewerOpen(false)
          setViewerImage(null)
        }}
        alt={patient.fullName || 'Patient image'}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeletePatient}
        title="Delete Patient"
        message="This action cannot be undone. This will permanently delete the patient and all associated data."
        confirmText="Delete Patient"
        confirmationWord="delete"
      />
    </section>
  )
}

