import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Pagination from '@components/common/Pagination'
import PageHeader from '@components/common/PageHeader'
import Table from '@components/common/Table'
import { useClinics } from '@hooks/data/useClinics'
import { PlusIcon } from '@assets/Icons'
import clinicIcon from '@assets/clinic.png'
import RotatingSpinner from '@components/spinner/TeethRotating'

export default function Clinics() {
  const navigate = useNavigate()
  const {
    clinics,
    isLoading,
    currentPage,
    totalPages,
    total,
    limit,
    search,
    sortBy,
    sortOrder,
    setCurrentPage,
    setSearch,
    setSortBy,
    setSortOrder,
  } = useClinics()

  const sortByButtonRef = useRef<HTMLButtonElement>(null)
  const sortOrderButtonRef = useRef<HTMLButtonElement>(null)

  const sortByOptions: Array<{ value: string; label: string }> = [
    { value: '', label: 'Sort by' },
    { value: 'createdAt', label: 'Date Created' },
    { value: 'numOfPatients', label: 'Num of Patients' },
    { value: 'onGoingTreatments', label: 'Ongoing' },
    { value: 'completedTreatments', label: 'Completed' },
  ]

  const sortOrderOptions: Array<{ value: string; label: string }> = [
    { value: 'asc', label: 'Ascending' },
    { value: 'desc', label: 'Descending' },
  ]

  return (
    <section className="space-y-6">
      <PageHeader
        title="Clinics"
        description="Manage clinic locations, contact information, and working hours."
        image={{
          src: clinicIcon,
          alt: 'clinic',
          className: 'w-[120px] h-[120px]',
        }}
        actionButton={{
          label: 'Add Clinic',
          onClick: () => navigate('/clinics/add'),
          icon: <PlusIcon />,
          className:
            'mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-100 to-green-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-green-200 hover:to-green-300 dark:from-green-900 dark:to-green-800 dark:text-slate-200 dark:hover:from-green-800/50 dark:hover:to-green-700/50',
        }}
        searchSlot={
          <input
            type="text"
            placeholder="Search by name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400"
          />
        }
        filterControls={[
          {
            id: 'sortBy',
            type: 'dropdown',
            label: 'Sort by',
            value: sortBy || '',
            options: sortByOptions,
            onChange: (value) => setSortBy((value || '') as any),
            buttonRef: sortByButtonRef,
          },
          ...(sortBy
            ? [
                {
                  id: 'sortOrder',
                  type: 'dropdown' as const,
                  label: 'Order',
                  value: sortOrder,
                  options: sortOrderOptions,
                  onChange: (value: string) => setSortOrder(value as 'asc' | 'desc'),
                  buttonRef: sortOrderButtonRef,
                } as const,
              ]
            : []),
        ]}
      />

      {isLoading ? (
        <RotatingSpinner />
      ) : clinics.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          {search.trim()
            ? 'No clinics found matching your search.'
            : 'No clinics available. Use the button above to add new clinic locations.'}
        </div>
      ) : (
        <>
          <Table
            columns={[
              {
                key: 'slNo',
                header: 'SL No',
                render: (_, index) => ((currentPage - 1) * limit) + index + 1,
                className: 'text-center',
              },
              {
                key: 'name',
                header: 'Name',
                render: (clinic) => clinic.name,
                className: 'text-left',
              },
              {
                key: 'clinicId',
                header: 'Clinic ID',
                render: (clinic) => clinic.clinicId || '-',
                className: 'text-center',
              },
              {
                key: 'isActive',
                header: 'Status',
                render: (clinic) => (
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      clinic.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {clinic.isActive ? 'Active' : 'Inactive'}
                  </span>
                ),
                className: 'text-center',
              },
              {
                key: 'city',
                header: 'City',
                render: (clinic) => clinic.city || '-',
                className: 'text-center',
              },
              {
                key: 'numOfPatients',
                header: 'Num of Patients',
                render: (clinic) => clinic.numOfPatients,
                className: 'text-center',
              },
              {
                key: 'onGoingTreatments',
                header: 'Ongoing',
                render: (clinic) => clinic.onGoingTreatments,
                className: 'text-center',
              },
              {
                key: 'completedTreatments',
                header: 'Completed',
                render: (clinic) => clinic.completedTreatments,
                className: 'text-center',
              },
            ]}
            data={clinics}
            onRowClick={(clinic) => navigate(`/clinics/${clinic.id}`)}
            emptyMessage={
              search.trim()
                ? 'No clinics found matching your search.'
                : 'No clinics available. Use the button above to add new clinic locations.'
            }
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-between rounded-2xl bg-white/60 p-4 backdrop-blur-sm dark:bg-slate-900/60">
              <div className="text-sm text-slate-600 dark:text-slate-300">
                Showing {((currentPage - 1) * limit) + 1} to{' '}
                {Math.min(currentPage * limit, total)} of {total} clinics
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

