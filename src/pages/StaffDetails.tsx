import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import PageHeader from '@components/common/PageHeader'
import RotatingSpinner from '@components/spinner/TeethRotating'
import ConfirmationModal from '@components/common/ConfirmationModal'
import clinicIcon from '@assets/clinic.png'
import noprofile from '@assets/noprofile.png'
import { getStaffById, updateStaff, type StaffMember } from '@api/staff'

export default function StaffDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [staff, setStaff] = useState<StaffMember | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)

  const fetchStaff = async () => {
    if (!id) return

    try {
      setIsLoading(true)
      const data = await getStaffById(id)
      setStaff(data)
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to fetch staff details. Please try again.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [id])

  const handleToggleStatus = () => {
    setStatusModalOpen(true)
  }

  const confirmToggleStatus = async () => {
    if (!id || !staff || isTogglingStatus) return

    try {
      setIsTogglingStatus(true)
      await updateStaff(id, {
        isActive: !staff.isActive,
      })
      toast.success(`Staff marked as ${!staff.isActive ? 'active' : 'inactive'} successfully.`)
      setStatusModalOpen(false)
      await fetchStaff()
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to update staff status. Please try again.'
      toast.error(message)
    } finally {
      setIsTogglingStatus(false)
    }
  }

  if (isLoading) {
    return <RotatingSpinner />
  }

  if (!staff) {
    return (
      <section className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          Staff not found.
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Staff Details"
        description="Review staff information and assignments."
        image={{
          src: clinicIcon,
          alt: 'Staff member',
          className: 'w-[120px] h-[120px]',
        }}
        actionButtons={[
          {
            label: 'Edit',
            onClick: () => navigate(`/staff/edit/${id}`),
            className:
              'inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-blue-200 hover:to-blue-300 dark:from-blue-800/30 dark:to-blue-700/30 dark:text-slate-200 dark:hover:from-blue-700/40 dark:hover:to-blue-600/40',
          },
          {
            label: staff.isActive ? 'Set Inactive' : 'Set Active',
            onClick: handleToggleStatus,
            disabled: isTogglingStatus,
            isLoading: isTogglingStatus,
            loadingLabel: staff.isActive ? 'Deactivating...' : 'Activating...',
            className: `inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
              staff.isActive
                ? 'bg-gradient-to-r from-orange-100 to-orange-200 hover:from-orange-200 hover:to-orange-300 dark:from-orange-800/30 dark:to-orange-700/30 dark:text-slate-200 dark:hover:from-orange-700/40 dark:hover:to-orange-600/40'
                : 'bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 dark:from-green-800/30 dark:to-green-700/30 dark:text-slate-200 dark:hover:from-green-700/40 dark:hover:to-green-600/40'
            }`,
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="h-24 w-24 rounded-full overflow-hidden mb-4">
                  <img
                    src={noprofile}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white text-center">
                  {staff.name || staff.username || 'Staff Member'}
                </h2>
                {staff.username && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    @{staff.username}
                  </p>
                )}
              </div>

              <div className="space-y-4 border-t border-slate-200 pt-4 dark:border-slate-700">
                <div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                    Status
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      staff.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {staff.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {staff.clinicName && (
                  <div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                      Clinic
                    </span>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {staff.clinicName}
                    </p>
                  </div>
                )}

                {staff.clinicId && !staff.clinicName && (
                  <div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                      Clinic ID
                    </span>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {staff.clinicId}
                    </p>
                  </div>
                )}

                {staff.id && (
                  <div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                      Staff ID
                    </span>
                    <p className="text-sm font-mono text-slate-900 dark:text-white">
                      {staff.id}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                    Username
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {staff.username}
                  </p>
                </div>

                {staff.name && (
                  <div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                      Name
                    </span>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {staff.name}
                    </p>
                  </div>
                )}
              </div>

              {staff.clinicName && (
                <div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                    Assigned Clinic
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {staff.clinicName}
                  </p>
                </div>
              )}

              {staff.clinicId && !staff.clinicName && (
                <div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                    Clinic ID
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {staff.clinicId}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onConfirm={confirmToggleStatus}
        title="Change Staff Status"
        message={
          staff
            ? `Are you sure you want to mark "${staff.name || staff.username}" as ${!staff.isActive ? 'active' : 'inactive'}?`
            : `Are you sure you want to change the staff status?`
        }
        confirmText={isTogglingStatus ? (staff?.isActive ? 'Deactivating...' : 'Activating...') : 'Confirm'}
        cancelText="Cancel"
        confirmButtonClassName="bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400 disabled:opacity-50"
      />
    </section>
  )
}


