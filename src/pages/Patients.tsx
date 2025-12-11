import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PatientCard from '@components/patient/PatientCard'
import PatientFilters from '@components/patient/PatientFilters'
import Pagination from '@components/common/Pagination'
import PageHeader from '@components/common/PageHeader'
import { usePatientsData } from '@hooks/data/usePatientsData'
import { PlusIcon } from '@assets/Icons'
import RotatingSpinner from '@components/spinner/TeethRotating'
import patientsteeth from '@assets/patientsList.png'
import type { GetPatientsParams } from '@api/patients'

export default function Patients() {
  const navigate = useNavigate()
  const {
    patients,
    isLoading,
    currentPage,
    totalPages,
    total,
    limit,
    filters,
    search,
    activeFilterCount,
    pendingFilters,
    clinicOptions,
    isStaff,
    staffHasMultipleClinics,
    staffSingleClinic,
    genderOptions,
    consultationTypeOptions,
    hasPendingChanges,
    setCurrentPage,
    setSearch,
    setPendingFilters,
    setPendingModalFilters,
    handleApplyFilters,
    handleClearAllFilters,
  } = usePatientsData()

  const clinicButtonRef = useRef<HTMLButtonElement>(null)
  const genderButtonRef = useRef<HTMLButtonElement>(null)
  const consultationButtonRef = useRef<HTMLButtonElement>(null)

  return (
    <section className="space-y-6">
      <PageHeader
        title="Patients"
        description="Manage patient records, consultations, and medical history."
        image={{
          src: patientsteeth,
          alt: 'teeth',
          className: 'w-[120px] h-[120px]',
        }}
        actionButton={{
          label: 'Add Patient',
          onClick: () => navigate('/patient/add'),
          icon: <PlusIcon />,
        }}
        searchSlot={
          <input
            type="text"
            placeholder="Search by name or patient ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400"
          />
        }
        filterControls={[
          isStaff && !staffHasMultipleClinics && staffSingleClinic
            ? {
                id: 'clinic',
                type: 'custom' as const,
                render: () => (
                  <div className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
                    Clinic: {staffSingleClinic.name}
                  </div>
                ),
              }
            : {
                id: 'clinic',
                type: 'dropdown' as const,
                label: 'Clinic',
                value: pendingFilters.clinicId || '',
                options: clinicOptions,
                onChange: (value) =>
                  setPendingFilters((prev) => ({ ...prev, clinicId: value || undefined })),
                buttonRef: clinicButtonRef,
                buttonClassName: 'max-w-[calc((100%-2rem)/5)] min-w-[100px]',
              },
          {
            id: 'gender',
            type: 'dropdown',
            label: 'Gender',
            value: pendingFilters.gender || '',
            options: genderOptions,
            onChange: (value) =>
              setPendingFilters((prev) => ({
                ...prev,
                gender: (value || undefined) as GetPatientsParams['gender'],
              })),
            buttonRef: genderButtonRef,
            buttonClassName: 'max-w-[calc((100%-2rem)/5)] min-w-[100px]',
          },
          {
            id: 'consultation',
            type: 'dropdown',
            label: 'Consultation Type',
            value: pendingFilters.consultationType || '',
            options: consultationTypeOptions,
            onChange: (value) =>
              setPendingFilters((prev) => ({
                ...prev,
                consultationType: (value || undefined) as GetPatientsParams['consultationType'],
              })),
            buttonRef: consultationButtonRef,
            buttonClassName: 'max-w-[calc((100%-2rem)/5)] min-w-[100px]',
          },
        ]}
        filterButton={{
          activeCount: activeFilterCount,
        }}
        filterDrawerContent={({ isOpen, onClose, buttonRef }) => (
          <PatientFilters
            isOpen={isOpen}
            onClose={onClose}
            filters={filters}
            onPendingFiltersChange={setPendingModalFilters}
            buttonRef={buttonRef}
          />
        )}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearAllFilters}
        hasPendingChanges={hasPendingChanges}
      />

      {isLoading ? (
        <RotatingSpinner />
      ) : patients.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          {search.trim() || activeFilterCount > 0
            ? 'No patients found matching your search or filters.'
            : 'No patients available. Use the button above to add new patients.'}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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

    </section>
  )
}

