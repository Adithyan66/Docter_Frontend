import { useMemo } from 'react'
import PageHeader from '@components/common/PageHeader'
import Table from '@components/common/Table'
import Pagination from '@components/common/Pagination'
import MultiSelectDropdown from '@components/common/MultiSelectDropdown'
import { useReminders } from '@hooks/data/useReminders'
import RotatingSpinner from '@components/spinner/TeethRotating'
import calenderImage from '@assets/calender.png'
import type { VisitReminderResponseDto } from '@api/reminders'

export default function Appointments() {
  const {
    reminders,
    isLoading,
    currentPage,
    totalPages,
    total,
    limit,
    filters,
    treatmentOptions,
    clinicOptions,
    isLoadingOptions,
    activeFilterCount,
    hasPendingChanges,
    treatmentButtonRef,
    clinicButtonRef,
    openDropdown,
    setOpenDropdown,
    setCurrentPage,
    setPendingFilters,
    handleApplyFilters,
    handleClearAllFilters,
    handleRowClick,
    formatDate,
  } = useReminders()

  const columns = useMemo(
    () => [
      {
        key: 'slNo',
        header: 'SL No',
        render: (_: VisitReminderResponseDto, index: number) => {
          return <span className="font-medium">{(currentPage - 1) * limit + index + 1}</span>
        },
        className: 'w-20',
      },
      {
        key: 'patientName',
        header: 'Patient Name',
        render: (reminder: VisitReminderResponseDto) => (
          <span className="font-semibold text-slate-900 dark:text-white">{reminder.patientName}</span>
        ),
        className: 'text-left',
      },
      {
        key: 'treatmentName',
        header: 'Treatment Name',
        render: (reminder: VisitReminderResponseDto) => (
          <span className="text-slate-700 dark:text-slate-300">{reminder.treatmentName}</span>
        ),
        className: 'text-left',
      },
      {
        key: 'clinicName',
        header: 'Clinic Name',
        render: (reminder: VisitReminderResponseDto) => (
          <span className="text-slate-700 dark:text-slate-300">
            {reminder.clinicName || '-'}
          </span>
        ),
        className: 'text-left',
      },
      {
        key: 'nextVisitDate',
        header: 'Next Visit Date',
        render: (reminder: VisitReminderResponseDto) => (
          <span className="text-slate-700 dark:text-slate-300">{formatDate(reminder.nextVisitDate)}</span>
        ),
        className: 'text-center',
      },
    ],
    [currentPage, limit, formatDate]
  )

  const handleFilterToggle = (filterId: string) => {
    setOpenDropdown(openDropdown === filterId ? null : filterId)
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Appointments"
        description="View and manage upcoming patient visit reminders."
        image={{
          src: calenderImage,
          alt: 'calendar',
          className: 'w-[120px] h-[120px]',
        }}
        filterControls={[
          {
            id: 'daysBefore',
            type: 'custom',
            render: () => (
              <input
                type="number"
                min="0"
                value={filters.daysBefore || ''}
                onChange={(e) =>
                  setPendingFilters((prev) => ({
                    ...prev,
                    daysBefore: e.target.value ? parseInt(e.target.value, 10) : undefined,
                  }))
                }
                placeholder="Days Before"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 w-32"
              />
            ),
          },
          {
            id: 'daysAfter',
            type: 'custom',
            render: () => (
              <input
                type="number"
                min="0"
                value={filters.daysAfter || ''}
                onChange={(e) =>
                  setPendingFilters((prev) => ({
                    ...prev,
                    daysAfter: e.target.value ? parseInt(e.target.value, 10) : undefined,
                  }))
                }
                placeholder="Days After"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 w-32"
              />
            ),
          },
          {
            id: 'treatment',
            type: 'custom',
            render: () => (
              <MultiSelectDropdown
                label="Treatment"
                selectedValues={filters.treatmentIds}
                options={treatmentOptions}
                onChange={(values) =>
                  setPendingFilters((prev) => ({ ...prev, treatmentIds: values }))
                }
                isOpen={openDropdown === 'treatment'}
                onToggle={() => handleFilterToggle('treatment')}
                onClose={() => setOpenDropdown(null)}
                buttonRef={treatmentButtonRef}
                buttonClassName="max-w-[calc((100%-2rem)/5)] min-w-[120px]"
                disabled={isLoadingOptions}
              />
            ),
          },
          {
            id: 'clinic',
            type: 'custom',
            render: () => (
              <MultiSelectDropdown
                label="Clinic"
                selectedValues={filters.clinicIds}
                options={clinicOptions}
                onChange={(values) =>
                  setPendingFilters((prev) => ({ ...prev, clinicIds: values }))
                }
                isOpen={openDropdown === 'clinic'}
                onToggle={() => handleFilterToggle('clinic')}
                onClose={() => setOpenDropdown(null)}
                buttonRef={clinicButtonRef}
                buttonClassName="max-w-[calc((100%-2rem)/5)] min-w-[120px]"
                disabled={isLoadingOptions}
              />
            ),
          },
        ]}
        filterButton={{
          activeCount: activeFilterCount,
        }}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearAllFilters}
        hasPendingChanges={hasPendingChanges}
      />

      {isLoading ? (
        <RotatingSpinner />
      ) : (
        <>
          <Table
            columns={columns}
            data={reminders.map((reminder) => ({ ...reminder, id: reminder.treatmentCourseId }))}
            onRowClick={handleRowClick}
            emptyMessage="No appointments found matching your filters."
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-between rounded-2xl bg-white/60 p-4 backdrop-blur-sm dark:bg-slate-900/60">
              <div className="text-sm text-slate-600 dark:text-slate-300">
                Showing {((currentPage - 1) * limit) + 1} to{' '}
                {Math.min(currentPage * limit, total)} of {total} appointments
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

