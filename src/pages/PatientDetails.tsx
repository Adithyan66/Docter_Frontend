import { useParams } from 'react-router-dom'
import { useAppSelector } from '@hooks/store'
import CreateTreatmentCourseModal from '@components/treatment/CreateTreatmentCourseModal'
import CreateVisitModal from '@components/visit/CreateVisitModal'
import StatusChangeModal from '@components/treatment/StatusChangeModal'
import PageHeader from '@components/common/PageHeader'
import ImageViewerModal from '@components/common/ImageViewerModal'
import DeleteConfirmationModal from '@components/common/DeleteConfirmationModal'
import PatientTreatmentDetails from '@components/patient/PatientTreatmentDetails'
import TreatmentCourseVisits from '@components/patient/TreatmentCourseVisits'
import PatientDetailsSidebar from '@components/patient/PatientDetailsSidebar'
import { usePatientDetails } from '@hooks/data/usePatientDetails'
import RotatingSpinner from '@components/spinner/TeethRotating'
import { PlusIcon } from '@assets/Icons'
import PatientDetail from '@assets/patientDetail.png'

export default function PatientDetails() {
  const { id } = useParams<{ id: string }>()
  const doctorId = useAppSelector((state) => state.auth.user?.id || '')
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
    viewerImage,
    isViewerOpen,
    isDeleteModalOpen,
    isTogglingStatus,
    isEditCourseModalOpen,
    isStatusModalOpen,
    isUpdatingStatus,
    isDeleteCourseModalOpen,
    isDeletingCourse,
    editingVisit,
    isEditVisitModalOpen,
    deletingVisit,
    isDeleteVisitModalOpen,
    isDeletingVisit,
    handleVisitsPageChange,
    handleVisitSuccess,
    handleTreatmentDetailsClick,
    handleCloseTreatmentModal,
    handleCreateTreatmentCourseSuccess,
    handleSetDefaultCourse,
    isSettingDefault,
    fetchPatient,
    fetchCourseDetails,
    fetchVisits,
    refetchAllData,
    selectedCourseId,
    handleCourseSelect,
    formatDate,
    formatDateTime,
    formatDateWithTime,
    handleDeletePatient,
    handleToggleStatus,
    handleStatusChange,
    handleDeleteCourse,
    handleEditVisit,
    handleDeleteVisitClick,
    handleDeleteVisit,
    setViewerImage,
    setIsViewerOpen,
    setIsDeleteModalOpen,
    setIsEditCourseModalOpen,
    setIsStatusModalOpen,
    setIsDeleteCourseModalOpen,
    setEditingVisit,
    setIsEditVisitModalOpen,
    setDeletingVisit,
    setIsDeleteVisitModalOpen,
    setIsDeletingVisit,
    navigate,
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
      <PageHeader
        title="Patient Details"
        description="View comprehensive patient information."
        image={{
          src: PatientDetail,
          alt: 'teeth',
          className: 'w-[120px] h-[120px]',
        }}
        actionButtons={[
          {
            label: 'Add Treatment',
            onClick: () => setIsModalOpen(true),
            icon: <PlusIcon />,
            className:
              'inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-100 to-purple-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-purple-200 hover:to-purple-300 dark:from-purple-800/30 dark:to-purple-700/30 dark:text-slate-200 dark:hover:from-purple-700/40 dark:hover:to-purple-600/40',
          },
          {
            label: 'Edit Profile',
            onClick: () => navigate(`/patients/${id}/edit`),
            className:
              'inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-blue-200 hover:to-blue-300 dark:from-blue-800/30 dark:to-blue-700/30 dark:text-slate-200 dark:hover:from-blue-700/40 dark:hover:to-blue-600/40',
          },
          {
            label: 'Delete Profile',
            onClick: () => setIsDeleteModalOpen(true),
            className:
              'inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-100 to-red-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-red-200 hover:to-red-300 dark:from-red-800/30 dark:to-red-700/30 dark:text-slate-200 dark:hover:from-red-700/40 dark:hover:to-red-600/40',
          },
          {
            label: patient.isActive ? 'Set Inactive' : 'Set Active',
            onClick: handleToggleStatus,
            disabled: isTogglingStatus,
            isLoading: isTogglingStatus,
            loadingLabel: patient.isActive ? 'Deactivating...' : 'Activating...',
            className: `inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
                  patient.isActive
                    ? 'bg-gradient-to-r from-orange-100 to-orange-200 hover:from-orange-200 hover:to-orange-300 dark:from-orange-800/30 dark:to-orange-700/30 dark:text-slate-200 dark:hover:from-orange-700/40 dark:hover:to-orange-600/40'
                    : 'bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 dark:from-green-800/30 dark:to-green-700/30 dark:text-slate-200 dark:hover:from-green-700/40 dark:hover:to-green-600/40'
            }`,
          },
        ]}
      />

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
          treatmentDetails={treatmentDetails}
          onSuccess={async () => {
            setIsVisitModalOpen(false)
            await refetchAllData()
          }}
        />
      )}

      {editingVisit && courseDetails && (
        <CreateVisitModal
          isOpen={isEditVisitModalOpen}
          onClose={() => {
            setIsEditVisitModalOpen(false)
            setEditingVisit(null)
          }}
          patientId={patient.id}
          courseId={courseDetails.id}
          doctorId={doctorId}
          clinicId={courseDetails.clinicId}
          primaryClinicId={patient.primaryClinic}
          visitId={editingVisit.id}
          visitData={editingVisit}
          treatmentDetails={treatmentDetails}
          onSuccess={async () => {
            setIsEditVisitModalOpen(false)
            setEditingVisit(null)
            await refetchAllData()
          }}
        />
      )}

      {deletingVisit && (
        <DeleteConfirmationModal
          key={deletingVisit.id}
          isOpen={isDeleteVisitModalOpen}
          onClose={() => {
            if (!isDeletingVisit) {
              setIsDeleteVisitModalOpen(false)
              setIsDeletingVisit(false)
              setDeletingVisit(null)
            }
          }}
          onConfirm={handleDeleteVisit}
          title="Delete Visit"
          message="This action cannot be undone. This will permanently delete the visit and all associated data."
          confirmText="Delete Visit"
          confirmationWord="delete"
          isDeleting={isDeletingVisit}
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

      {courseDetails && selectedCourseId && patient?.treatmentCourses && (() => {
        const treatmentName = patient.treatmentCourses.find(c => c.id === selectedCourseId)?.treatmentName
        return treatmentName ? (
          <DeleteConfirmationModal
            isOpen={isDeleteCourseModalOpen}
            onClose={() => setIsDeleteCourseModalOpen(false)}
            onConfirm={handleDeleteCourse}
            title="Delete Treatment Course"
            message="This action cannot be undone. This will permanently delete the treatment course and all associated data."
            confirmText="Delete Course"
            confirmationWord={treatmentName}
          />
        ) : null
      })()}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <PatientDetailsSidebar
          patient={patient}
          formatDate={formatDate}
          formatDateTime={formatDateTime}
          onImageClick={(imageUrl) => {
            setViewerImage(imageUrl)
                  setIsViewerOpen(true)
                }}
              />

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
                  <PatientTreatmentDetails
                    courseDetails={courseDetails}
                    selectedCourseId={selectedCourseId}
                    treatmentCourses={patient.treatmentCourses}
                    isSettingDefault={isSettingDefault}
                    formatDate={formatDate}
                    formatDateTime={formatDateTime}
                    onViewTreatmentDetails={handleTreatmentDetailsClick}
                    onSetDefaultCourse={handleSetDefaultCourse}
                    onStatusChange={() => setIsStatusModalOpen(true)}
                    onDeleteCourse={() => setIsDeleteCourseModalOpen(true)}
                    onEditCourse={() => setIsEditCourseModalOpen(true)}
                    onAddVisit={() => setIsVisitModalOpen(true)}
                  />

                  <TreatmentCourseVisits
                    visits={visits}
                    visitsPagination={visitsPagination}
                    visitsSearch={visitsSearch}
                    isLoadingVisits={isLoadingVisits}
                    formatDateWithTime={formatDateWithTime}
                    onSearchChange={setVisitsSearch}
                    onPageChange={handleVisitsPageChange}
                    onEditVisit={handleEditVisit}
                    onDeleteVisit={handleDeleteVisitClick}
                    onImageClick={(imageUrl) => {
                      setViewerImage(imageUrl)
                                              setIsViewerOpen(true)
                                            }}
                                          />
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

