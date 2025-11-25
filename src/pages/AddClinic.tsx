import { useMemo, useState, useEffect, type ChangeEvent, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  createClinic,
  getClinic,
  updateClinic,
  type ClinicPayload,
} from '@api/clinics'
import { getTreatmentNames, type TreatmentName } from '@api/treatments'
import { S3Service } from '@services/s3Service'
import ClinicCard from '@components/clinic/ClinicCard'
import { useDebounce } from '@hooks/utils/useDebounce'

type WorkingDayForm = {
  day: string
  startTime: string
  endTime: string
}

type ClinicFormState = {
  name: string
  address: string
  city: string
  state: string
  pincode: string
  phone: string
  email: string
  website: string
  locationUrl: string
  workingDays: WorkingDayForm[]
  currentWorkingDay: WorkingDayForm
  treatments: string[]
  images: string[]
  notes: string
  isActive: boolean
}

const createBlankForm = (): ClinicFormState => ({
  name: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  phone: '',
  email: '',
  website: '',
  locationUrl: '',
  workingDays: [],
  currentWorkingDay: {
    day: '',
    startTime: '09:00',
    endTime: '18:00',
  },
  treatments: [],
  images: [],
  notes: '',
  isActive: true,
})

const SectionCard = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="flex flex-col gap-5 rounded-2xl bg-white/60 p-6 backdrop-blur-sm transition-shadow hover:shadow-md dark:bg-slate-900/60">
    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
      {title}
    </h3>
    {children}
  </div>
)

const labelStyles = 'block text-xs font-medium text-slate-600 mb-1.5 dark:text-slate-300'
const inputStyles =
  'w-full bg-transparent border-0 border-b-2 border-slate-200 px-0 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400'
const textareaStyles =
  'w-full bg-transparent border-0 border-b-2 border-slate-200 px-0 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 resize-none dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400'

const daysOfWeek = [
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday', label: 'Thursday' },
  { value: 'Friday', label: 'Friday' },
  { value: 'Saturday', label: 'Saturday' },
  { value: 'Sunday', label: 'Sunday' },
]

