import { useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import Pagination from '@components/common/Pagination'
import PageHeader from '@components/common/PageHeader'
import Table from '@components/common/Table'
import { useTreatments } from '@hooks/data/useTreatments'
import treatmentLogo from '@assets/treatment.png'
import { PlusIcon } from '@assets/Icons'
import type { TreatmentList, GetTreatmentsParams } from '@api/treatments'
import RotatingSpinner from '@components/spinner/TeethRotating'

export default function Treatments() {
  const navigate = useNavigate()
  const {
    treatments,
    isLoading,
    currentPage,
    totalPages,
    total,
    limit,
    search,
    sortBy,
    sortOrder,
    sortByButtonRef,
    sortOrderButtonRef,
    sortByOptions,
    sortOrderOptions,
    formatCurrency,
    formatDuration,
    handleRowClick,
    setCurrentPage,
    setSearch,
    setSortBy,
    setSortOrder,
  } = useTreatments()

  const columns = useMemo(
    () => [
      {
        key: 'slNo',
        header: 'SL No',
        render: (_: TreatmentList, index: number) => {
          return <span className="font-medium">{(currentPage - 1) * limit + index + 1}</span>
        },
        className: 'w-20',
      },
      {
        key: 'name',
        header: 'Treatment Name',
        render: (treatment: TreatmentList) => (
          <span className="font-semibold text-slate-900 dark:text-white">{treatment.name}</span>
        ),
        className: 'text-left',
      },
      {
        key: 'isActive',
        header: 'Status',
        render: (treatment: TreatmentList) => (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              treatment.isActive
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {treatment.isActive ? 'Active' : 'Inactive'}
          </span>
        ),
        className: 'text-center',
      },
      {
        key: 'avgCost',
        header: 'Average Cost',
        render: (treatment: TreatmentList) => (
          <span className="text-slate-700 dark:text-slate-300">{formatCurrency(treatment.avgFees)}</span>
        ),
      },
      {
        key: 'avgDuration',
        header: 'Average Duration',
        render: (treatment: TreatmentList) => (
          <span className="text-slate-700 dark:text-slate-300">{formatDuration(treatment.avgDuration)}</span>
        ),
      },
      {
        key: 'numberOfPatients',
        header: 'Number of Patients',
        render: (treatment: TreatmentList) => (
          <span className="text-slate-700 dark:text-slate-300">{treatment.numberOfPatients}</span>
        ),
      },
      {
        key: 'ongoing',
        header: 'Ongoing',
        render: (treatment: TreatmentList) => (
          <span className="text-slate-700 dark:text-slate-300">{treatment.ongoing}</span>
        ),
      },
      {
        key: 'completed',
        header: 'Completed',
        render: (treatment: TreatmentList) => (
          <span className="text-slate-700 dark:text-slate-300">{treatment.completed}</span>
        ),
      },
    ],
    [currentPage, limit, formatCurrency, formatDuration]
  )

  return (
    <section className="space-y-6">
      <PageHeader
        title="Treatments"
        description="Manage standard treatments, timelines, and resources."
        image={{
          src: treatmentLogo,
          alt: 'teeth',
          className: 'w-[120px] h-[120px]',
        }}
        actionButton={{
          label: 'Add Treatment',
          onClick: () => navigate('/treatments/add'),
          icon: <PlusIcon />,
          className:
            'mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-100 to-green-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-green-200 hover:to-green-300 dark:from-green-900 dark:to-green-800 dark:text-slate-200 dark:hover:from-green-800/50 dark:hover:to-green-700/50',
        }}
        searchSlot={
          <input
            type="text"
            placeholder="Search by name or description..."
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
            onChange: (value) =>
              setSortBy((value || undefined) as GetTreatmentsParams['sortBy']),
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
      ) : (
        <>
          <Table
            columns={columns}
            data={treatments}
            onRowClick={handleRowClick}
            emptyMessage={
              search.trim()
                ? 'No treatments found matching your search.'
                : 'No treatments available. Use the button above to add new treatment templates.'
            }
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-between rounded-2xl bg-white/60 p-4 backdrop-blur-sm dark:bg-slate-900/60">
              <div className="text-sm text-slate-600 dark:text-slate-300">
                Showing {((currentPage - 1) * limit) + 1} to{' '}
                {Math.min(currentPage * limit, total)} of {total} treatments
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
