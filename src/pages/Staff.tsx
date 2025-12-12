import { useNavigate } from 'react-router-dom'
import Pagination from '@components/common/Pagination'
import PageHeader from '@components/common/PageHeader'
import Table from '@components/common/Table'
import { useStaff } from '@hooks/data/useStaff'
import clinicIcon from '@assets/clinic.png'
import { PlusIcon } from '@assets/Icons'
import RotatingSpinner from '@components/spinner/TeethRotating'

export default function Staff() {
  const navigate = useNavigate()
  const { staff, isLoading, currentPage, totalPages, total, limit, search, setCurrentPage, setSearch } = useStaff()

  const emptyMessage = search.trim()
    ? 'No staff found for this search.'
    : 'No staff available.'

  return (
    <section className="space-y-6">
      <PageHeader
        title="Clinic Staffs"
        description="Manage clinic staff members and their assignments."
        image={{
          src: clinicIcon,
          alt: 'Clinic staffs',
          className: 'w-[120px] h-[120px]',
        }}
        actionButton={{
          label: 'Add Staff',
          icon: <PlusIcon />,
          onClick: () => navigate('/staff/add'),
        }}
        searchSlot={
          <input
            type="text"
            placeholder="Search by username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400"
          />
        }
      />

      {isLoading ? (
        <RotatingSpinner />
      ) : (
        <>
          <Table
            columns={[
              {
                key: 'slNo',
                header: 'SL No',
                render: (_, index) => (currentPage - 1) * limit + index + 1,
                className: 'text-center',
              },
              {
                key: 'name',
                header: 'Name',
                render: (member) => member.name || member.username || '-',
                className: 'text-left',
              },
              {
                key: 'clinics',
                header: 'Clinics',
                render: (member) => member.clinicName || '-',
                className: 'text-center',
              },
              {
                key: 'status',
                header: 'Status',
                render: (member) => (
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      member.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {member.isActive ? 'Active' : 'Inactive'}
                  </span>
                ),
                className: 'text-center',
              },
            ]}
            data={staff}
            onRowClick={(member) => navigate(`/staff/${member.id}`)}
            emptyMessage={emptyMessage}
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-between rounded-2xl bg-white/60 p-4 backdrop-blur-sm dark:bg-slate-900/60">
              <div className="text-sm text-slate-600 dark:text-slate-300">
                Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, total)} of {total} staff
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </>
      )}
    </section>
  )
}


