import { useState, useEffect, type ChangeEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { createPatient, getClinicNames, type PatientPayload, type ClinicName } from '@api/patients'
import { S3Service } from '@services/s3Service'
import CameraCapture from '@components/common/CameraCapture'

type PatientFormState = {
  firstName: string
  lastName: string
  fullName: string
  address: string
  profilePicUrl: string
  consultationType: 'one-time' | 'treatment-plan' | ''
  primaryClinic: string
  clinics: string[]
  dob: string
  lastVisitAt: string
  age: string
  visitCount: string
  gender: 'male' | 'female' | 'other' | 'unknown'
  phone: string
  email: string
  tags: string[]
  currentTag: string
  isActive: boolean
}

const createBlankForm = (): PatientFormState => ({
  firstName: '',
  lastName: '',
  fullName: '',
  address: '',
  profilePicUrl: '',
  consultationType: '',
  primaryClinic: '',
  clinics: [],
  dob: '',
  lastVisitAt: '',
  age: '',
  visitCount: '',
  gender: 'unknown',
  phone: '',
  email: '',
  tags: [],
  currentTag: '',
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

export default function AddPatients() {
  const navigate = useNavigate()
  const [form, setForm] = useState<PatientFormState>(() => createBlankForm())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [pendingImage, setPendingImage] = useState<File | null>(null)
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [availableClinics, setAvailableClinics] = useState<ClinicName[]>([])

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const clinics = await getClinicNames()
        setAvailableClinics(clinics)
      } catch (error) {
        console.error('Failed to fetch clinics:', error)
        toast.error('Failed to load clinics')
      }
    }
    fetchClinics()
  }, [])

  useEffect(() => {
    if (pendingImage) {
      const preview = URL.createObjectURL(pendingImage)
      setPendingImagePreview(preview)
      return () => URL.revokeObjectURL(preview)
    } else {
      setPendingImagePreview(null)
    }
  }, [pendingImage])

  const validateEmail = (email: string): boolean => {
    if (!email.trim()) return true
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    if (!phone.trim()) return true
    const phoneRegex = /^\+?[0-9]{7,15}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
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

  const handleFieldChange = (field: keyof PatientFormState, value: any) => {
    if (field === 'phone') {
      const numericValue = value.replace(/\D/g, '')
      setForm((prev) => ({ ...prev, [field]: numericValue }))
      return
    }
    if (field === 'age' || field === 'visitCount') {
      const numericValue = value.replace(/\D/g, '')
      setForm((prev) => ({ ...prev, [field]: numericValue }))
      return
    }
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      event.target.value = ''
      return
    }

    const maxFileSize = 5 * 1024 * 1024
    if (file.size > maxFileSize) {
      toast.error('File size must be less than 5MB')
      event.target.value = ''
      return
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, and WebP images are allowed')
      event.target.value = ''
      return
    }

    setPendingImage(file)
    event.target.value = ''
  }

  const handleCameraCapture = (file: File) => {
    setPendingImage(file)
  }

  const removePendingImage = () => {
    setPendingImage(null)
    setPendingImagePreview(null)
  }

  const addTag = () => {
    if (!form.currentTag.trim()) return
    const trimmedTag = form.currentTag.trim()
    if (form.tags.includes(trimmedTag)) {
      toast.error('Tag already exists')
      return
    }
    setForm((prev) => ({
      ...prev,
      tags: [...prev.tags, trimmedTag],
      currentTag: '',
    }))
  }

  const removeTag = (index: number) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }))
  }

  const toggleClinic = (clinicId: string) => {
    setForm((prev) => ({
      ...prev,
      clinics: prev.clinics.includes(clinicId)
        ? prev.clinics.filter((id) => id !== clinicId)
        : [...prev.clinics, clinicId],
    }))
  }

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.firstName.trim()) {
      toast.error('First name is required.')
      return
    }

    if (!form.consultationType) {
      toast.error('Consultation type is required.')
      return
    }

    if (form.email.trim() && !validateEmail(form.email)) {
      toast.error('Please enter a valid email address.')
      return
    }

    if (form.phone.trim() && !validatePhone(form.phone)) {
      toast.error('Please enter a valid phone number (7-15 digits, optional + prefix).')
      return
    }

    if (form.profilePicUrl.trim() && !validateUrl(form.profilePicUrl)) {
      toast.error('Please enter a valid profile picture URL.')
      return
    }

    setIsSubmitting(true)
    setIsUploadingImage(true)

    try {
      let profilePicUrl = form.profilePicUrl.trim()

      if (pendingImage) {
        const { publicUrl } = await S3Service.uploadImage('patient-profile', pendingImage)
        if (publicUrl && publicUrl.trim().length > 0) {
          profilePicUrl = publicUrl
        }
      }

      setIsUploadingImage(false)

      const payload: PatientPayload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim() || undefined,
        fullName: form.fullName.trim() || undefined,
        address: form.address.trim() || undefined,
        profilePicUrl: profilePicUrl || undefined,
        consultationType: form.consultationType as 'one-time' | 'treatment-plan',
        primaryClinic: form.primaryClinic.trim() || undefined,
        clinics: form.clinics.length > 0 ? form.clinics : undefined,
        dob: form.dob ? new Date(form.dob).toISOString() : undefined,
        lastVisitAt: form.lastVisitAt ? new Date(form.lastVisitAt).toISOString() : undefined,
        age: form.age ? Number(form.age) : undefined,
        visitCount: form.visitCount ? Number(form.visitCount) : undefined,
        gender: form.gender !== 'unknown' ? form.gender : undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim().toLowerCase() || undefined,
        tags: form.tags.length > 0 ? form.tags : undefined,
        isActive: form.isActive,
      }

      const patient = await createPatient(payload)
      toast.success('Patient created successfully.')
      setTimeout(() => navigate(`/patients/${patient.id}`), 800)
    } catch (error: any) {
      setIsUploadingImage(false)
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to create patient. Please try again.'

      if (error?.response?.status === 409) {
        toast.error('Patient ID already exists.')
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="space-y-6">
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
      <div className="flex flex-col gap-4 rounded-2xl bg-white/60 p-6 backdrop-blur-sm dark:bg-slate-900/60 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Add Patient</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Add a new patient with their personal information and consultation details.
          </p>
        </div>
        <button
          type="submit"
          form="add-patient-form"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-600/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              Saving...
            </>
          ) : (
            'Save Patient'
          )}
        </button>
      </div>
      <form id="add-patient-form" onSubmit={submitForm} className="space-y-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3">
          <SectionCard title="Basic Information">
            <div className="space-y-5">
              <div>
                <label className={labelStyles}>First Name*</label>
                <input
                  type="text"
                  className={inputStyles}
                  value={form.firstName}
                  onChange={(event) => handleFieldChange('firstName', event.target.value)}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <label className={labelStyles}>Last Name</label>
                <input
                  type="text"
                  className={inputStyles}
                  value={form.lastName}
                  onChange={(event) => handleFieldChange('lastName', event.target.value)}
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <label className={labelStyles}>Full Name</label>
                <input
                  type="text"
                  className={inputStyles}
                  value={form.fullName}
                  onChange={(event) => handleFieldChange('fullName', event.target.value)}
                  placeholder="Auto-computed if omitted"
                />
              </div>
              <div>
                <label className={labelStyles}>Address</label>
                <textarea
                  className={`${textareaStyles} min-h-[80px]`}
                  value={form.address}
                  onChange={(event) => handleFieldChange('address', event.target.value)}
                  placeholder="Enter address"
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Profile Picture">
            <div className="space-y-4">
              <div className="flex flex-col gap-3">
                <label
                  htmlFor="profile-image"
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-600 transition-all hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800/30 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:bg-blue-900/20"
                >
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
                  Upload Image
                </label>
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="flex items-center justify-center gap-2 rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition-all hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:bg-blue-900/20"
                >
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
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Capture from Camera
                </button>
              </div>
              {(pendingImagePreview || form.profilePicUrl) && (
                <div className="relative aspect-square w-full max-w-[200px] overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                  <img
                    src={pendingImagePreview || form.profilePicUrl}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                  />
                  {pendingImagePreview && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40">
                      <span className="rounded-full bg-yellow-500 px-2 py-1 text-xs font-semibold text-white">
                        Pending
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-xs font-semibold text-slate-700 shadow-md transition-all hover:bg-red-50 hover:text-red-600 dark:bg-slate-900/95 dark:text-slate-200 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                    onClick={removePendingImage}
                  >
                    ×
                  </button>
                </div>
              )}
              <div>
                <label className={labelStyles}>Or enter URL</label>
                <input
                  type="url"
                  className={`${inputStyles} ${
                    form.profilePicUrl.trim() && !validateUrl(form.profilePicUrl)
                      ? 'border-red-500 focus:border-red-500 dark:border-red-500'
                      : ''
                  }`}
                  value={form.profilePicUrl}
                  onChange={(event) => handleFieldChange('profilePicUrl', event.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                {form.profilePicUrl.trim() && !validateUrl(form.profilePicUrl) && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    Please enter a valid URL
                  </p>
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Consultation Details">
            <div className="space-y-5">
              <div>
                <label className={labelStyles}>Consultation Type*</label>
                <select
                  className={inputStyles}
                  value={form.consultationType}
                  onChange={(event) =>
                    handleFieldChange('consultationType', event.target.value)
                  }
                  required
                >
                  <option value="">Select type</option>
                  <option value="one-time">One-time</option>
                  <option value="treatment-plan">Treatment Plan</option>
                </select>
              </div>
              <div>
                <label className={labelStyles}>Primary Clinic</label>
                <select
                  className={inputStyles}
                  value={form.primaryClinic}
                  onChange={(event) => handleFieldChange('primaryClinic', event.target.value)}
                >
                  <option value="">Select primary clinic</option>
                  {availableClinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelStyles}>Additional Clinics</label>
                {availableClinics.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No clinics available
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {availableClinics.map((clinic) => {
                      const isSelected = form.clinics.includes(clinic.id)
                      return (
                        <button
                          key={clinic.id}
                          type="button"
                          onClick={() => toggleClinic(clinic.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                          }`}
                        >
                          {clinic.name}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Personal Details">
            <div className="space-y-5">
              <div>
                <label className={labelStyles}>Date of Birth</label>
                <input
                  type="date"
                  className={inputStyles}
                  value={form.dob}
                  onChange={(event) => handleFieldChange('dob', event.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className={labelStyles}>Age</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={inputStyles}
                  value={form.age}
                  onChange={(event) => handleFieldChange('age', event.target.value)}
                  placeholder="Auto-calculated if DOB provided"
                />
              </div>
              <div>
                <label className={labelStyles}>Gender</label>
                <select
                  className={inputStyles}
                  value={form.gender}
                  onChange={(event) => handleFieldChange('gender', event.target.value)}
                >
                  <option value="unknown">Unknown</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelStyles}>Phone</label>
                <input
                  type="tel"
                  className={`${inputStyles} ${
                    form.phone.trim() && !validatePhone(form.phone)
                      ? 'border-red-500 focus:border-red-500 dark:border-red-500'
                      : ''
                  }`}
                  value={form.phone}
                  onChange={(event) => handleFieldChange('phone', event.target.value)}
                  placeholder="+1234567890 (7-15 digits)"
                />
                {form.phone.trim() && !validatePhone(form.phone) && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    Phone must be 7-15 digits (optional + prefix)
                  </p>
                )}
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
                  placeholder="email@example.com"
                />
                {form.email.trim() && !validateEmail(form.email) && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    Please enter a valid email address
                  </p>
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Visit Information">
            <div className="space-y-5">
              <div>
                <label className={labelStyles}>Last Visit Date</label>
                <input
                  type="datetime-local"
                  className={inputStyles}
                  value={form.lastVisitAt}
                  onChange={(event) => handleFieldChange('lastVisitAt', event.target.value)}
                />
              </div>
              <div>
                <label className={labelStyles}>Visit Count</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={inputStyles}
                  value={form.visitCount}
                  onChange={(event) => handleFieldChange('visitCount', event.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Tags">
            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  className={`${inputStyles} flex-1`}
                  placeholder="Enter a tag..."
                  value={form.currentTag}
                  onChange={(event) => handleFieldChange('currentTag', event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      addTag()
                    }
                  }}
                />
                <button
                  type="button"
                  className="mt-1 h-fit rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400"
                  onClick={addTag}
                  disabled={!form.currentTag.trim()}
                >
                  Add
                </button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {form.tags.map((tag, index) => (
                    <span
                      key={`${tag}-${index}`}
                      className="group flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-200"
                    >
                      {tag}
                      <button
                        type="button"
                        className="text-blue-700 opacity-0 transition-opacity hover:text-blue-900 group-hover:opacity-100 dark:text-blue-200 dark:hover:text-blue-100"
                        onClick={() => removeTag(index)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Status">
            <div className="space-y-5">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => handleFieldChange('isActive', event.target.checked)}
                  className="sr-only"
                />
                <div className="relative">
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
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Active
                </span>
              </label>
            </div>
          </SectionCard>
        </div>
      </form>
    </section>
  )
}
