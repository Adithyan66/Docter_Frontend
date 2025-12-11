import { useMemo } from 'react'
import PageHeader from '@components/common/PageHeader'
import Table from '@components/common/Table'
import Pagination from '@components/common/Pagination'
import MultiSelectDropdown from '@components/common/MultiSelectDropdown'
import AppointmentFilters from '@components/appointment/AppointmentFilters'
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
    pendingModalFilters,
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
    setPendingModalFilters,
    handleApplyFilters,
    handleClearAllFilters,
    handleDelayedFilter,
    activeDelayedFilter,
    handleRowClick,
    formatDate,
    isStaffWithSingleClinic,
    staffSingleClinic,
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
      {
        key: 'status',
        header: 'Status',
        render: (reminder: VisitReminderResponseDto) => {
          const visitDate = new Date(reminder.nextVisitDate)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          visitDate.setHours(0, 0, 0, 0)
          
          const diffTime = visitDate.getTime() - today.getTime()
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
          
          if (diffDays === 0) {
            return (
              <span className="font-medium text-blue-600 dark:text-blue-400">Today</span>
            )
          } else if (diffDays > 0) {
            return (
              <span className="font-medium text-green-600 dark:text-green-400">
                In {diffDays} {diffDays === 1 ? 'day' : 'days'}
              </span>
            )
          } else {
            const daysDelayed = Math.abs(diffDays)
            return (
              <span className="font-medium text-red-600 dark:text-red-400">
                {daysDelayed} {daysDelayed === 1 ? 'day' : 'days'} delayed
              </span>
            )
          }
        },
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
        actionButtons={[
          {
            label: '5-30 Days Delayed',
            onClick: () => handleDelayedFilter('5-30'),
            className: activeDelayedFilter === '5-30'
              ? 'inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-100 to-red-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-red-200 hover:to-red-300 dark:from-red-800/30 dark:to-red-700/30 dark:text-slate-200 dark:hover:from-red-700/40 dark:hover:to-red-600/40 border-2 border-red-500 dark:border-red-400'
              : 'inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-100 to-red-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-red-200 hover:to-red-300 dark:from-red-800/30 dark:to-red-700/30 dark:text-slate-200 dark:hover:from-red-700/40 dark:hover:to-red-600/40',
          },
          {
            label: '30-60 Days Delayed',
            onClick: () => handleDelayedFilter('30-60'),
            className: activeDelayedFilter === '30-60'
              ? 'inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-100 to-orange-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-orange-200 hover:to-orange-300 dark:from-orange-800/30 dark:to-orange-700/30 dark:text-slate-200 dark:hover:from-orange-700/40 dark:hover:to-orange-600/40 border-2 border-orange-500 dark:border-orange-400'
              : 'inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-100 to-orange-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-orange-200 hover:to-orange-300 dark:from-orange-800/30 dark:to-orange-700/30 dark:text-slate-200 dark:hover:from-orange-700/40 dark:hover:to-orange-600/40',
          },
          {
            label: '60+ Days Delayed',
            onClick: () => handleDelayedFilter('60+'),
            className: activeDelayedFilter === '60+'
              ? 'inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-100 to-amber-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-amber-200 hover:to-amber-300 dark:from-amber-800/30 dark:to-amber-700/30 dark:text-slate-200 dark:hover:from-amber-700/40 dark:hover:to-amber-600/40 border-2 border-amber-500 dark:border-amber-400'
              : 'inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-100 to-amber-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-amber-200 hover:to-amber-300 dark:from-amber-800/30 dark:to-amber-700/30 dark:text-slate-200 dark:hover:from-amber-700/40 dark:hover:to-amber-600/40',
          },
        ]}
        filterControls={[
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
            render: () =>
              isStaffWithSingleClinic && staffSingleClinic ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Clinic</label>
                  <div className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 max-w-[calc((100%-2rem)/5)] min-w-[120px] cursor-not-allowed opacity-70">
                    {staffSingleClinic.name}
                  </div>
                </div>
              ) : (
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
        filterDrawerContent={({ isOpen, onClose, buttonRef }) => (
          <AppointmentFilters
            isOpen={isOpen}
            onClose={onClose}
            filters={pendingModalFilters}
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

