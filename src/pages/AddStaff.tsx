import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import PageHeader from '@components/common/PageHeader'
import DropdownFilter from '@components/common/DropdownFilter'
import RotatingSpinner from '@components/spinner/TeethRotating'
import clinicIcon from '@assets/clinic.png'
import { createStaff, updateStaff, getStaffById } from '@api/staff'
import { getClinicNames, type ClinicName } from '@api/clinics'

const labelStyles = 'block text-xs font-medium text-slate-600 mb-1.5 dark:text-slate-300'
const inputStyles =
  'w-full bg-transparent border-0 border-b-2 border-slate-200 px-0 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400'

export default function AddStaff() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditMode = !!id
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [clinicId, setClinicId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [clinics, setClinics] = useState<ClinicName[]>([])
  const [clinicDropdownOpen, setClinicDropdownOpen] = useState(false)
  const clinicButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const data = await getClinicNames()
        setClinics(data)
      } catch (error: any) {
        const message =
          error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          'Unable to load clinics.'
        toast.error(message)
      }
    }

    fetchClinics()
  }, [])

  useEffect(() => {
    const fetchStaff = async () => {
      if (!isEditMode || !id) return

      try {
        setIsLoading(true)
        const staff = await getStaffById(id)
        setUsername(staff.username)
        setClinicId(staff.clinicId || '')
        // Password fields remain empty in edit mode
      } catch (error: any) {
        const message =
          error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          'Unable to load staff details.'
        toast.error(message)
        navigate('/staff')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStaff()
  }, [isEditMode, id, navigate])

  const clinicOptions = [
    { value: '', label: 'Select clinic' },
    ...clinics.map((clinic) => ({ value: clinic.id, label: clinic.name })),
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim() || !clinicId.trim()) {
      toast.error('Please fill all required fields.')
      return
    }

    // Password validation only for create mode or if password is provided in edit mode
    if (!isEditMode) {
      if (!password.trim()) {
        toast.error('Please fill all required fields.')
        return
      }
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters.')
        return
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match.')
        return
      }
    } else {
      // In edit mode, password is optional
      if (password.trim()) {
        if (password.length < 6) {
          toast.error('Password must be at least 6 characters.')
          return
        }
        if (password !== confirmPassword) {
          toast.error('Passwords do not match.')
          return
        }
      }
    }

    try {
      setIsSubmitting(true)
      if (isEditMode && id) {
        const updatePayload: any = {
          username: username.trim(),
          clinicId,
        }
        // Only include password if it's provided
        if (password.trim()) {
          updatePayload.password = password.trim()
        }
        await updateStaff(id, updatePayload)
        toast.success('Staff updated successfully.')
      } else {
        await createStaff({
          username: username.trim(),
          password: password.trim(),
          clinicId,
        })
        toast.success('Staff created successfully.')
      }
      navigate('/staff')
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        (isEditMode ? 'Unable to update staff. Please try again.' : 'Unable to create staff. Please try again.')
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <RotatingSpinner />
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title={isEditMode ? 'Edit Staff' : 'Add Staff'}
        description={isEditMode ? 'Update clinic staff account information.' : 'Create a new clinic staff account.'}
        image={{
          src: clinicIcon,
          alt: 'Add staff',
          className: 'w-[120px] h-[120px]',
        }}
      />

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl bg-white/60 p-6 backdrop-blur-sm dark:bg-slate-900/60"
      >
        <div className="space-y-5">
          <div>
            <label className={labelStyles}>
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className={inputStyles}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className={labelStyles}>
                Password {!isEditMode && <span className="text-red-500">*</span>}
                {isEditMode && <span className="text-slate-400 text-xs ml-1">(optional)</span>}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEditMode ? "Leave blank to keep current password" : "Enter password (min 6 chars)"}
                className={inputStyles}
                required={!isEditMode}
              />
            </div>
            <div>
              <label className={labelStyles}>
                Confirm Password {!isEditMode && <span className="text-red-500">*</span>}
                {isEditMode && <span className="text-slate-400 text-xs ml-1">(optional)</span>}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={isEditMode ? "Re-enter password if changing" : "Re-enter password"}
                className={inputStyles}
                required={!isEditMode}
              />
            </div>
          </div>

          <div>
            <label className={labelStyles}>
              Clinic <span className="text-red-500">*</span>
            </label>
            <DropdownFilter
              label="Select clinic"
              value={clinicId}
              options={clinicOptions}
              onChange={(value) => setClinicId(value)}
              isOpen={clinicDropdownOpen}
              onToggle={() => setClinicDropdownOpen(!clinicDropdownOpen)}
              onClose={() => setClinicDropdownOpen(false)}
              buttonRef={clinicButtonRef}
              buttonClassName="!w-full !flex !items-center !justify-between !gap-2 !bg-transparent !border-0 !border-b-2 !border-slate-200 !px-0 !py-2.5 !text-sm !text-slate-900 !outline-none !transition-colors focus:!border-blue-500 dark:!border-slate-700 dark:!text-slate-100 dark:focus:!border-blue-400 hover:!bg-transparent !rounded-none !font-normal !shadow-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-700">
          <button
            type="button"
            onClick={() => navigate('/staff')}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-slate-100 to-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-slate-200 hover:to-slate-300 disabled:cursor-not-allowed disabled:opacity-60 dark:from-slate-800/30 dark:to-slate-700/30 dark:text-slate-200 dark:hover:from-slate-700/40 dark:hover:to-slate-600/40"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-100 to-green-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-green-200 hover:to-green-300 disabled:cursor-not-allowed disabled:opacity-60 dark:from-green-800/30 dark:to-green-700/30 dark:text-slate-200 dark:hover:from-green-700/40 dark:hover:to-green-600/40"
          >
            {isSubmitting && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-700 border-t-transparent dark:border-slate-200"></span>
            )}
            {isEditMode ? 'Update Staff' : 'Create Staff'}
          </button>
        </div>
      </form>
    </section>
  )
}