export default function AddClinic() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditMode = !!id
  const [form, setForm] = useState<ClinicFormState>(() => createBlankForm())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [pendingImages, setPendingImages] = useState<File[]>([])
  const [pendingImagePreviews, setPendingImagePreviews] = useState<string[]>([])
  const [availableTreatments, setAvailableTreatments] = useState<TreatmentName[]>([])
  const [treatmentSearch, setTreatmentSearch] = useState('')
  const debouncedTreatmentSearch = useDebounce(treatmentSearch, 500)

  useEffect(() => {
    const previews = pendingImages.map((file) => URL.createObjectURL(file))
    setPendingImagePreviews(previews)

    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [pendingImages])

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        const params: { search?: string } = {}
        if (debouncedTreatmentSearch.trim()) {
          params.search = debouncedTreatmentSearch.trim()
        }
        const treatments = await getTreatmentNames(params)
        setAvailableTreatments(treatments)
      } catch (error) {
        console.error('Failed to fetch treatments:', error)
      }
    }
    fetchTreatments()
  }, [debouncedTreatmentSearch])

  useEffect(() => {
    if (isEditMode && id) {
      const fetchClinic = async () => {
        try {
          setIsLoading(true)
          const clinic = await getClinic(id)
          const treatmentIds =
            clinic.treatments?.map((t) => (typeof t === 'string' ? t : t.id)) || []

          setForm({
            name: clinic.name || '',
            address: clinic.address || '',
            city: clinic.city || '',
            state: clinic.state || '',
            pincode: clinic.pincode || '',
            phone: clinic.phone || '',
            email: clinic.email || '',
            website: clinic.website || '',
            locationUrl: clinic.locationUrl || '',
            workingDays:
              clinic.workingDays?.map((wd) => ({
                day: wd.day || '',
                startTime: wd.startTime || '',
                endTime: wd.endTime || '',
              })) || [],
            currentWorkingDay: {
              day: '',
              startTime: '09:00',
              endTime: '18:00',
            },
            treatments: treatmentIds,
            images: clinic.images || [],
            notes: clinic.notes || '',
            isActive: clinic.isActive ?? true,
          })
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error?.message ||
            error?.response?.data?.message ||
            error?.message ||
            'Unable to fetch clinic. Please try again.'
          toast.error(errorMessage)
          navigate('/clinics')
        } finally {
          setIsLoading(false)
        }
      }
      fetchClinic()
    }
  }, [isEditMode, id, navigate])

  const validateEmail = (email: string): boolean => {
    if (!email.trim()) return true
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return true
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleFieldChange = (field: keyof ClinicFormState, value: any) => {
    if (field === 'phone') {
      const numericValue = value.replace(/\D/g, '')
      setForm((prev) => ({ ...prev, [field]: numericValue }))
      return
    }
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleWorkingDayFieldChange = (field: keyof WorkingDayForm, value: string) => {
    setForm((prev) => {
      const updatedWorkingDay = { ...prev.currentWorkingDay, [field]: value }
      if (field === 'day' && value && !prev.currentWorkingDay.startTime && !prev.currentWorkingDay.endTime) {
        updatedWorkingDay.startTime = '09:00'
        updatedWorkingDay.endTime = '18:00'
      }
      return {
        ...prev,
        currentWorkingDay: updatedWorkingDay,
      }
    })
  }

  const addWorkingDay = () => {
    if (!form.currentWorkingDay.day) {
      toast.error('Please select a day.')
      return
    }
    const dayExists = form.workingDays.some(
      (wd) => wd.day === form.currentWorkingDay.day
    )
    if (dayExists) {
      toast.error('This day has already been added.')
      return
    }
    setForm((prev) => ({
      ...prev,
      workingDays: [...prev.workingDays, prev.currentWorkingDay],
      currentWorkingDay: {
        day: '',
        startTime: '09:00',
        endTime: '18:00',
      },
    }))
  }

  const removeWorkingDay = (index: number) => {
    setForm((prev) => ({
      ...prev,
      workingDays: prev.workingDays.filter((_, i) => i !== index),
    }))
  }

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files?.length) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxFileSize = 5 * 1024 * 1024
    const validFiles: File[] = []

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        event.target.value = ''
        return
      }

      if (file.size > maxFileSize) {
        toast.error('File size must be less than 5MB')
        event.target.value = ''
        return
      }

      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPEG, PNG, and WebP images are allowed')
        event.target.value = ''
        return
      }

      validFiles.push(file)
    }

    setPendingImages((prev) => [...prev, ...validFiles])
    event.target.value = ''
  }

  const removePendingImage = (index: number) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.name.trim()) {
      toast.error('Name is required.')
      return
    }

    if (form.email.trim() && !validateEmail(form.email)) {
      toast.error('Please enter a valid email address.')
      return
    }

    if (form.website.trim() && !validateUrl(form.website)) {
      toast.error('Please enter a valid website URL.')
      return
    }

    if (form.locationUrl.trim() && !validateUrl(form.locationUrl)) {
      toast.error('Please enter a valid location URL.')
      return
    }

    setIsSubmitting(true)
    setIsUploadingImages(true)

    try {
      const uploadedUrls: string[] = [...form.images]

      if (pendingImages.length > 0) {
        for (const file of pendingImages) {
          const { publicUrl } = await S3Service.uploadImage('Clinic-Images', file)
          if (publicUrl) {
            uploadedUrls.push(publicUrl)
          }
        }
      }

      setIsUploadingImages(false)

      const payload: ClinicPayload = {
        name: form.name.trim(),
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        pincode: form.pincode.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        website: form.website.trim() || undefined,
        locationUrl: form.locationUrl.trim() || undefined,
        workingDays:
          form.workingDays.length > 0
            ? form.workingDays.map((wd) => ({
                day: wd.day,
                startTime: wd.startTime.trim() || undefined,
                endTime: wd.endTime.trim() || undefined,
              }))
            : undefined,
        treatments: form.treatments.length > 0 ? form.treatments : undefined,
        images: uploadedUrls.length > 0 ? uploadedUrls : undefined,
        notes: form.notes.trim() || undefined,
        isActive: form.isActive,
      }

      if (isEditMode && id) {
        await updateClinic(id, payload)
        toast.success('Clinic updated successfully.')
      } else {
        await createClinic(payload)
        toast.success('Clinic created successfully.')
        setForm(createBlankForm())
        setPendingImages([])
      }
      setTimeout(() => navigate('/clinics'), 800)
    } catch (error: any) {
      setIsUploadingImages(false)
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to save clinic. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const summaryData = useMemo(
    () => {
      const treatmentMap = new Map(availableTreatments.map((t) => [t.id, t.name]))
      const treatmentsWithNames = form.treatments
        .map((id) => {
          const name = treatmentMap.get(id)
          return name ? { id, name } : null
        })
        .filter((t): t is { id: string; name: string } => t !== null)

      return {
        name: form.name,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        phone: form.phone,
        email: form.email,
        website: form.website,
        locationUrl: form.locationUrl,
        workingDays: form.workingDays.map((wd) => ({
          day: wd.day,
          startTime: wd.startTime,
          endTime: wd.endTime,
        })),
        treatments: treatmentsWithNames,
        images: form.images,
        notes: form.notes,
        isActive: form.isActive,
      }
    },
    [form, availableTreatments]
  )

  const toggleTreatment = (treatmentId: string) => {
    setForm((prev) => ({
      ...prev,
      treatments: prev.treatments.includes(treatmentId)
        ? prev.treatments.filter((id) => id !== treatmentId)
        : [...prev.treatments, treatmentId],
    }))
  }

  if (isLoading) {
    return (
      <section className="flex items-center justify-center space-y-6">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl bg-white/60 p-6 backdrop-blur-sm dark:bg-slate-900/60 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isEditMode ? 'Edit Clinic' : 'Add Clinic'}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {isEditMode
              ? 'Update clinic location details.'
              : 'Add a new clinic location with contact information and working hours.'}
          </p>
        </div>
        <button
          type="submit"
          form="add-clinic-form"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-600/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              {isEditMode ? 'Updating...' : 'Saving...'}
            </>
          ) : (
            isEditMode ? 'Update Clinic' : 'Save Clinic'
          )}
        </button>
      </div>
      <form id="add-clinic-form" onSubmit={submitForm} className="space-y-8">
        <div className="flex flex-col gap-8 xl:flex-row">
          <div className="flex flex-1 flex-col gap-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3">
              <SectionCard title="Basic Information">
                <div className="space-y-5">
                  <div>
                    <label className={labelStyles}>Name*</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        className={inputStyles}
                        value={form.name}
                        onChange={(event) => handleFieldChange('name', event.target.value)}
                        placeholder="Enter clinic name"
                        required
                      />
                      <label className="flex items-center cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={(event) => handleFieldChange('isActive', event.target.checked)}
                            className="sr-only"
                          />
                          <div
                            className={`block w-14 h-8 rounded-full transition-colors ${
                              form.isActive
                                ? 'bg-blue-600 dark:bg-blue-500'
                                : 'bg-slate-300 dark:bg-slate-600'
                            }`}
                          >
                            <div
                              className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                                form.isActive ? 'translate-x-6' : 'translate-x-0'
                              }`}
                            ></div>
                          </div>
                        </div>
                        <span className="ml-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                          Active
                        </span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className={labelStyles}>Address</label>
                    <input
                      type="text"
                      className={inputStyles}
                      value={form.address}
                      onChange={(event) => handleFieldChange('address', event.target.value)}
                      placeholder="Enter street address"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelStyles}>City</label>
                      <input
                        type="text"
                        className={inputStyles}
                        value={form.city}
                        onChange={(event) => handleFieldChange('city', event.target.value)}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className={labelStyles}>State</label>
                      <input
                        type="text"
                        className={inputStyles}
                        value={form.state}
                        onChange={(event) => handleFieldChange('state', event.target.value)}
                        placeholder="State"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelStyles}>Pincode</label>
                    <input
                      type="text"
                      className={inputStyles}
                      value={form.pincode}
                      onChange={(event) => handleFieldChange('pincode', event.target.value)}
                      placeholder="Pincode"
                    />
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Contact Information">
                <div className="space-y-5">
                  <div>
                    <label className={labelStyles}>Phone</label>
                    <input
                      type="tel"
                      className={inputStyles}
                      value={form.phone}
                      onChange={(event) => handleFieldChange('phone', event.target.value)}
                      placeholder="Phone number (numbers only)"
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <label className={labelStyles}>Email</label>
                    <input
                      type="email"
                      className={`${inputStyles} ${
                        form.email.trim() && !validateEmail(form.email)
                          ? 'border-red-500 focus:border-red-500 dark:border-red-500'
                          : ''
                      }`}
                      value={form.email}
                      onChange={(event) => handleFieldChange('email', event.target.value)}
                      placeholder="Email address"
                    />
                    {form.email.trim() && !validateEmail(form.email) && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        Please enter a valid email address
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelStyles}>Website</label>
                    <input
                      type="url"
                      className={`${inputStyles} ${
                        form.website.trim() && !validateUrl(form.website)
                          ? 'border-red-500 focus:border-red-500 dark:border-red-500'
                          : ''
                      }`}
                      value={form.website}
                      onChange={(event) => handleFieldChange('website', event.target.value)}
                      placeholder="https://example.com"
                    />
                    {form.website.trim() && !validateUrl(form.website) && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        Please enter a valid URL (e.g., https://example.com)
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelStyles}>Location URL</label>
                    <input
                      type="url"
                      className={`${inputStyles} ${
                        form.locationUrl.trim() && !validateUrl(form.locationUrl)
                          ? 'border-red-500 focus:border-red-500 dark:border-red-500'
                          : ''
                      }`}
                      value={form.locationUrl}
                      onChange={(event) => handleFieldChange('locationUrl', event.target.value)}
                      placeholder="https://maps.google.com/..."
                    />
                    {form.locationUrl.trim() && !validateUrl(form.locationUrl) && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        Please enter a valid URL (e.g., https://maps.google.com/...)
                      </p>
                    )}
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Working Days">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <select
                      className={inputStyles}
                      value={form.currentWorkingDay.day}
                      onChange={(event) => handleWorkingDayFieldChange('day', event.target.value)}
                    >
                      <option value="">Select day</option>
                      {daysOfWeek
                        .filter(
                          (day) => !form.workingDays.some((wd) => wd.day === day.value)
                        )
                        .map((day) => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                    </select>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="time"
                        className={inputStyles}
                        value={form.currentWorkingDay.startTime}
                        onChange={(event) =>
                          handleWorkingDayFieldChange('startTime', event.target.value)
                        }
                        placeholder="Start time"
                      />
                      <input
                        type="time"
                        className={inputStyles}
                        value={form.currentWorkingDay.endTime}
                        onChange={(event) =>
                          handleWorkingDayFieldChange('endTime', event.target.value)
                        }
                        placeholder="End time"
                      />
                    </div>
                    <button
                      type="button"
                      className="w-full rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400"
                      onClick={addWorkingDay}
                      disabled={!form.currentWorkingDay.day}
                    >
                      Add Day
                    </button>
                  </div>
                  {form.workingDays.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                      {form.workingDays.map((wd, index) => (
                        <div
                          key={`${wd.day}-${index}`}
                          className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800"
                        >
                          <span className="text-slate-700 dark:text-slate-200">
                            {wd.day}: {wd.startTime || '-'} - {wd.endTime || '-'}
                          </span>
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            onClick={() => removeWorkingDay(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </SectionCard>

              <SectionCard title="Treatments">
                <div className="space-y-4">
                  <input
                    type="text"
                    value={treatmentSearch}
                    onChange={(event) => setTreatmentSearch(event.target.value)}
                    placeholder="Search treatments..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400"
                  />
                  {availableTreatments.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {treatmentSearch.trim()
                        ? 'No treatments found matching your search.'
                        : 'No treatments available'}
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {availableTreatments.map((treatment) => {
                        const isSelected = form.treatments.includes(treatment.id)
                        return (
                          <button
                            key={treatment.id}
                            type="button"
                            onClick={() => toggleTreatment(treatment.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                            }`}
                          >
                            {treatment.name}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </SectionCard>

              <SectionCard title="Additional Information">
                <div className="space-y-5">
                  <div>
                    <label className={labelStyles}>Notes</label>
                    <textarea
                      className={`${textareaStyles} min-h-[100px]`}
                      value={form.notes}
                      onChange={(event) => handleFieldChange('notes', event.target.value)}
                      placeholder="Additional notes about this clinic..."
                    />
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Clinic Images">
                <div className="space-y-4">
                  <label
                    htmlFor="clinic-images"
                    className="flex cursor-pointer items-center justify-between rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/50 px-5 py-4 text-sm font-medium text-slate-600 transition-all hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800/30 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:bg-blue-900/20"
                  >
                    <span className="flex items-center gap-2">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Select clinic images
                    </span>
                    <input
                      id="clinic-images"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isSubmitting}
                    />
                    {(form.images.length > 0 || pendingImages.length > 0) && (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                        {form.images.length + pendingImages.length} selected
                      </span>
                    )}
                  </label>
                  {(form.images.length > 0 || pendingImages.length > 0) && (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {form.images.map((image, index) => (
                        <div
                          key={image}
                          className="group relative aspect-square overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800"
                        >
                          <img
                            src={image}
                            alt={`Clinic image ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-xs font-semibold text-slate-700 opacity-0 shadow-md transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 dark:bg-slate-900/95 dark:text-slate-200 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                            onClick={() => {
                              setForm((prev) => ({
                                ...prev,
                                images: prev.images.filter((_, i) => i !== index),
                              }))
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {pendingImages.map((_, index) => (
                        <div
                          key={`pending-${index}`}
                          className="group relative aspect-square overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800"
                        >
                          <img
                            src={pendingImagePreviews[index]}
                            alt={`Pending upload ${index + 1}`}
                            className="h-full w-full object-cover opacity-75"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40">
                            <span className="rounded-full bg-yellow-500 px-2 py-1 text-xs font-semibold text-white">
                              Pending
                            </span>
                          </div>
                          <button
                            type="button"
                            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-xs font-semibold text-slate-700 opacity-0 shadow-md transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 dark:bg-slate-900/95 dark:text-slate-200 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                            onClick={() => removePendingImage(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </SectionCard>
            </div>
          </div>
          <aside className="xl:sticky xl:top-6 xl:h-fit xl:w-96">
            <ClinicCard
              clinic={{
                name: summaryData.name,
                address: summaryData.address,
                city: summaryData.city,
                state: summaryData.state,
                pincode: summaryData.pincode,
                phone: summaryData.phone,
                email: summaryData.email,
                website: summaryData.website,
                locationUrl: summaryData.locationUrl,
                workingDays: summaryData.workingDays,
                treatments: summaryData.treatments,
                images: summaryData.images,
                pendingImages: pendingImages,
                pendingImagePreviews: pendingImagePreviews,
                notes: summaryData.notes,
                isActive: summaryData.isActive,
              }}
            />
          </aside>
        </div>
      </form>
    </section>
  )
}

